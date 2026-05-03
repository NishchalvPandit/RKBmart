#!/bin/bash

# Admin Promotion Feature - cURL Test Commands
# Replace [TOKEN] with actual JWT token and [USER_ID] with actual user ID

# ============================================
# 1. REGISTER A NEW USER
# ============================================
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# ============================================
# 2. LOGIN (Get JWT Token)
# ============================================
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "AdminPass123!"
  }'

# Save the returned token in a variable:
# TOKEN="your_jwt_token_here"

# ============================================
# 3. GET ALL USERS (Admin/Super Admin)
# ============================================
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# ============================================
# 4. PROMOTE USER TO ADMIN (Super Admin Only)
# ============================================
curl -X PUT http://localhost:3000/api/admin/users/[USER_ID]/make-admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Example with actual values:
# curl -X PUT http://localhost:3000/api/admin/users/507f1f77bcf86cd799439011/make-admin \
#   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
#   -H "Content-Type: application/json"

# ============================================
# 5. TEST UNAUTHORIZED ACCESS (Regular User)
# ============================================
# First, login as regular user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "regularuser@example.com",
    "password": "UserPass123!"
  }'

# Then try to promote another user (should get 403)
curl -X PUT http://localhost:3000/api/admin/users/[USER_ID]/make-admin \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "message": "Super admin access required"
# }

# ============================================
# 6. TEST WITH ALREADY-ADMIN USER
# ============================================
curl -X PUT http://localhost:3000/api/admin/users/[ADMIN_USER_ID]/make-admin \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "message": "User is already an admin"
# }

# ============================================
# 7. TEST WITH INVALID USER ID
# ============================================
curl -X PUT http://localhost:3000/api/admin/users/invalid-id/make-admin \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (404):
# {
#   "message": "User not found"
# }

# ============================================
# 8. SUCCESSFUL PROMOTION RESPONSE
# ============================================
# {
#   "message": "User John Doe has been promoted to admin",
#   "userId": "507f1f77bcf86cd799439011",
#   "userName": "John Doe",
#   "userEmail": "john@example.com",
#   "newRole": "admin"
# }

# ============================================
# IMPORTANT SETUP STEPS
# ============================================
# 1. Ensure a super_admin user exists in the database
#    You can manually update a user in MongoDB:
#
#    db.users.updateOne(
#      { email: "superadmin@example.com" },
#      { 
#        $set: { 
#          role: "super_admin",
#          isAdmin: true 
#        }
#      }
#    )
#
# 2. Set JWT_SECRET in environment variables
# 3. Start the backend server
# 4. Use the tokens from login response for subsequent requests
