from django.conf import settings
from django.core.mail import send_mail


def send_platform_email(recipient_email, subject, message):
    """
    Send a Second Life transactional email.

    Email failures are logged and returned as False so a temporary
    SMTP problem never rolls back a successful database operation.
    """
    recipient = (recipient_email or "").strip()
    if not recipient:
        return False

    from_email = (
        getattr(settings, "DEFAULT_FROM_EMAIL", "")
        or getattr(settings, "EMAIL_HOST_USER", "")
    ).strip()

    if not from_email:
        print("Second Life email error: DEFAULT_FROM_EMAIL is not configured.")
        return False

    try:
        sent = send_mail(
            subject=subject,
            message=message.strip(),
            from_email=from_email,
            recipient_list=[recipient],
            fail_silently=False,
        )
        if sent == 1:
            print(f"Second Life email sent: {subject} -> {recipient}")
            return True

        print(f"Second Life email was not accepted: {subject} -> {recipient}")
        return False
    except Exception as exc:
        print(f"Second Life email error: {type(exc).__name__}: {exc}")
        return False
