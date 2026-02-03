# Auth Shell Manual Test Plan (US1)

## Setup
- Start dev server: `npm run dev`
- Open: `http://localhost:5173`
  - If using the http-server script, use `http://localhost:8080`

## Test Cases

### 1) Unauthenticated redirect
- URL: `/dashboard`
- Expected: Redirects to `/login` and shows the login form.

### 2) Login validation
- URL: `/login`

Case A: Invalid email
- Input: `bademail` + any password
- Expected: "Please enter valid email address."

Case B: Weak password
- Input: `user@example.com` + `weakpass`
- Expected: "Password must be 8+ chars with uppercase, lowercase, number."

Case C: Invalid credentials
- Input: valid email + valid-format password
- Expected: "Invalid email or password."

### 3) Registration flow
- URL: `/signup`

Case A: Invalid email
- Input: `bademail` + `StrongPass1`
- Expected: "Please enter valid email address."

Case B: Weak password
- Input: `user@example.com` + `weakpass`
- Expected: "Password must be 8+ chars with uppercase, lowercase, number."

Case C: Email exists
- Input: existing email + `StrongPass1`
- Expected: "Email already registered. Please sign in."

Case D: Success
- Input: new email + `StrongPass1`
- Expected: Confirmation code prompt appears.

Case E: Confirmation failure
- Input: wrong/expired code
- Expected: "Unable to confirm account. Please try again."

### 4) Confirm + sign-in
- URL: `/signup`
- Input: valid email + `StrongPass1`, then correct confirmation code
- Expected: Auto sign-in and redirect to `/dashboard`.

### 5) Authenticated access
- URL: `/dashboard`
- Expected: Dashboard placeholder renders.

### 6) Sign out
- Action: Trigger sign-out in the authenticated shell (when available in UI).
- Expected: Redirect to `/login`, and `/dashboard` is protected again.
