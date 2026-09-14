import re

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import ChatbotFAQ


class ChatbotAssistantView(APIView):
    permission_classes = [permissions.AllowAny]

    DEFAULT_RESPONSE = (
        "I'm the **SecondLife Assistant** 🌿🤖\n\n"
        "I can help you with information about SecondLife, donations, "
        "receivers, registration, organizations, matching, connections, "
        "delivery, safety, and our development team.\n\n"
        "Try asking me:\n"
        "• What is SecondLife?\n"
        "• Who developed SecondLife?\n"
        "• What can I donate?\n"
        "• How do I donate an item?\n"
        "• How do I request an item?\n"
        "• How does matching work?"
    )

    DEFAULT_SUGGESTIONS = [
        "What is SecondLife?",
        "Who developed SecondLife?",
        "What can I donate?",
        "How do I donate an item?",
        "How do I request an item?",
        "How does matching work?",
    ]

    @staticmethod
    def normalize_text(text):
        """
        Convert text into a simple normalized form.
        """
        text = text.lower().strip()

        # Remove punctuation
        text = re.sub(r"[^\w\s]", " ", text)

        # Remove extra spaces
        text = re.sub(r"\s+", " ", text)

        return text

    @staticmethod
    def get_words(text):
        return set(text.split())

    def calculate_score(self, user_message, faq):
        """
        Calculate how relevant an FAQ is to the user's question.
        """

        message = self.normalize_text(user_message)

        question = self.normalize_text(faq.question)

        keywords = [
            self.normalize_text(keyword)
            for keyword in faq.keywords.split(",")
            if keyword.strip()
        ]

        score = 0

        # --------------------------------------------------
        # Exact question match
        # --------------------------------------------------
        if message == question:
            score += 100

        # --------------------------------------------------
        # User question contains FAQ question
        # --------------------------------------------------
        if question in message:
            score += 60

        # --------------------------------------------------
        # FAQ question contains user message
        # --------------------------------------------------
        if message in question:
            score += 40

        # --------------------------------------------------
        # Keyword matching
        # --------------------------------------------------
        for keyword in keywords:

            if not keyword:
                continue

            # Exact phrase
            if keyword in message:
                score += 15

                # Longer/more specific keywords get more weight
                if len(keyword.split()) > 1:
                    score += 10

        # --------------------------------------------------
        # Individual word matching
        # --------------------------------------------------
        message_words = self.get_words(message)
        question_words = self.get_words(question)

        common_words = message_words.intersection(question_words)

        score += len(common_words) * 3

        # --------------------------------------------------
        # Priority from database
        # --------------------------------------------------
        score += faq.priority

        return score

    def get_suggestions(self, selected_faq=None):
        """
        Return useful FAQ suggestions for the chatbot.
        """

        faqs = ChatbotFAQ.objects.filter(
            is_active=True
        ).order_by("-priority")[:6]

        suggestions = []

        for faq in faqs:

            if selected_faq and faq.id == selected_faq.id:
                continue

            suggestions.append(faq.question)

            if len(suggestions) >= 5:
                break

        if not suggestions:
            return self.DEFAULT_SUGGESTIONS

        return suggestions

    def post(self, request):

        user_message = request.data.get("message", "").strip()

        if not user_message:
            return Response(
                {
                    "error": "Message cannot be empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        faqs = ChatbotFAQ.objects.filter(
            is_active=True
        )

        best_faq = None
        best_score = 0

        for faq in faqs:

            score = self.calculate_score(
                user_message,
                faq
            )

            if score > best_score:
                best_score = score
                best_faq = faq

        # Minimum confidence threshold
        if best_faq and best_score >= 10:

            return Response(
                {
                    "reply": best_faq.answer,
                    "suggestions": self.get_suggestions(best_faq),
                    "category": best_faq.category,
                }
            )

        return Response(
            {
                "reply": self.DEFAULT_RESPONSE,
                "suggestions": self.DEFAULT_SUGGESTIONS,
                "category": "general",
            }
        )
