from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from accounts.models import Profile
from donations.models import Category, Donation, DonationImage


User = get_user_model()


class Command(BaseCommand):
    help = "Adds four realistic demo donations for the landing page, receiver browse page, and admin dashboard."

    def handle(self, *args, **options):
        categories_data = [
            {
                "name": "Furniture",
                "slug": "furniture",
                "icon": "Armchair",
                "description": "Desks, dining tables, wooden chairs, bookshelves, and sofas.",
            },
            {
                "name": "Clothes",
                "slug": "clothes",
                "icon": "Shirt",
                "description": "Gently used or new jackets, shirts, winter coats, and shoes.",
            },
            {
                "name": "Bags & Accessories",
                "slug": "bags-accessories",
                "icon": "Package",
                "description": "Backpacks, bags, purses, and useful everyday accessories.",
            },
            {
                "name": "Kids & Family",
                "slug": "kids-family",
                "icon": "Package",
                "description": "Useful children's items, learning materials, and family essentials.",
            },
        ]

        categories = {}
        for data in categories_data:
            category, _ = Category.objects.get_or_create(
                slug=data["slug"],
                defaults=data,
            )
            categories[data["slug"]] = category

        donors_data = [
            {
                "email": "olivia.demo@secondlife.eco",
                "name": "Olivia Carter",
                "phone": "+1 (206) 555-0141",
                "city": "Seattle",
                "address": "184 Pine Street",
                "bio": "Sharing quality home items that still have plenty of life left.",
            },
            {
                "email": "ethan.demo@secondlife.eco",
                "name": "Ethan Brooks",
                "phone": "+1 (425) 555-0172",
                "city": "Bellevue",
                "address": "72 Lake Avenue",
                "bio": "Giving useful clothing a second life instead of letting it go to waste.",
            },
            {
                "email": "mia.demo@secondlife.eco",
                "name": "Mia Anderson",
                "phone": "+1 (253) 555-0133",
                "city": "Tacoma",
                "address": "415 Market Street",
                "bio": "Passing on practical bags and accessories that are still in great condition.",
            },
            {
                "email": "liam.demo@secondlife.eco",
                "name": "Liam Wilson",
                "phone": "+1 (425) 555-0184",
                "city": "Everett",
                "address": "29 Cedar Avenue",
                "bio": "Helping families reuse educational and creative items.",
            },
        ]

        donors = {}
        for data in donors_data:
            donor, _ = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "name": data["name"],
                    "phone": data["phone"],
                    "role": User.Role.DONOR,
                    "account_type": User.AccountType.INDIVIDUAL,
                    "address": data["address"],
                    "city": data["city"],
                    "country": "USA",
                    "is_verified": True,
                    "is_active": True,
                },
            )
            donor.name = data["name"]
            donor.phone = data["phone"]
            donor.role = User.Role.DONOR
            donor.account_type = User.AccountType.INDIVIDUAL
            donor.address = data["address"]
            donor.city = data["city"]
            donor.country = "USA"
            donor.is_verified = True
            donor.is_active = True
            donor.set_password("password123")
            donor.save()

            Profile.objects.update_or_create(
                user=donor,
                defaults={
                    "bio": data["bio"],
                    "pickup_radius": 15,
                    "handover_preference": "PICKUP",
                },
            )
            donors[data["email"]] = donor

        demo_donations = [
            {
                "title": "Oak Dining Chair - Solid Wood",
                "description": "Sturdy solid-wood dining chair with a clean finish. Ready for a new home and everyday use.",
                "condition": Donation.Condition.GOOD,
                "category": categories["furniture"],
                "donor": donors["olivia.demo@secondlife.eco"],
                "location": "184 Pine Street, Seattle",
                "city": "Seattle",
                "weight": "4.2 kg",
                "pickup_date": "Flexible",
                "pickup_time": "10:00 AM - 6:00 PM",
                "image_url": "/images/donations/chair.jpg",
            },
            {
                "title": "Warm Winter Jacket - Like New",
                "description": "Comfortable insulated winter jacket in excellent condition, suitable for cool-weather days.",
                "condition": Donation.Condition.LIKE_NEW,
                "category": categories["clothes"],
                "donor": donors["ethan.demo@secondlife.eco"],
                "location": "72 Lake Avenue, Bellevue",
                "city": "Bellevue",
                "weight": "1.1 kg",
                "pickup_date": "This weekend",
                "pickup_time": "11:00 AM - 5:00 PM",
                "image_url": "/images/donations/jacket.jpg",
            },
            {
                "title": "Canvas Travel Backpack - Everyday Carry",
                "description": "Durable canvas backpack with roomy compartments for school, work, or everyday travel.",
                "condition": Donation.Condition.GOOD,
                "category": categories["bags-accessories"],
                "donor": donors["mia.demo@secondlife.eco"],
                "location": "415 Market Street, Tacoma",
                "city": "Tacoma",
                "weight": "0.9 kg",
                "pickup_date": "Flexible",
                "pickup_time": "9:00 AM - 4:00 PM",
                "image_url": "/images/donations/bags.jpg",
            },
            {
                "title": "Kids Learning Backpack & Art Set",
                "description": "A practical children's backpack bundled with a reusable art set for school and creative activities.",
                "condition": Donation.Condition.LIKE_NEW,
                "category": categories["kids-family"],
                "donor": donors["liam.demo@secondlife.eco"],
                "location": "29 Cedar Avenue, Everett",
                "city": "Everett",
                "weight": "1.4 kg",
                "pickup_date": "Next week",
                "pickup_time": "12:00 PM - 6:00 PM",
                "image_url": "/images/donations/kids-accessories.jpg",
            },
        ]

        created = 0
        updated = 0
        for data in demo_donations:
            donation, was_created = Donation.objects.update_or_create(
                title=data["title"],
                donor=data["donor"],
                defaults={
                    "category": data["category"],
                    "description": data["description"],
                    "condition": data["condition"],
                    "quantity": 1,
                    "delivery_option": Donation.DeliveryOption.PICKUP,
                    "location": data["location"],
                    "city": data["city"],
                    "status": Donation.Status.AVAILABLE,
                    "weight": data["weight"],
                    "pickup_date": data["pickup_date"],
                    "pickup_time": data["pickup_time"],
                },
            )

            DonationImage.objects.update_or_create(
                donation=donation,
                is_primary=True,
                defaults={"image_url": data["image_url"]},
            )

            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo marketplace ready: {created} created, {updated} updated. "
                "Four different donors, locations, categories, items, and images are available."
            )
        )
