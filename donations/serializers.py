from rest_framework import serializers
from donations.models import Category, Donation, DonationImage, SavedItem
from accounts.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    donations_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description', 'donations_count']

    def get_donations_count(self, obj):
        return obj.donations.filter(status='AVAILABLE').count()

class DonationImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = DonationImage
        fields = ['id', 'image', 'image_url', 'is_primary', 'url']

    def get_url(self, obj):
        if obj.image:
            return obj.image.url
        if obj.image_url:
            return obj.image_url
        return '/images/secondlife_hero.jpeg'

class DonationListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    donor_name = serializers.CharField(source='donor.name', read_only=True)
    donor_initials = serializers.CharField(source='donor.initials', read_only=True)
    donor_account_type = serializers.CharField(source='donor.account_type', read_only=True)
    donor_is_verified = serializers.BooleanField(source='donor.is_verified', read_only=True)
    primary_image = serializers.SerializerMethodField()
    requests_count = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'id', 'title', 'description', 'category', 'condition', 'quantity',
            'delivery_option', 'location', 'city', 'status', 'dimensions',
            'weight', 'views_count', 'donor_name', 'donor_initials',
            'donor_account_type', 'donor_is_verified', 'primary_image',
            'requests_count', 'is_saved', 'match_score', 'created_at'
        ]

    def get_primary_image(self, obj):
        return obj.primary_image_url

    def get_requests_count(self, obj):
        return obj.requests.count()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by_users.filter(user=request.user).exists()
        return False

    def get_match_score(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'RECEIVER':
            from services.matching_service import MatchingService
            res = MatchingService.calculate_match_score(obj, request.user)
            return res['score']
        return None

class DonationDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = DonationImageSerializer(many=True, read_only=True)
    donor = UserSerializer(read_only=True)
    donor_items_count = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    match_details = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'id', 'title', 'description', 'category', 'condition', 'quantity',
            'delivery_option', 'location', 'city', 'status', 'dimensions',
            'weight', 'views_count', 'images', 'donor', 'donor_items_count',
            'is_saved', 'match_details', 'created_at', 'updated_at'
        ]

    def get_donor_items_count(self, obj):
        return obj.donor.donations.filter(status__in=['DELIVERED', 'COMPLETED']).count()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by_users.filter(user=request.user).exists()
        return False

    def get_match_details(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'RECEIVER':
            from services.matching_service import MatchingService
            return MatchingService.calculate_match_score(obj, request.user)
        return None

class DonationCreateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(required=True)
    image_urls = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    class Meta:
        model = Donation
        fields = [
            'id', 'category_id', 'title', 'description', 'condition', 'quantity',
            'delivery_option', 'location', 'city', 'dimensions', 'weight', 'image_urls'
        ]

    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        image_urls = validated_data.pop('image_urls', [])
        category = Category.objects.get(id=category_id)
        donor = self.context['request'].user

        donation = Donation.objects.create(
            donor=donor,
            category=category,
            status=Donation.Status.AVAILABLE,
            **validated_data
        )

        # Handle images
        if image_urls:
            for idx, img_url in enumerate(image_urls):
                DonationImage.objects.create(
                    donation=donation,
                    image_url=img_url,
                    is_primary=(idx == 0)
                )
        else:
            # Assign category visual placeholder
            category_default = f"/images/items/image{donation.id % 6 + 1}.png"
            DonationImage.objects.create(
                donation=donation,
                image_url=category_default,
                is_primary=True
            )

        from dashboard.models import ActivityLog
        ActivityLog.objects.create(
            user=donor,
            action="DONATION_CREATED",
            description=f"Donor {donor.name} published donation #{donation.id}: '{donation.title}'."
        )

        from services.notification_service import NotificationService
        NotificationService.send(
            user=donor,
            title="Donation Published! 🌿",
            message=f"Your donation '{donation.title}' is now live and waiting to be matched with someone in need.",
            notif_type="DONATION_CREATED",
            link=f"/donor/donations/{donation.id}"
        )

        return donation

class SavedItemSerializer(serializers.ModelSerializer):
    donation = DonationListSerializer(read_only=True)

    class Meta:
        model = SavedItem
        fields = ['id', 'donation', 'created_at']
