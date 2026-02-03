# BetaLink Tester Workflow - Testing Guide

## How to Test All Features

### Step 1: Create a Developer Account
1. Go to http://localhost:5174/signup
2. Fill in the form:
   - Full Name: John Developer
   - Email: developer@test.com
   - Password: test123
   - **Role: Developer**
3. Click "Sign Up"
4. You'll be redirected to Developer Dashboard

### Step 2: Upload an App (as Developer)
1. On Developer Dashboard, click "Add App" button
2. Fill in app details:
   - Title: Test App 1
   - Description: This is a test application for testers
   - APK File: Upload any .apk file (or create a dummy one)
3. Click "Upload"
4. The app should appear in your dashboard

### Step 3: Create a Tester Account
1. Logout from Developer Dashboard
2. Go to http://localhost:5174/signup
3. Fill in the form:
   - Full Name: Jane Tester
   - Email: tester@test.com
   - Password: test123
   - **Role: Tester** ⭐ (IMPORTANT!)
4. Click "Sign Up"
5. You should be automatically redirected to **Tester Dashboard**

## Features to Verify in Tester Dashboard

### ✅ Feature 1: View All Apps
- You should see all apps uploaded by developers
- Each app card displays:
  - App logo (first letter of app name)
  - App title
  - Developer name (e.g., "By John Developer")
  - App description

### ✅ Feature 2: Download Button
1. Click the green "Download" button on any app card
2. The APK file should download to your device
3. File name: `[AppName].apk`

### ✅ Feature 3: Review Button
1. Click the blue "Review" button on any app card
2. A modal should open with:
   - Rating dropdown (1-5 stars)
   - Feedback textarea for bugs/errors/test results
3. Fill in:
   - Rating: 4
   - Feedback: "Found a minor bug in login screen"
4. Click "Send"
5. Success message should appear
6. Modal closes automatically

### ✅ Feature 4: Contact Button
1. Click the purple "Contact" button on any app card
2. You should be redirected to Chat Page
3. URL includes app context: `/chat/[developerId]?appId=...&appTitle=...`

### ✅ Feature 5: App-Linked Chat
1. In the Chat Page header, you should see:
   - Developer name
   - "💬 Conversation about: [App Name]"
2. Send a message: "Hi, I tested your app"
3. Message should be sent and linked to the specific app

### ✅ Feature 6: Role-Based Routing
- **Developer** login → Redirects to `/dashboard`
- **Tester** login → Redirects to `/tester-dashboard` ⭐
- **Client** login → Redirects to `/dashboard`

## Troubleshooting

### If Tester Dashboard is empty:
1. Make sure you logged in as **Developer** first and uploaded at least one app
2. Logout and login as **Tester**
3. Check Backend console for errors

### If redirect doesn't work:
1. Check browser console for errors
2. Verify you selected "Tester" role during signup
3. Check localStorage: `localStorage.getItem('betalink_user')`

### If downloads don't work:
1. Backend must be running (Port 5000)
2. APK file must exist in `Backend/uploads/` folder
3. Check browser downloads folder

### If contact form doesn't work (Welcome page):
1. Make sure nodemailer is configured
2. Check EMAIL_USER and EMAIL_PASS in .env file
3. For Gmail, you need an App Password (not regular password)

## Quick Test Commands

### Check if user is stored correctly:
```javascript
// Open browser console
JSON.parse(localStorage.getItem('betalink_user'))
// Should show: { id: "...", fullName: "...", email: "...", role: "tester" }
```

### Check backend API:
```
GET http://localhost:5000/api/health
GET http://localhost:5000/api/apps (with Authorization header)
```

## Current URLs:
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000
- Tester Dashboard: http://localhost:5174/tester-dashboard
- Developer Dashboard: http://localhost:5174/dashboard
