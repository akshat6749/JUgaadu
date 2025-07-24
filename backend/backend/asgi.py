"""
ASGI config for college_marketplace project.
"""

import os
from django.core.asgi import get_asgi_application

# Set the environment variable for Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# IMPORTANT: Initialize the Django application and load settings FIRST.
django_asgi_app = get_asgi_application()

# Now that settings are loaded, you can safely import other components
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,  # Use the initialized app
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})