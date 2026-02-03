# 🧪 Tester Workflow Features - Quick Test Checklist

## 🚀 Quick Start (Seed Demo Data)

Run this command to create test accounts and sample apps:
```bash
cd Backend
node seedDemoData.js
```

This creates:
- ✅ Developer account: `developer@test.com` / `test123`
- ✅ Tester account: `tester@test.com` / `test123`  
- ✅ 3 sample apps

---

## 📋 Feature Testing Checklist

### ✅ 1. Tester Dashboard Access
- [ ] Go to http://localhost:5174/signup
- [ ] Create account with **Role: Tester**
- [ ] After login, verify redirect to `/tester-dashboard`
- [ ] See "Tester Dashboard" title with your name

**Expected**: Automatic redirect to tester-specific dashboard

### ✅ 2. View All Apps
- [ ] Login as tester: `tester@test.com` / `test123`
- [ ] See grid of app cards on dashboard
- [ ] Each card shows:
  - [ ] App logo (letter icon)
  - [ ] App title
  - [ ] Developer name ("By John Developer")
  - [ ] App description

**Expected**: All apps uploaded by developers are visible

### ✅ 3. Download Button
- [ ] Find green "Download" button on any app card
- [ ] Click the button
- [ ] Check browser downloads folder
- [ ] File should be named `[AppTitle].apk`

**Expected**: APK file downloads to your device

**Note**: If 404 error, upload a real APK file as developer first

### ✅ 4. Review Button (Modal)
- [ ] Find blue "Review" button on any app card
- [ ] Click to open modal
- [ ] Modal shows:
  - [ ] App title in header
  - [ ] Rating dropdown (1-5)
  - [ ] Feedback textarea
  - [ ] Cancel and Send buttons
- [ ] Fill in feedback: "Found login bug"
- [ ] Click "Send"
- [ ] See success message
- [ ] Modal closes automatically

**Expected**: Review submitted and saved to database

### ✅ 5. Contact Button (Developer Chat)
- [ ] Find purple "Contact" button on any app card  
- [ ] Click the button
- [ ] Verify redirect to chat page
- [ ] URL includes: `/chat/[developerId]?appId=...&appTitle=...`

**Expected**: Opens chat with that app's developer

### ✅ 6. App-Linked Chat
- [ ] In chat page header, see:
  - [ ] Developer name (top)
  - [ ] "💬 Conversation about: [App Name]" (below name)
- [ ] Type message: "Hi, tested your app"
- [ ] Click Send
- [ ] Message appears in chat

**Expected**: Chat shows which app the conversation is about

### ✅ 7. Role-Based Routing
Test 3 scenarios:

**A. Tester Login**
- [ ] Login as: `tester@test.com` / `test123`
- [ ] Redirects to: `/tester-dashboard` ✅
- [ ] Try visiting `/dashboard` → redirected back to `/tester-dashboard`

**B. Developer Login**  
- [ ] Login as: `developer@test.com` / `test123`
- [ ] Redirects to: `/dashboard` ✅
- [ ] Try visiting `/tester-dashboard` → redirected back to `/dashboard`

**C. Client Login**
- [ ] Create account with Role: Client
- [ ] Redirects to: `/dashboard`

**Expected**: Each role sees their appropriate dashboard

---

## 🔍 Verification Commands

### Check logged-in user role:
Open browser console and run:
```javascript
JSON.parse(localStorage.getItem('betalink_user'))
// Should show: { role: "tester", fullName: "...", email: "..." }
```

### Check if apps exist in database:
Use MongoDB Compass or run:
```bash
# In Backend folder
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const App = mongoose.model('App', new mongoose.Schema({}, { strict: false }));
  const apps = await App.find();
  console.log('Total apps:', apps.length);
  apps.forEach(app => console.log('-', app.title));
  process.exit(0);
});
"
```

---

## 🐛 Troubleshooting

### Issue: Tester Dashboard is empty
**Solution**: 
1. Make sure backend is running: `cd Backend && node server.js`
2. Login as developer and upload at least 1 app
3. Logout and login as tester
4. Check browser console for API errors

### Issue: Not redirecting to tester dashboard
**Solution**:
1. Verify you selected "Tester" role during signup
2. Check localStorage: `localStorage.getItem('betalink_user')`
3. Clear cache and login again

### Issue: Download button shows 404
**Solution**:
1. Upload a real APK file through Developer Dashboard
2. Or create dummy files:
```bash
cd Backend/uploads
echo "dummy" > sample-app-1.apk
```

### Issue: Contact button doesn't navigate
**Solution**:
1. Check browser console for errors
2. Verify developer ID exists in app data
3. Make sure React Router is configured correctly

---

## 📊 Feature Status

| Feature | Status | Route/Component |
|---------|--------|-----------------|
| Tester Dashboard | ✅ Implemented | `/tester-dashboard` |
| App Listing | ✅ Implemented | `TesterDashboard.jsx` |
| Download APK | ✅ Implemented | `GET /api/apps/download/:id` |
| Review Modal | ✅ Implemented | `TesterDashboard.jsx` |
| Submit Review | ✅ Implemented | `POST /api/reviews` |
| Contact Developer | ✅ Implemented | Chat navigation |
| App-Linked Chat | ✅ Implemented | `ChatPage.jsx` + Message model |
| Role-Based Routing | ✅ Implemented | `Signup.jsx` redirects |

---

## 🎯 Next Steps

1. **Run seed script** to create test data
2. **Login as tester** to see all features
3. **Test each button** (Download, Review, Contact)
4. **Check chat** shows app context
5. **Switch accounts** to verify role-based routing

---

## 💡 Pro Tips

- Use Chrome DevTools Network tab to debug API calls
- Check MongoDB Compass to see data in database
- Use `console.log(user)` in components to debug auth
- Clear localStorage if you need a fresh start
