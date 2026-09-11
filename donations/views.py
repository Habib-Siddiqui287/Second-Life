from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from django.core.files.storage import default_storage

from donations.models import Category, Donation, DonationImage, SavedItem
from donations.serializers import (
    CategorySerializer, DonationListSerializer, DonationDetailSerializer,
    DonationCreateSerializer, SavedItemSerializer, DonationImageSerializer
)
from accounts.permissions import IsAdmin, IsDonor, IsOwnerOrAdmin
from services.matching_service import MatchingService

class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        return Response(CategorySerializer(categories, many=True).data)

class DonationListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Donation.objects.all().select_related('category', 'donor').prefetch_related('images', 'saved_by_users')

        # Status filter (default to AVAILABLE for public marketplace unless specified)
        status_param = request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status=status_param.upper())
        elif not status_param:
            queryset = queryset.filter(status='AVAILABLE')

        # Category filter (by slug or name or id)
        cat = request.query_params.get('category')
        if cat and cat.lower() != 'all':
            queryset = queryset.filter(Q(category__slug__iexact=cat) | Q(category__name__iexact=cat))

        # Condition filter
        condition = request.query_params.get('condition')
        if condition and condition.upper() != 'ALL':
            queryset = queryset.filter(condition=condition.upper())

        # City / Location filter
        city = request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)

        # Delivery option
        delivery_opt = request.query_params.get('delivery')
        if delivery_opt and delivery_opt.upper() != 'ALL':
            queryset = queryset.filter(delivery_option=delivery_opt.upper())

        # Search query
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )

        # Sorting
        sort = request.query_params.get('sort', '-created_at')
        if sort in ['-created_at', 'created_at', 'title', '-title']:
            queryset = queryset.order_by(sort)
        else:
            queryset = queryset.order_by('-created_at')

        serializer = DonationListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required to create a donation.'}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role not in ['DONOR', 'ADMIN']:
            return Response({'error': 'Only donors can list donation items.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = DonationCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            donation = serializer.save()
            return Response(DonationDetailSerializer(donation, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DonationDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            donation = Donation.objects.select_related('category', 'donor', 'donor__profile').prefetch_related('images', 'saved_by_users').get(pk=pk)
            # Increment view count
            Donation.objects.filter(pk=pk).update(views_count=donation.views_count + 1)
            return Response(DonationDetailSerializer(donation, context={'request': request}).data)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            donation = Donation.objects.get(pk=pk)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'You do not have permission to edit this donation.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = DonationCreateSerializer(donation, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response(DonationDetailSerializer(updated, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            donation = Donation.objects.get(pk=pk)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if donation.donor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'You do not have permission to delete this donation.'}, status=status.HTTP_403_FORBIDDEN)

        donation.status = Donation.Status.CANCELLED
        donation.save(update_fields=['status'])
        return Response({'message': 'Donation marked as cancelled.'})

class MyDonationsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Donation.objects.filter(donor=request.user).select_related('category').prefetch_related('images', 'requests')
        status_param = request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status=status_param.upper())

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        serializer = DonationListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

class RecommendedDonationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'RECEIVER':
            # For donors or admins, show general featured available donations
            items = Donation.objects.filter(status='AVAILABLE')[:6]
            serializer = DonationListSerializer(items, many=True, context={'request': request})
            return Response(serializer.data)

        recommendations = MatchingService.get_recommendations_for_receiver(request.user, limit=6)
        results = []
        for rec in recommendations:
            serialized_donation = DonationListSerializer(rec['donation'], context={'request': request}).data
            serialized_donation['match_score'] = rec['match_score']
            serialized_donation['match_percentage'] = rec['match_percentage']
            serialized_donation['match_factors'] = rec['match_factors']
            results.append(serialized_donation)

        return Response(results)

class SavedItemToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            donation = Donation.objects.get(pk=pk)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        saved, created = SavedItem.objects.get_or_create(user=request.user, donation=donation)
        if not created:
            saved.delete()
            return Response({'saved': False, 'message': 'Removed from saved items.'})
        return Response({'saved': True, 'message': 'Saved to your bookmarks! 💚'})

class SavedItemListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        saved = SavedItem.objects.filter(user=request.user).select_related('donation', 'donation__category', 'donation__donor')
        serializer = SavedItemSerializer(saved, many=True, context={'request': request})
        return Response(serializer.data)

class UploadDonationImageView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'No image file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 5MB)
        if file_obj.size > 5 * 1024 * 1024:
            return Response({'error': 'Image file size exceeds 5MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        valid_extensions = ['.png', '.jpg', '.jpeg', '.webp']
        import os
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in valid_extensions:
            return Response({'error': 'Unsupported file format. Please upload PNG, JPG, or WEBP.'}, status=status.HTTP_400_BAD_REQUEST)

        saved_path = default_storage.save(f"donations/{file_obj.name}", file_obj)
        file_url = default_storage.url(saved_path)

        return Response({'url': file_url, 'name': file_obj.name})

# Admin views
class AdminDonationListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = Donation.objects.all().select_related('donor', 'category').prefetch_related('images', 'requests')
        status_param = request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status=status_param.upper())

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(donor__name__icontains=search) |
                Q(city__icontains=search)
            )

        serializer = DonationListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
