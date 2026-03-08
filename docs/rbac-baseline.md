# RBAC Baseline - Non-Regression Reference

**Date**: 2026-02-13
**Purpose**: Document the current working state of the RBAC module to prevent regressions in future phases.

---

## Roles

| Role | Description |
|------|-------------|
| `super_admin` | Full access. Can manage users, vehicles, brands, config. |
| `editor` | Can create/update vehicles and brands. Cannot manage users. |
| `viewer` | Read-only access to admin panel. |

## Cloud Functions (Active - V2)

All three V2 functions are the **active endpoints** called by `js/admin-panel.js`:

### createManagedUserV2
- **Caller**: `admin-panel.js:1228`
- **Guard**: `verifySuperAdminV2` — checks `request.auth.uid` against `usuarios` collection, requires `rol === 'super_admin'`
- **Validation**: nombre (min 2 chars), email (contains @), password (min 6 chars), rol (super_admin|editor|viewer)
- **Duplicate check**: Queries `usuarios` by email before creating
- **Actions**: Creates Firebase Auth user + Firestore `usuarios/{uid}` document
- **Fields stored**: nombre, email, rol, estado ('activo'), uid, creadoEn, creadoPor

### deleteManagedUserV2
- **Caller**: `admin-panel.js:1277`
- **Guard**: `verifySuperAdminV2`
- **Self-delete protection**: Blocks if `uid === auth.uid`
- **Actions**: Deletes Firestore `usuarios/{uid}` document, then deletes Firebase Auth user
- **Graceful**: If Auth user already gone (`auth/user-not-found`), does not throw

### updateUserRoleV2
- **Caller**: `admin-panel.js:1211`
- **Guard**: `verifySuperAdminV2`
- **Validation**: uid required, rol must be valid
- **Actions**: Updates `rol`, `actualizadoEn`, `actualizadoPor` in Firestore. Optionally updates `nombre`.

## Cloud Functions (Legacy - V1)

V1 functions (`createManagedUser`, `deleteManagedUser`, `updateUserRole`) exist but are NOT called by the current admin panel. They are kept for backward compatibility.

**Phase 0 fix**: `verifySuperAdminV1` was corrected — it had dead code (copy-paste from `mapAdminAuthErrorV1`) instead of actual role verification logic.

## Firestore Security Rules

```
usuarios/{userId}:
  read:   auth.uid == userId OR isSuperAdmin()
  create, update, delete: isSuperAdmin()
```

- Users can read their own profile
- Only super_admin can manage user documents
- Cloud Functions with Admin SDK bypass these rules (server-side)

## Admin Panel UI (js/admin-panel.js)

- User management section visible only when `currentUserRole === 'super_admin'` (line ~1170)
- User list loaded from `usuarios` collection with `get()` (not realtime)
- Edit user: opens modal, calls `updateUserRoleV2`
- Create user: opens modal, calls `createManagedUserV2`
- Delete user: confirmation prompt, calls `deleteManagedUserV2`
- Session timeout: 5 minutes of inactivity triggers logout

## Non-Regression Test Checklist

Run these tests after ANY change that touches auth, users, or Cloud Functions:

1. [ ] super_admin can log in and see user management section
2. [ ] super_admin can create a new user (editor role)
3. [ ] New user appears in the user list immediately
4. [ ] super_admin can edit user's role (editor -> viewer)
5. [ ] super_admin can delete a user
6. [ ] Deleted user disappears from list
7. [ ] editor CANNOT see user management section
8. [ ] viewer CANNOT see user management section
9. [ ] editor CAN create/edit vehicles
10. [ ] editor CAN create/edit brands
11. [ ] editor CANNOT delete vehicles or brands
12. [ ] viewer can only read (no create/edit/delete buttons visible)
13. [ ] Session timeout after 5 min inactivity works
14. [ ] super_admin CANNOT delete their own account (self-protection)
