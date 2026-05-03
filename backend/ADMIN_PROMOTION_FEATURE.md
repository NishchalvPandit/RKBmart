## Admin Promotion Feature Documentation

### Overview

This feature allows **super_admin** users to promote normal users to the **admin** role. The system uses role-based access control with three roles: `user`, `admin`, and `super_admin`.

---

### Models

#### User Model (`user.model.js`)

```javascript
// Added role field to user schema
role: {
    type: String,
    enum: ["user", "admin", "super_admin"],
    default: "user"
}
```

**Fields:**

- `name`: User's full name
- `email`: User's email (unique, lowercase)
- `password`: Hashed password
- `isVerified`: Email verification status
- `isAdmin`: Boolean flag (kept for backward compatibility)
- `role`: Role type (user, admin, super_admin) ✨ NEW

---

### Middleware

#### 1. Auth Middleware (`auth.middleware.js`)

Verifies JWT token from cookies or Authorization header.

```javascript
// Validates JWT token
// Extracts user data and attaches to req.user
// Token payload includes: { id, isAdmin, role }
```

**Usage:** All protected routes

#### 2. Admin Middleware (`admin.middleware.js`)

Checks if user has `admin` or `super_admin` role.

```javascript
// Allows: admin, super_admin
// Denies: user
// Returns 403 if insufficient permissions
```

**Usage:** Admin dashboard routes

#### 3. Super Admin Middleware (`super_admin.middleware.js`) ✨ NEW

Checks if user has `super_admin` role exclusively.

```javascript
// Allows: super_admin only
// Denies: admin, user
// Returns 403 if insufficient permissions
```

**Usage:** Super admin operations like promoting users

---

### Controllers

#### Admin Controller (`admin.controller.js`)

**New Method: `promoteToAdmin`** ✨

```javascript
// Endpoint: PUT /api/admin/users/:id/make-admin
// Auth: JWT token required
// Role: super_admin only
//
// Logic:
// 1. Find user by ID
// 2. Check if user already admin/super_admin
// 3. Promote to admin role
// 4. Set isAdmin = true (backward compatibility)
// 5. Save user
// 6. Return success response
```

**Parameters:**

- `req.params.id`: User ID to promote

**Responses:**

- **200**: Success - User promoted

  ```json
  {
    "message": "User [name] has been promoted to admin",
    "userId": "...",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "newRole": "admin"
  }
  ```

- **400**: Bad Request

  ```json
  { "message": "User is already an admin" }
  { "message": "You cannot promote yourself to admin." }
  ```

- **401**: Unauthorized (no token)

  ```json
  { "message": "No authentication token, authorization denied" }
  ```

- **403**: Forbidden (not super_admin)

  ```json
  { "message": "Super admin access required" }
  ```

- **404**: Not Found

  ```json
  { "message": "User not found" }
  ```

- **500**: Server Error
  ```json
  { "message": "[error message]" }
  ```

---

### Routes

#### Admin Routes (`admin.routes.js`)

```
GET     /api/admin/stats                    → Admin/Super Admin
GET     /api/admin/users                    → Admin/Super Admin
DELETE  /api/admin/users/:id                → Admin/Super Admin
PATCH   /api/admin/users/:id/toggle-admin   → Admin/Super Admin
PUT     /api/admin/users/:id/make-admin     → Super Admin ONLY ✨
```

---

### Authentication Flow

#### 1. Registration

User registers with email and password. Default role is `user`.

```javascript
role: "user"; // Default for new users
```

#### 2. Email Verification

User verifies email before login.

#### 3. Login

```javascript
JWT Token Payload:
{
  id: user._id,
  isAdmin: user.isAdmin,
  role: user.role
}
```

#### 4. Access Protected Routes

- **Admin routes**: Check for `admin` or `super_admin` role
- **Super admin routes**: Check for `super_admin` role only

---

### Usage Example

#### Promoting a User to Admin

**Request:**

```bash
curl -X PUT http://localhost:3000/api/admin/users/[USER_ID]/make-admin \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json"
```

**Requirements:**

- JWT token from super_admin user
- Valid user ID that exists in database
- Target user must have role `user` (not already admin)

**Response:**

```json
{
  "message": "User John Doe has been promoted to admin",
  "userId": "507f1f77bcf86cd799439011",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "newRole": "admin"
}
```

---

### Error Handling

| Error           | HTTP Code | Description                        |
| --------------- | --------- | ---------------------------------- |
| No token        | 401       | Missing authentication token       |
| Invalid token   | 401       | JWT verification failed            |
| Not admin       | 403       | User doesn't have admin role       |
| Not super_admin | 403       | User doesn't have super_admin role |
| User not found  | 404       | Target user doesn't exist          |
| Already admin   | 400       | User is already admin/super_admin  |
| Self-promotion  | 400       | Cannot promote yourself            |
| Server error    | 500       | Database or server error           |

---

### Setup Instructions

1. **User Model** - Already includes `role` field
2. **Auth Middleware** - Extracts JWT and includes `role`
3. **Admin Middleware** - Updated to check `role` field
4. **Super Admin Middleware** - New middleware created
5. **Admin Controller** - `promoteToAdmin` method added
6. **Auth Controller** - JWT tokens now include `role`
7. **Admin Routes** - New endpoint added: `PUT /api/admin/users/:id/make-admin`

---

### Database Migration

For existing users, add role field:

```javascript
// Optional: Set existing admin users to "admin" role
db.users.updateMany({ isAdmin: true }, { $set: { role: "admin" } });

// Set remaining users to "user" role
db.users.updateMany({ role: { $exists: false } }, { $set: { role: "user" } });
```

---

### Security Considerations

✅ **Protected:**

- Super admin route requires JWT authentication
- Only super_admin role can promote users
- Cannot promote yourself
- Prevents promoting already-promoted users

✅ **Validation:**

- User ID validation
- Role validation (enum: user, admin, super_admin)
- Timestamp tracking (createdAt, updatedAt)

✅ **Future Enhancements:**

- Role removal/demotion functionality
- Audit logging for role changes
- Email notification on promotion
- Role expiration/time limits
- Multi-level approval workflow

---

### Testing

**Test Case 1: Successful Promotion**

```
1. Login as super_admin
2. Make request to PUT /api/admin/users/[USER_ID]/make-admin
3. Verify response status 200
4. Verify user's role changed to "admin"
```

**Test Case 2: Unauthorized Access**

```
1. Login as regular user
2. Make request to PUT /api/admin/users/[USER_ID]/make-admin
3. Verify response status 403
4. Verify user's role unchanged
```

**Test Case 3: Already Admin**

```
1. Login as super_admin
2. Make request for already-admin user
3. Verify response status 400
4. Verify message: "User is already an admin"
```

**Test Case 4: User Not Found**

```
1. Login as super_admin
2. Make request with invalid user ID
3. Verify response status 404
4. Verify message: "User not found"
```

---

### Files Modified/Created

✅ **Modified:**

- `/backend/src/models/user.model.js` - Added `role` field
- `/backend/src/middleware/admin.middleware.js` - Updated to check `role`
- `/backend/src/controllers/admin.controller.js` - Added `promoteToAdmin` method
- `/backend/src/controllers/auth.controller.js` - Added `role` to JWT token
- `/backend/src/routes/admin.routes.js` - Added new route

✨ **Created:**

- `/backend/src/middleware/super_admin.middleware.js` - New middleware

---
