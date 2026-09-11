from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),

    # SecondLife REST APIs
    path('api/', include('accounts.urls')),
    path('api/', include('organizations.urls')),
    path('api/', include('donations.urls')),
    path('api/', include('item_requests.urls')),
    path('api/', include('connections.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('dashboard.urls')),
    path('api/', include('chatbot.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
