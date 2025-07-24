# chat/routing.py

from django.urls import re_path
from . import consumers

# Step 1: Add a print statement to see if this file is loaded
print("--- CHAT ROUTING FILE LOADED ---")

websocket_urlpatterns = [
    # Step 2: Temporarily change the route to catch ANY WebSocket connection
    re_path(r'ws/.*', consumers.ChatConsumer.as_asgi()),
]