import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from accounts.models import Profile
from organizations.models import Organization, OrganizationVerification
from donations.models import Category, Donation, DonationImage, SavedItem
from item_requests.models import DonationRequest
from connections.models import Connection, Delivery
from notifications.models import Notification
from dashboard.models import ActivityLog, ContactMessage
from chatbot.models import ChatbotFAQ


User = get_user_model()


class Command(BaseCommand):
    help = "Seeds database with rich, realistic demo data for SecondLife platform"

    def handle(self, *args, **kwargs):
        self.stdout.write(
            self.style.NOTICE("Seeding SecondLife database...")
        )

        # 1. Categories
        categories_data = [
            {
                "name": "Clothes",
                "slug": "clothes",
                "icon": "Shirt",
                "description": "Gently used or new jackets, shirts, winter coats, and shoes.",
            },
            {
                "name": "Books",
                "slug": "books",
                "icon": "BookOpen",
                "description": "Textbooks, fiction, children's storybooks, and reference literature.",
            },
            {
                "name": "Electronics",
                "slug": "electronics",
                "icon": "Laptop",
                "description": "Computers, displays, desk lamps, kitchen appliances, and chargers.",
            },
            {
                "name": "Furniture",
                "slug": "furniture",
                "icon": "Armchair",
                "description": "Desks, dining tables, wooden chairs, bookshelves, and sofas.",
            },
            {
                "name": "Food",
                "slug": "food",
                "icon": "Apple",
                "description": "Canned staples, dry provisions, sealed pantry items, and produce.",
            },
            {
                "name": "Other",
                "slug": "other",
                "icon": "Package",
                "description": "Household tools, kitchenware, toys, and miscellaneous utility goods.",
            },
        ]

        categories = {}

        for cdata in categories_data:
            cat, _ = Category.objects.get_or_create(
                slug=cdata["slug"],
                defaults=cdata
            )
            categories[cdata["slug"]] = cat

        self.stdout.write(
            self.style.SUCCESS(
                f"Loaded {len(categories)} categories."
            )
        )

        # 2. Admin User
        admin, _ = User.objects.get_or_create(
            email="admin@secondlife.eco",
            defaults={
                "name": "SecondLife Administration",
                "phone": "+1 (555) 010-9900",
                "role": User.Role.ADMIN,
                "account_type": User.AccountType.INDIVIDUAL,
                "city": "Seattle",
                "address": "400 Pine St, Suite 500",
                "is_staff": True,
                "is_superuser": True,
                "is_verified": True,
            }
        )

        admin.set_password("password123")
        admin.save()

        Profile.objects.get_or_create(
            user=admin,
            defaults={
                "bio": "SecondLife Platform Director"
            }
        )

        # 3. Donors
        donor_mamoon, _ = User.objects.get_or_create(
            email="mamoon@secondlife.eco",
            defaults={
                "name": "Mamoon Al-Hashmi",
                "phone": "+1 (555) 012-3456",
                "role": User.Role.DONOR,
                "account_type": User.AccountType.INDIVIDUAL,
                "city": "Seattle",
                "address": "123 Sustainability Way, Apt 4B",
                "is_verified": True,
            }
        )

        donor_mamoon.set_password("password123")
        donor_mamoon.save()

        Profile.objects.get_or_create(
            user=donor_mamoon,
            defaults={
                "bio": "Passionate about circular economy and sustainable zero-waste living.",
                "preferred_categories": [
                    "furniture",
                    "electronics",
                    "books"
                ],
                "pickup_radius": 15,
                "handover_preference": "PICKUP"
            }
        )

        donor_sarah, _ = User.objects.get_or_create(
            email="sarah.j@secondlife.eco",
            defaults={
                "name": "Sarah Jenkins",
                "phone": "+1 (555) 014-7890",
                "role": User.Role.DONOR,
                "account_type": User.AccountType.INDIVIDUAL,
                "city": "Seattle",
                "address": "142 Oakwood Drive, Eastside",
                "is_verified": True,
            }
        )

        donor_sarah.set_password("password123")
        donor_sarah.save()

        Profile.objects.get_or_create(
            user=donor_sarah,
            defaults={
                "bio": "Downsizing and giving durable quality home items a second life.",
                "preferred_categories": [
                    "furniture",
                    "clothes"
                ],
                "pickup_radius": 10,
                "handover_preference": "PICKUP"
            }
        )

        # Organization Donor
        org_donor_user, _ = User.objects.get_or_create(
            email="contact@greenearth.org",
            defaults={
                "name": "Green Earth Foundation",
                "phone": "+1 (555) 018-4422",
                "role": User.Role.DONOR,
                "account_type": User.AccountType.ORGANIZATION,
                "city": "Seattle",
                "address": "888 Eco Boulevard",
                "is_verified": True,
            }
        )

        org_donor_user.set_password("password123")
        org_donor_user.save()

        Profile.objects.get_or_create(
            user=org_donor_user
        )

        Organization.objects.get_or_create(
            user=org_donor_user,
            defaults={
                "organization_name": "Green Earth Foundation",
                "organization_type": Organization.OrgType.FOUNDATION,
                "license_number": "WA-NGO-88219",
                "contact_person": "David Vance",
                "official_email": "contact@greenearth.org",
                "phone": "+1 (555) 018-4422",
                "address": "888 Eco Boulevard",
                "city": "Seattle",
                "website": "https://greenearth.org",
                "description": "Donating refurbished educational computers and library books to underprivileged youth centers.",
                "verification_status": Organization.VerificationStatus.VERIFIED,
                "verified_at": timezone.now()
            }
        )

        # 4. Receivers
        receiver_alex, _ = User.objects.get_or_create(
            email="alex.rivera@secondlife.eco",
            defaults={
                "name": "Alex Rivera",
                "phone": "+1 (555) 019-3321",
                "role": User.Role.RECEIVER,
                "account_type": User.AccountType.INDIVIDUAL,
                "city": "Seattle",
                "address": "560 Lakeview Terrace, Ballard",
                "is_verified": True,
            }
        )

        receiver_alex.set_password("password123")
        receiver_alex.save()

        Profile.objects.get_or_create(
            user=receiver_alex,
            defaults={
                "bio": "Freelance eco-designer setting up a sustainable home office & community study corner.",
                "needed_categories": [
                    "furniture",
                    "electronics",
                    "books"
                ],
                "pickup_radius": 12,
                "handover_preference": "EITHER"
            }
        )

        # Organization Receivers
        org_rec_verified_user, _ = User.objects.get_or_create(
            email="director@localyouth.org",
            defaults={
                "name": "Local Youth Center",
                "phone": "+1 (555) 015-8833",
                "role": User.Role.RECEIVER,
                "account_type": User.AccountType.ORGANIZATION,
                "city": "Seattle",
                "address": "742 Community Way, Central District",
                "is_verified": True,
            }
        )

        org_rec_verified_user.set_password("password123")
        org_rec_verified_user.save()

        Profile.objects.get_or_create(
            user=org_rec_verified_user
        )

        Organization.objects.get_or_create(
            user=org_rec_verified_user,
            defaults={
                "organization_name": "Local Youth Center",
                "organization_type": Organization.OrgType.COMMUNITY,
                "license_number": "WA-COMM-4410",
                "contact_person": "Elena Marcus",
                "official_email": "director@localyouth.org",
                "phone": "+1 (555) 015-8833",
                "address": "742 Community Way, Central District",
                "city": "Seattle",
                "website": "https://localyouthcenter.org",
                "description": "After-school programs providing safe learning spaces, coding workshops, and nutrition for local teenagers.",
                "verification_status": Organization.VerificationStatus.VERIFIED,
                "verified_at": timezone.now()
            }
        )

        # Pending Organization
        org_pending_user, _ = User.objects.get_or_create(
            email="contact@newhorizon.org",
            defaults={
                "name": "New Horizon Relief Shelter",
                "phone": "+1 (555) 017-9944",
                "role": User.Role.RECEIVER,
                "account_type": User.AccountType.ORGANIZATION,
                "city": "Seattle",
                "address": "120 Pioneer Square",
                "is_verified": False,
            }
        )

        org_pending_user.set_password("password123")
        org_pending_user.save()

        Profile.objects.get_or_create(
            user=org_pending_user
        )

        Organization.objects.get_or_create(
            user=org_pending_user,
            defaults={
                "organization_name": "New Horizon Relief Shelter",
                "organization_type": Organization.OrgType.SHELTER,
                "license_number": "WA-REL-99212",
                "contact_person": "Robert Hall",
                "official_email": "contact@newhorizon.org",
                "phone": "+1 (555) 017-9944",
                "address": "120 Pioneer Square",
                "city": "Seattle",
                "website": "https://newhorizonrelief.org",
                "description": "Emergency transitional shelter supporting families in temporary housing transitions.",
                "verification_status": Organization.VerificationStatus.PENDING,
            }
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Created demo users & organizations."
            )
        )

        # 5. Donations Data
        donations_pool = [
            {
                "donor": donor_sarah,
                "category": categories["furniture"],
                "title": "Vintage Oak Side Table",
                "description": "Gently used solid oak side table from the 1970s. We've loved having it in our living room, but are redecorating and hope it finds a good home. The finish is mostly intact with minor wear consistent with its age. Features one small drawer that slides smoothly.",
                "condition": Donation.Condition.LIKE_NEW,
                "quantity": 1,
                "delivery_option": Donation.DeliveryOption.PICKUP,
                "location": "Ballard, Seattle, WA",
                "city": "Seattle",
                "dimensions": "24\" W x 18\" D x 22\" H",
                "weight": "15 lbs",
                "status": Donation.Status.AVAILABLE,
                "images": [
                    "/images/items/image12.png",
                    "/images/items/image1.jpeg"
                ]
            },
            {
                "donor": donor_mamoon,
                "category": categories["furniture"],
                "title": "Mid-Century Modern Dining Chair",
                "description": "A single solid wood dining chair in excellent condition. Perfect for a desk or as an accent piece in a minimalist interior.",
                "condition": Donation.Condition.GOOD,
                "quantity": 1,
                "delivery_option": Donation.DeliveryOption.EITHER,
                "location": "Capitol Hill, Seattle, WA",
                "city": "Seattle",
                "dimensions": "19\" W x 20\" D x 32\" H",
                "weight": "12 lbs",
                "status": Donation.Status.AVAILABLE,
                "images": [
                    "/images/items/image17.png"
                ]
            },
            {
                "donor": donor_mamoon,
                "category": categories["clothes"],
                "title": "Heavy Winter Down Coat (Size L)",
                "description": "Barely worn, warm quilted down jacket in navy blue. Dry cleaned and ready for cold weather. Excellent water-resistant outer shell.",
                "condition": Donation.Condition.LIKE_NEW,
                "quantity": 1,
                "delivery_option": Donation.DeliveryOption.EITHER,
                "location": "Fremont, Seattle, WA",
                "city": "Seattle",
                "dimensions": "Size Large (Men/Unisex)",
                "weight": "3 lbs",
                "status": Donation.Status.AVAILABLE,
                "images": [
                    "/images/items/image15.png"
                ]
            },
            {
                "donor": org_donor_user,
                "category": categories["electronics"],
                "title": "Razer Blade 15 Advanced Gaming / Workstation Laptop",
                "description": "Intel Core i7, 16GB RAM, RTX 3070, 1TB SSD. Fully wiped and factory reset. Includes original charger and padded sleeve. Donated to support youth STEM coding.",
                "condition": Donation.Condition.LIKE_NEW,
                "quantity": 1,
                "delivery_option": Donation.DeliveryOption.DELIVERY,
                "location": "South Lake Union, Seattle, WA",
                "city": "Seattle",
                "dimensions": "15.6 inch display",
                "weight": "4.6 lbs",
                "status": Donation.Status.MATCHED,
                "images": [
                    "/images/items/image7.png"
                ]
            },
            {
                "donor": donor_sarah,
                "category": categories["books"],
                "title": "Assorted Sci-Fi & Speculative Fiction Novels (Bundle of 5)",
                "description": "5 classic science fiction novels in great reading condition. Includes Dune, Neuromancer, Foundation, and Hyperion.",
                "condition": Donation.Condition.GOOD,
                "quantity": 5,
                "delivery_option": Donation.DeliveryOption.EITHER,
                "location": "Queen Anne, Seattle, WA",
                "city": "Seattle",
                "dimensions": "Paperback stack",
                "weight": "4 lbs",
                "status": Donation.Status.AVAILABLE,
                "images": [
                    "/images/items/image12.png"
                ]
            },
            {
                "donor": donor_mamoon,
                "category": categories["electronics"],
                "title": "Adjustable Brass Desk Lamp",
                "description": "Works perfectly. Vintage style warm brass finish. Energy-efficient warm LED bulb included. Excellent for study or bedside desk.",
                "condition": Donation.Condition.GOOD,
                "quantity": 1,
                "delivery_option": Donation.DeliveryOption.PICKUP,
                "location": "Wallingford, Seattle, WA",
                "city": "Seattle",
                "dimensions": "18\" height",
                "weight": "5 lbs",
                "status": Donation.Status.AVAILABLE,
                "images": [
                    "/images/items/image11.png"
                ]
            },
            {
                "donor": donor_sarah,
                "category": categories["furniture"],
                "title": "Ergonomic Mesh Office Chair",
                "description": "Adjustable height, good lumbar support, smooth rolling casters. Clean and sturdy for remote work or studying.",
                "condition": Donation.Condition.GOOD,
                "quantity": 1,
                "delivery_option": Donation.DeliveryOption.PICKUP,
                "location": "Eastlake, Seattle, WA",
                "city": "Seattle",
                "dimensions": "26\" W x 26\" D x 40\" H",
                "weight": "28 lbs",
                "status": Donation.Status.AVAILABLE,
                "images": [
                    "/images/items/image11.png"
                ]
            },
            {
                "donor": donor_mamoon,
                "category": categories["books"],
                "title": "Children's Illustrated Storybooks Bundle (8 Books)",
                "description": "Age 5-9 reading level. Vibrant color illustrations, classic educational and bedtime tales. Kept in pristine condition.",
                "condition": Donation.Condition.LIKE_NEW,
                "quantity": 8,
                "delivery_option": Donation.DeliveryOption.EITHER,
                "location": "Green Lake, Seattle, WA",
                "city": "Seattle",
                "dimensions": "Hardcover & paperback mix",
                "weight": "6 lbs",
                "status": Donation.Status.COMPLETED,
                "images": [
                    "/images/items/image11.png"
                ]
            },
            {
                "donor": donor_sarah,
                "category": categories["food"],
                "title": "Organic Pantry Staples & Non-Perishable Canned Food (Box of 20)",
                "description": "Unopened, sealed organic canned beans, tomatoes, whole wheat pasta, rice, and oats. Expiration dates late 2027.",
                "condition": Donation.Condition.NEW,
                "quantity": 20,
                "delivery_option": Donation.DeliveryOption.DELIVERY,
                "location": "Ballard, Seattle, WA",
                "city": "Seattle",
                "dimensions": "Standard grocery crate",
                "weight": "25 lbs",
                "status": Donation.Status.AVAILABLE,
                "images": [
                    "/images/items/image1.jpeg"
                ]
            },
            {
                "donor": donor_mamoon,
                "category": categories["furniture"],
                "title": "Designer Scandinavian Sofa (3-Seater)",
                "description": "Gently used mid-century modern green sofa. Minor wear on left armrest, structurally sound and recently steam cleaned.",
                "condition": Donation.Condition.GOOD,
                "quantity": 1,
                "delivery_option": Donation.DeliveryOption.DELIVERY,
                "location": "Pioneer Square, Seattle, WA",
                "city": "Seattle",
                "dimensions": "82\" W x 34\" D x 32\" H",
                "weight": "90 lbs",
                "status": Donation.Status.IN_DELIVERY,
                "images": [
                    "/images/items/image8.png"
                ]
            },
        ]

        created_donations = []

        for d in donations_pool:
            img_list = d.pop("images")

            obj, _ = Donation.objects.get_or_create(
                title=d["title"],
                donor=d["donor"],
                defaults=d
            )

            created_donations.append(obj)

            for idx, img_path in enumerate(img_list):
                DonationImage.objects.get_or_create(
                    donation=obj,
                    image_url=img_path,
                    defaults={
                        "is_primary": (idx == 0)
                    }
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(created_donations)} donations."
            )
        )

        # 6. Saved items
        SavedItem.objects.get_or_create(
            user=receiver_alex,
            donation=created_donations[0]
        )

        SavedItem.objects.get_or_create(
            user=receiver_alex,
            donation=created_donations[1]
        )

        # 7. Requests & Connections

        # Request 1
        req1, _ = DonationRequest.objects.get_or_create(
            donation=created_donations[0],
            receiver=receiver_alex,
            defaults={
                "message": "Hi Sarah! I am moving into an eco-friendly studio in Ballard and would love to give this side table a happy second home.",
                "status": DonationRequest.Status.PENDING,
            }
        )

        # Request 2
        req2, _ = DonationRequest.objects.get_or_create(
            donation=created_donations[3],
            receiver=org_rec_verified_user,
            defaults={
                "message": "We provide after-school programs for underprivileged teens. This laptop will be used in our digital arts and coding lab.",
                "status": DonationRequest.Status.APPROVED,
            }
        )

        # Connection for Request 2
        conn2, _ = Connection.objects.get_or_create(
            donation=created_donations[3],
            request=req2,
            defaults={
                "donor": org_donor_user,
                "receiver": org_rec_verified_user,
                "status": Connection.Status.ACCEPTED,
                "scheduled_date": "Tomorrow, Oct 24",
                "pickup_time_slot": "10:00 AM - 12:00 PM",
                "pickup_address": "888 Eco Boulevard, South Lake Union, Seattle",
                "courier_notes": "Assigned Eco-Van #SL-102. Contact donor 15 minutes before arrival.",
            }
        )

        Delivery.objects.get_or_create(
            connection=conn2,
            defaults={
                "tracking_code": f"SL-{uuid.uuid4().hex[:8].upper()}",
                "status": Delivery.DeliveryStatus.SCHEDULED,
                "courier_name": "Marcus Jenkins",
                "courier_phone": "+1 (555) 019-8811",
                "vehicle_info": "White Ford Electric Transit - Plate #XYZ 123",
                "estimated_arrival": "Tomorrow, 10:30 AM",
                "timeline_steps": [
                    {
                        "step": "Request Submitted",
                        "status": "COMPLETED",
                        "timestamp": "Oct 21, 2026 2:15 PM"
                    },
                    {
                        "step": "Request Approved",
                        "status": "COMPLETED",
                        "timestamp": "Oct 22, 2026 9:30 AM"
                    },
                    {
                        "step": "Pickup Scheduled",
                        "status": "COMPLETED",
                        "timestamp": "Oct 23, 2026 11:00 AM"
                    },
                    {
                        "step": "Courier Transit",
                        "status": "IN_PROGRESS",
                        "timestamp": "Tomorrow, 10:00 AM"
                    },
                    {
                        "step": "Delivered",
                        "status": "PENDING",
                        "timestamp": "Estimated 10:30 AM"
                    },
                ]
            }
        )

        # Connection 3: Sofa in delivery
        sofa_req, _ = DonationRequest.objects.get_or_create(
            donation=created_donations[9],
            receiver=receiver_alex,
            defaults={
                "message": "Looking for durable seating for our shared community living space.",
                "status": DonationRequest.Status.APPROVED,
            }
        )

        conn3, _ = Connection.objects.get_or_create(
            donation=created_donations[9],
            request=sofa_req,
            defaults={
                "donor": donor_mamoon,
                "receiver": receiver_alex,
                "status": Connection.Status.IN_PROGRESS,
                "scheduled_date": "Today, 2:30 PM",
                "pickup_time_slot": "2:30 PM - 4:00 PM",
                "pickup_address": "123 Sustainability Way, Seattle",
                "courier_notes": "Heavy item (90 lbs) - 2 couriers assigned.",
            }
        )

        Delivery.objects.get_or_create(
            connection=conn3,
            defaults={
                "tracking_code": f"SL-{uuid.uuid4().hex[:8].upper()}",
                "status": Delivery.DeliveryStatus.TRANSIT,
                "courier_name": "Green Logistics Fleet",
                "courier_phone": "+1 (555) 019-4400",
                "vehicle_info": "Eco Electric Van #SL-402",
                "estimated_arrival": "Today, 3:15 PM",
                "timeline_steps": [
                    {
                        "step": "Request Approved",
                        "status": "COMPLETED",
                        "timestamp": "Yesterday"
                    },
                    {
                        "step": "Pickup Completed",
                        "status": "COMPLETED",
                        "timestamp": "Today, 1:45 PM"
                    },
                    {
                        "step": "In Transit",
                        "status": "IN_PROGRESS",
                        "timestamp": "Today, 2:10 PM"
                    },
                    {
                        "step": "Arriving Soon",
                        "status": "PENDING",
                        "timestamp": "Estimated 3:15 PM"
                    },
                    {
                        "step": "Delivered & Verified",
                        "status": "PENDING",
                        "timestamp": "Pending arrival"
                    },
                ]
            }
        )

        # Connection 4: Completed Books Bundle
        books_req, _ = DonationRequest.objects.get_or_create(
            donation=created_donations[7],
            receiver=receiver_alex,
            defaults={
                "message": "For local reading club and kids book exchange.",
                "status": DonationRequest.Status.COMPLETED,
            }
        )

        conn4, _ = Connection.objects.get_or_create(
            donation=created_donations[7],
            request=books_req,
            defaults={
                "donor": donor_mamoon,
                "receiver": receiver_alex,
                "status": Connection.Status.COMPLETED,
                "scheduled_date": "Oct 15, 2026",
                "completed_at": timezone.now(),
            }
        )

        # 8. Notifications
        Notification.objects.get_or_create(
            user=receiver_alex,
            title="Driver Arriving Soon 🚚",
            defaults={
                "message": "Your courier Marcus J. is arriving in approximately 15 minutes with your requested item.",
                "type": Notification.NotificationType.DELIVERY_UPDATE,
                "link": f"/receiver/connections/{conn3.id}",
                "is_read": False,
            }
        )

        Notification.objects.get_or_create(
            user=receiver_alex,
            title="Match Confirmed! 🎉",
            defaults={
                "message": "Great news! Sarah accepted your request for the Vintage Oak Side Table.",
                "type": Notification.NotificationType.REQUEST_APPROVED,
                "link": f"/receiver/connections/{conn2.id}",
                "is_read": False,
            }
        )

        Notification.objects.get_or_create(
            user=donor_mamoon,
            title="New Item Request! 📬",
            defaults={
                "message": "Alex Rivera submitted a request for your donation 'Mid-Century Modern Dining Chair'.",
                "type": Notification.NotificationType.REQUEST_RECEIVED,
                "link": "/donor/requests",
                "is_read": False,
            }
        )

        # 9. Activity Logs
        ActivityLog.objects.get_or_create(
            user=admin,
            action="SYSTEM_INIT",
            defaults={
                "description": "SecondLife platform initialized with complete circular economy seed dataset."
            }
        )

        ActivityLog.objects.get_or_create(
            user=donor_mamoon,
            action="DONATION_CREATED",
            defaults={
                "description": "Donor Mamoon published 'Designer Scandinavian Sofa'."
            }
        )

        # 10. Sample contact message
        ContactMessage.objects.get_or_create(
            email="maria.santos@greenpartners.org",
            defaults={
                "name": "Maria Santos",
                "subject": "Bulk Donation Logistics Partnership",
                "message": "We represent a network of local community libraries and would like to coordinate monthly bulk book collections.",
                "is_resolved": False
            }
        )

        # ============================================================
        # 11. CHATBOT FAQs
        # ============================================================

        chatbot_faqs = [
            {
                "question": "Who developed SecondLife?",
                "answer": (
                    "SecondLife was developed by:\n\n"
                    "👨‍💻 Mamoon Shahid\n"
                    "👨‍💻 Habib Ahmad Siddiqui\n"
                    "👨‍💻 Maaj Ahmad\n\n"
                    "Together, the team developed SecondLife — Give Things a Second Life, "
                    "a platform designed to connect donors with people and organizations "
                    "who need useful items."
                ),
                "keywords": (
                    "developer, developers, developed by, created by, creator, "
                    "who made, who created, development team, team, mamoon, "
                    "habib, maaj"
                ),
                "category": "team",
                "priority": 100,
            },

            {
                "question": "What is SecondLife?",
                "answer": (
                    "SecondLife is a resource-sharing and donation platform that "
                    "connects people who want to donate useful items with people "
                    "and organizations who need them."
                ),
                "keywords": (
                    "what is secondlife, what is second life, about secondlife, "
                    "about second life, explain secondlife"
                ),
                "category": "general",
                "priority": 90,
            },

            {
                "question": "What is the purpose of SecondLife?",
                "answer": (
                    "The purpose of SecondLife is to give useful items a second life "
                    "by connecting donors with people and organizations that need them. "
                    "It also promotes reuse, reduces waste, and supports a circular economy."
                ),
                "keywords": (
                    "purpose, goal, objective, aim, why secondlife, "
                    "why was secondlife created"
                ),
                "category": "general",
                "priority": 80,
            },

            {
                "question": "How does SecondLife work?",
                "answer": (
                    "SecondLife works by connecting donors and receivers. "
                    "Donors can list useful items, while receivers or organizations "
                    "can browse available donations and request items they need."
                ),
                "keywords": (
                    "how does secondlife work, how it works, working, "
                    "process, platform process"
                ),
                "category": "general",
                "priority": 80,
            },

            {
                "question": "How can I donate an item?",
                "answer": (
                    "To donate an item, log in to your SecondLife account, "
                    "open the donation section, provide the item details, "
                    "select the appropriate category, add an image if available, "
                    "and submit your donation."
                ),
                "keywords": (
                    "how to donate, how can i donate, add donation, "
                    "create donation, donate item, list item"
                ),
                "category": "donations",
                "priority": 80,
            },

            {
                "question": "What can I donate?",
                "answer": (
                    "You can donate useful items such as clothes, books, furniture, "
                    "electronics, household items, educational materials, food, "
                    "and other safe items that are in usable condition."
                ),
                "keywords": (
                    "what can i donate, donation items, items to donate, "
                    "what items, donate things"
                ),
                "category": "donations",
                "priority": 75,
            },

            {
                "question": "How can I request an item?",
                "answer": (
                    "To request an item, log in to your account, browse the available "
                    "donations, open the item you need, and submit a request if it "
                    "is available."
                ),
                "keywords": (
                    "how to request, how can i request, request item, "
                    "request donation, need item, receiver request"
                ),
                "category": "requests",
                "priority": 80,
            },

            {
                "question": "Who can receive donations?",
                "answer": (
                    "Individuals and eligible organizations can receive donations "
                    "through SecondLife. Receivers can browse available items "
                    "and request items that meet their needs."
                ),
                "keywords": (
                    "who can receive, receiver, receivers, recipient, "
                    "who gets donations"
                ),
                "category": "requests",
                "priority": 70,
            },

            {
                "question": "Can organizations use SecondLife?",
                "answer": (
                    "Yes. Organizations can use SecondLife to donate useful items "
                    "or request items for their communities, programs, shelters, "
                    "and other legitimate needs."
                ),
                "keywords": (
                    "organization, organizations, ngo, charity, "
                    "institution, foundation"
                ),
                "category": "organizations",
                "priority": 75,
            },

            {
                "question": "How does matching work?",
                "answer": (
                    "SecondLife helps connect available donations with people or "
                    "organizations looking for those items. Matching can consider "
                    "factors such as item category, availability, location, "
                    "and the receiver's needs."
                ),
                "keywords": (
                    "matching, match, matches, how matching works, "
                    "donor receiver matching"
                ),
                "category": "matching",
                "priority": 70,
            },

            {
                "question": "Is SecondLife free?",
                "answer": (
                    "SecondLife is designed as a donation and resource-sharing "
                    "platform. Users can use the platform to discover available "
                    "items and connect with donors or receivers."
                ),
                "keywords": (
                    "free, cost, costs, charges, price, payment, fee"
                ),
                "category": "general",
                "priority": 60,
            },

            {
                "question": "Why should I donate?",
                "answer": (
                    "Donating useful items can help people and organizations in need, "
                    "reduce unnecessary waste, encourage reuse, and give valuable "
                    "items a second life."
                ),
                "keywords": (
                    "why donate, benefits of donating, donation benefits, "
                    "reason to donate"
                ),
                "category": "donations",
                "priority": 65,
            },

            {
                "question": "What donation categories are available?",
                "answer": (
                    "SecondLife currently supports categories such as Clothes, "
                    "Books, Electronics, Furniture, Food, and Other useful items."
                ),
                "keywords": (
                    "categories, donation categories, item categories, "
                    "types of donations, available categories"
                ),
                "category": "donations",
                "priority": 65,
            },

            {
                "question": "Can I donate electronics?",
                "answer": (
                    "Yes. Useful electronics can be donated through SecondLife. "
                    "Please make sure the item is safe, functional, and accurately "
                    "described before listing it."
                ),
                "keywords": (
                    "electronics, electronic items, donate electronics, "
                    "laptop, computer, phone"
                ),
                "category": "donations",
                "priority": 60,
            },

            {
                "question": "Can I donate clothes?",
                "answer": (
                    "Yes. Clothes can be donated through SecondLife. "
                    "It is best to donate clothing that is clean, safe, "
                    "and in usable condition."
                ),
                "keywords": (
                    "clothes, clothing, donate clothes, shirts, jackets, shoes"
                ),
                "category": "donations",
                "priority": 60,
            },

            {
                "question": "How does delivery work?",
                "answer": (
                    "Depending on the donation, handover may be arranged through "
                    "pickup, delivery, or an available option agreed by the users. "
                    "Connection and delivery information can be used to track the process."
                ),
                "keywords": (
                    "delivery, deliver, pickup, pick up, handover, "
                    "transport, courier"
                ),
                "category": "delivery",
                "priority": 65,
            },

            {
                "question": "Is my information safe?",
                "answer": (
                    "Users should protect their account credentials and only share "
                    "necessary information through the platform. Avoid sharing "
                    "passwords or sensitive personal information with other users."
                ),
                "keywords": (
                    "safe, safety, information safe, privacy, secure, "
                    "security, personal information"
                ),
                "category": "safety",
                "priority": 65,
            },

            {
                "question": "How do I create an account?",
                "answer": (
                    "You can create an account through the SecondLife registration "
                    "process. Provide the required information, choose the appropriate "
                    "account type, and complete registration."
                ),
                "keywords": (
                    "create account, register, registration, sign up, signup, "
                    "new account"
                ),
                "category": "accounts",
                "priority": 60,
            },

            {
                "question": "What is the environmental benefit of SecondLife?",
                "answer": (
                    "SecondLife encourages reuse and helps keep useful items "
                    "in circulation instead of sending them to waste. "
                    "This supports a more sustainable and circular economy."
                ),
                "keywords": (
                    "environment, environmental, sustainability, sustainable, "
                    "waste, recycle, reuse, circular economy"
                ),
                "category": "general",
                "priority": 65,
            },
        ]

        for faq in chatbot_faqs:
            ChatbotFAQ.objects.update_or_create(
                question=faq["question"],
                defaults={
                    "answer": faq["answer"],
                    "keywords": faq["keywords"],
                    "category": faq["category"],
                    "is_active": True,
                    "priority": faq["priority"],
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Loaded {len(chatbot_faqs)} chatbot FAQs."
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "SecondLife seed data successfully loaded!"
            )
        )
