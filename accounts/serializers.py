from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.models import Profile
from organizations.models import Organization
from dashboard.models import ActivityLog
from services.notification_service import NotificationService

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'preferred_categories', 'needed_categories', 'pickup_radius', 'handover_preference', 'updated_at']

class UserOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'organization_name', 'organization_type', 'license_number', 'contact_person', 'official_email', 'phone', 'address', 'city', 'website', 'description', 'verification_status', 'verification_reason', 'verified_at']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    organization = UserOrganizationSerializer(read_only=True)
    initials = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'role', 'account_type',
            'address', 'city', 'country', 'is_verified', 'is_active',
            'initials', 'profile', 'organization', 'created_at'
        ]
        read_only_fields = ['id', 'role', 'account_type', 'is_verified', 'is_active', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    # Organization specific optional fields
    organization_name = serializers.CharField(required=False, allow_blank=True)
    organization_type = serializers.CharField(required=False, allow_blank=True)
    license_number = serializers.CharField(required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)
    org_description = serializers.CharField(required=False, allow_blank=True)

    # Preferences
    preferred_categories = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    needed_categories = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'confirm_password', 'name', 'phone',
            'role', 'account_type', 'address', 'city', 'country',
            'organization_name', 'organization_type', 'license_number',
            'website', 'org_description', 'preferred_categories', 'needed_categories'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if attrs.get('account_type') == User.AccountType.ORGANIZATION and not attrs.get('organization_name'):
            raise serializers.ValidationError({"organization_name": "Organization name is required for organization accounts."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        org_name = validated_data.pop('organization_name', '')
        org_type = validated_data.pop('organization_type', 'NGO')
        license_num = validated_data.pop('license_number', '')
        website = validated_data.pop('website', '')
        org_desc = validated_data.pop('org_description', '')
        preferred_cats = validated_data.pop('preferred_categories', [])
        needed_cats = validated_data.pop('needed_categories', [])
        password = validated_data.pop('password')

        account_type = validated_data.get('account_type', User.AccountType.INDIVIDUAL)
        is_verified = (account_type == User.AccountType.INDIVIDUAL) # Individuals verified by default, orgs pending

        user = User.objects.create_user(
            password=password,
            is_verified=is_verified,
            **validated_data
        )

        # Create Profile
        Profile.objects.create(
            user=user,
            preferred_categories=preferred_cats,
            needed_categories=needed_cats
        )

        # Create Organization record if applicable
        if account_type == User.AccountType.ORGANIZATION:
            Organization.objects.create(
                user=user,
                organization_name=org_name or user.name,
                organization_type=org_type or 'NGO',
                license_number=license_num,
                contact_person=user.name,
                official_email=user.email,
                phone=user.phone,
                address=user.address,
                city=user.city,
                country=user.country,
                website=website,
                description=org_desc,
                verification_status=Organization.VerificationStatus.PENDING
            )

        # Welcome notification
        NotificationService.send(
            user=user,
            title="Welcome to SecondLife! 🌱",
            message="Thank you for joining our circular community. Give things a second life, reduce waste, and create social impact.",
            notif_type="REGISTRATION",
            link="/donor" if user.role == User.Role.DONOR else "/receiver"
        )

        # Activity Log
        ActivityLog.objects.create(
            user=user,
            action="USER_REGISTERED",
            description=f"New {user.account_type} {user.role} registered: {user.name} ({user.email})."
        )

        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

class ProfileUpdateSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(required=False, allow_blank=True)
    preferred_categories = serializers.ListField(child=serializers.CharField(), required=False)
    needed_categories = serializers.ListField(child=serializers.CharField(), required=False)
    pickup_radius = serializers.IntegerField(required=False)
    handover_preference = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['name', 'phone', 'address', 'city', 'country', 'bio', 'preferred_categories', 'needed_categories', 'pickup_radius', 'handover_preference']

    def update(self, instance, validated_data):
        profile = instance.profile
        profile.bio = validated_data.get('bio', profile.bio)
        if 'preferred_categories' in validated_data:
            profile.preferred_categories = validated_data['preferred_categories']
        if 'needed_categories' in validated_data:
            profile.needed_categories = validated_data['needed_categories']
        if 'pickup_radius' in validated_data:
            profile.pickup_radius = validated_data['pickup_radius']
        if 'handover_preference' in validated_data:
            profile.handover_preference = validated_data['handover_preference']
        profile.save()

        instance.name = validated_data.get('name', instance.name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.address = validated_data.get('address', instance.address)
        instance.city = validated_data.get('city', instance.city)
        instance.country = validated_data.get('country', instance.country)
        instance.save()

        return instance
