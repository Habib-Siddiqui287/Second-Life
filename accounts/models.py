from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('account_type', User.AccountType.INDIVIDUAL)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        DONOR = 'DONOR', 'Donor'
        RECEIVER = 'RECEIVER', 'Receiver'

    class AccountType(models.TextChoices):
        INDIVIDUAL = 'INDIVIDUAL', 'Individual'
        ORGANIZATION = 'ORGANIZATION', 'Organization'

    email = models.EmailField(unique=True, max_length=255, db_index=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30, blank=True, default='')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.DONOR, db_index=True)
    account_type = models.CharField(max_length=20, choices=AccountType.choices, default=AccountType.INDIVIDUAL)
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='', db_index=True)
    country = models.CharField(max_length=100, default='USA')
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'role']),
            models.Index(fields=['city']),
        ]

    def __str__(self):
        return f'{self.name} ({self.email}) - {self.role}'

    @property
    def initials(self):
        parts = self.name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[1][0]).upper()
        elif len(parts) == 1 and len(parts[0]) > 0:
            return parts[0][:2].upper()
        return 'SL'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    preferred_categories = models.JSONField(default=list, blank=True)
    needed_categories = models.JSONField(default=list, blank=True)
    pickup_radius = models.IntegerField(default=10) # miles
    handover_preference = models.CharField(max_length=50, default='PICKUP') # PICKUP, DELIVERY, EITHER
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Profile for {self.user.email}'
