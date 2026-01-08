# App Flow Changes Implementation Plan

## 1. Public Job Posting Flow
**Goal**: Allow non-logged users to fill job form, require login only at publish

### Changes Needed:
- [ ] Remove auth protection from `/customer/post-job` route
- [ ] Store job draft in localStorage during form filling
- [ ] At publish step, check if user is logged in
- [ ] If not logged in, redirect to login with return URL
- [ ] After login/signup, restore draft and auto-publish
- [ ] Add email verification check before publishing

### Files to Modify:
- `src/App.tsx` - Remove ProtectedRoute from post-job
- `src/pages/customer/PostJob.tsx` - Add login check at publish, localStorage draft
- `src/pages/auth/CustomerAuth.tsx` - Handle return URL after login
- `src/api/auth.ts` - Add emailVerified field to user type

## 2. Email Verification
**Goal**: Require email verification before job publishing

### Changes Needed:
- [ ] Check user.emailVerified before allowing publish
- [ ] Show verification prompt if not verified
- [ ] Add resend verification email button

### Files to Modify:
- `src/pages/customer/PostJob.tsx` - Add verification check
- `src/api/auth.ts` - Add resend verification endpoint

## 3. Favorites for Both Roles
**Goal**: Enable favorites for customers and vendors

### Changes Needed:
- [ ] Update favorites API to work for both roles
- [ ] Add favorites page for customers
- [ ] Update navigation to show favorites for both

### Files to Modify:
- `src/api/favorites.ts` - Already supports both roles
- `src/components/layout/Header.tsx` - Show favorites for both
- Add customer favorites page

## 4. Messages for Both Roles
**Goal**: Both can access messages, vendors initiate

### Changes Needed:
- [ ] Already implemented - just verify access

### Files to Check:
- `src/pages/vendor/Messages.tsx` - ✓ Already exists
- `src/pages/customer/Messages.tsx` - ✓ Already exists

## 5. Role-based Navigation
**Goal**: Show only accessible pages in dropdown

### Changes Needed:
- [ ] Update Header dropdown to filter by role
- [ ] Remove cross-role navigation items

### Files to Modify:
- `src/components/layout/Header.tsx` - Filter dropdown items by role

## 6. Profile Completion
**Goal**: Customers can skip, vendors cannot

### Changes Needed:
- [ ] Remove "Skip" button from vendor onboarding
- [ ] Keep "Skip" button for customer onboarding
- [ ] Customers provide phone/address during job posting

### Files to Modify:
- `src/pages/onboarding/VendorOnboarding.tsx` - Remove skip button
- `src/pages/onboarding/CustomerOnboarding.tsx` - Keep skip button
- `src/pages/customer/PostJob.tsx` - Add phone/address fields

## 7. Vendor Verification Badge
**Goal**: Show unverified status, allow messaging while unverified

### Changes Needed:
- [ ] Add verification status to vendor profile
- [ ] Show "Unverified" badge in messages
- [ ] Make verification docs upload optional

### Files to Modify:
- `src/pages/onboarding/VendorOnboarding.tsx` - Make docs optional
- `src/components/messages/ChatInterface.tsx` - Show verification badge
- `src/api/auth.ts` - Add isVerified field

## Priority Order:
1. Public job posting (most critical)
2. Email verification
3. Role-based navigation
4. Profile completion rules
5. Vendor verification badge
6. Favorites for customers (already mostly done)

## Implementation Steps:
Start with #1 (Public Job Posting) as it's the most impactful change.
