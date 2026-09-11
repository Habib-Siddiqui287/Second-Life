from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

class ChatbotAssistantView(APIView):
    permission_classes = [permissions.AllowAny]

    KNOWLEDGE_BASE = [
        {
            "keywords": ["what is secondlife", "what is second life", "secondlife", "second life", "about secondlife", "mission", "platform", "purpose"],
            "response": "**SecondLife — Give Things a Second Life** is a circular resource-sharing and donation platform connecting individuals and organizations who have useful items with those who need them.\n\nOur mission is to eliminate landfill waste, extend product lifecycles, and build stronger, more sustainable communities through transparent, zero-fee digital handovers.",
            "suggestions": ["How do I donate an item?", "How do I request an item?", "How does matching work?", "Is SecondLife free?"]
        },
        {
            "keywords": ["donate", "donation", "donations", "donating", "give", "giving", "item", "items", "create donation", "listing", "upload"],
            "response": "To donate an item on SecondLife:\n1. Log in or create a Donor account.\n2. Click **'Donate an Item'** on your dashboard or navigation bar.\n3. Fill in title, description, category, and condition (New, Like New, Good, Fair).\n4. Specify pickup location or delivery options and upload clear item photos.\n5. Click **Publish**! Once someone requests your item, you will be notified to confirm the handover.",
            "suggestions": ["What items can I donate?", "How does matching work?", "Who delivers the item?"]
        },
        {
            "keywords": ["request", "requests", "requesting", "receive", "receiving", "receiver", "need", "needing", "get item", "claim"],
            "response": "To request an item on SecondLife:\n1. Log in to your Receiver account.\n2. Go to **Browse Donations** and filter by category, condition, or location.\n3. Click on any item to view photos, dimensions, and donor logistics.\n4. Click **'Request This Item'** and write a brief message about how it will be used.\n5. When the donor approves your request, a Connection is scheduled for pickup or eco-delivery!",
            "suggestions": ["Where can I see my requests?", "How are organizations verified?", "Is SecondLife free?"]
        },
        {
            "keywords": ["match", "matching", "score", "algorithm", "percentage", "recommend", "recommendation", "compatibility"],
            "response": "SecondLife uses a **smart rule-based matching engine**! It evaluates:\n- **Category alignment** (40% weight) based on your needed items profile.\n- **Geographic proximity** (30% weight) to keep transportation emissions low.\n- **Condition suitability** (15% weight) matching your quality preference.\n- **Logistics compatibility** (15% weight) for pickup vs delivery.\n\nItems with high scores appear in your **'Recommended for you'** feed with a compatibility percentage!",
            "suggestions": ["How do I donate?", "Where can I see my requests?", "How do I update my location?"]
        },
        {
            "keywords": ["verify", "verification", "organization", "organizations", "org", "license", "ngo", "charity", "shelter", "register organization"],
            "response": "Organizations (NGOs, shelters, schools, community centers) must submit their official registration/license number during signup.\n\nOur administration team manually inspects each submission within 24-48 hours. Once verified, your organization receives a green **Verified Organization** badge and enhanced allocation priority.",
            "suggestions": ["How do I register as an organization?", "How does matching work?", "Contact admin"]
        },
        {
            "keywords": ["categories", "category", "clothes", "clothing", "furniture", "electronics", "books", "food", "shoes", "jacket", "suit", "bags"],
            "response": "We currently accept donations across 5 key categories:\n- 👕 **Clothes & Apparel**: Clean, gently worn or new apparel, suits, jackets, and footwear.\n- 📚 **Books & Media**: Textbooks, novels, children's storybooks, educational materials.\n- 💻 **Electronics**: Laptops, monitors, lamps, functional appliances.\n- 🪑 **Furniture**: Tables, chairs, desks, bookshelves in sound condition.\n- 🥗 **Food**: Sealed, non-perishable canned goods and staple foods.",
            "suggestions": ["How do I donate an item?", "Can I request furniture?", "Who handles pickup?"]
        },
        {
            "keywords": ["delivery", "pickup", "transport", "courier", "handover", "shipping"],
            "response": "Handovers happen in one of three ways:\n1. **Donor Pickup**: The receiver picks up the item directly from the donor at an agreed time and public location.\n2. **SecondLife Eco-Courier**: For verified organizations or bulky goods, an electric transport van coordinates scheduled pickup and drop-off.\n3. **Community Hub Drop-off**: Items can be dropped at local community partner centers.",
            "suggestions": ["Track my delivery", "What happens after donor approves?", "Safety guidelines"]
        },
        {
            "keywords": ["free", "cost", "charge", "fee", "fees", "money", "payment", "price"],
            "response": "Yes! SecondLife is **100% free** for individuals and non-profit organizations. Our goal is to extend the lifecycle of useful goods, reduce landfill waste, and foster solidarity.",
            "suggestions": ["How to donate?", "How to request an item?", "Why SecondLife?"]
        },
    ]

    DEFAULT_RESPONSE = (
        "I'm here to help you navigate SecondLife! 🌿\n\n"
        "You can ask me about donating items, requesting goods, our rule-based matching system, organization verification, or delivery tracking."
    )

    DEFAULT_SUGGESTIONS = [
        "What can I donate?",
        "How do I request an item?",
        "How does matching work?",
        "How can I verify my organization?",
        "Where can I see my donations?"
    ]

    def post(self, request):
        user_message = request.data.get('message', '').strip().lower()
        if not user_message:
            return Response({'error': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # Match against knowledge base
        matched_entry = None
        best_matches = 0

        for entry in self.KNOWLEDGE_BASE:
            matches = sum(1 for kw in entry['keywords'] if kw in user_message)
            if matches > best_matches:
                best_matches = matches
                matched_entry = entry

        if matched_entry and best_matches > 0:
            return Response({
                'reply': matched_entry['response'],
                'suggestions': matched_entry['suggestions']
            })

        return Response({
            'reply': self.DEFAULT_RESPONSE,
            'suggestions': self.DEFAULT_SUGGESTIONS
        })
