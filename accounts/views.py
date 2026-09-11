from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q

from accounts.serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer, ProfileUpdateSerializer
)
from accounts.permissions import IsAdmin
from dashboard.models import ActivityLog

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Registration successful!',
                'tokens': tokens,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Please provide both email and password.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)

        if not user:
            # Check if user exists but inactive
            try:
                inactive_user = User.objects.get(email__iexact=email)
                if not inactive_user.is_active:
                    return Response({'error': 'This account has been suspended by administration.'}, status=status.HTTP_403_FORBIDDEN)
            except User.DoesNotExist:
                pass
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'This account has been suspended.'}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        ActivityLog.objects.create(
            user=user,
            action="USER_LOGIN",
            description=f"User {user.name} ({user.email}) logged in successfully."
        )

        return Response({
            'message': 'Login successful',
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        return self.patch(request)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(updated_user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': ['Incorrect current password.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            ActivityLog.objects.create(
                user=user,
                action="PASSWORD_CHANGED",
                description=f"User {user.email} changed their password."
            )
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Please provide an email address.'}, status=status.HTTP_400_BAD_REQUEST)
        # Check if user exists
        user = User.objects.filter(email__iexact=email).first()
        if user:
            ActivityLog.objects.create(
                user=user,
                action="PASSWORD_RESET_REQUEST",
                description=f"Password reset link requested for {email}."
            )
        # Always return success message for security
        return Response({
            'message': 'If an account exists with this email, a password reset link has been dispatched.'
        })

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')
        if not email or not new_password:
            return Response({'error': 'Email and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'error': 'Invalid reset token or email.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password has been reset successfully. You can now login.'})

# Admin user management
class AdminUserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = User.objects.all().select_related('profile', 'organization')
        
        # Filtering
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role.upper())

        account_type = request.query_params.get('account_type')
        if account_type:
            queryset = queryset.filter(account_type=account_type.upper())

        is_active = request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(city__icontains=search)
            )

        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)

class AdminUserDetailView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, pk):
        try:
            user = User.objects.select_related('profile', 'organization').get(pk=pk)
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            user.is_active = bool(request.data['is_active'])
            user.save(update_fields=['is_active'])
            status_word = "activated" if user.is_active else "suspended"
            ActivityLog.objects.create(
                user=request.user,
                action="ADMIN_USER_STATUS_CHANGE",
                description=f"Admin {request.user.name} {status_word} user {user.name} ({user.email})."
            )

        if 'is_verified' in request.data:
            user.is_verified = bool(request.data['is_verified'])
            user.save(update_fields=['is_verified'])

        return Response(UserSerializer(user).data)
