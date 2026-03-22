#!/bin/bash

# Supabase Edge Function Webhook Test Script
# Ushbu skript 'create-user' funksiyasini mahalliy yoki masofaviy test qilish uchun ishlatiladi.

# 1. O'zgaruvchilarni sozlang
FUNCTION_URL="SILINGIZNI_SHU_YERGA_YOZING" # Masalan: https://xxx.supabase.co/functions/v1/create-user
SERVICE_ROLE_KEY="SUPABASE_SERVICE_ROLE_KEY"

echo "🚀 Clerk Webhook testini boshlaymiz..."

# 2. Test payload (Clerk formatida)
JSON_PAYLOAD='{
  "type": "user.created",
  "data": {
    "id": "user_test_123",
    "email_addresses": [
      {
        "email_address": "test_user@example.com"
      }
    ],
    "first_name": "Test",
    "last_name": "User",
    "image_url": "https://img.clerk.com/test",
    "username": "testuser"
  }
}'

# 3. CURL orqali yuborish
curl -i -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD"

echo -e "\n\n✅ Test yakunlandi."
