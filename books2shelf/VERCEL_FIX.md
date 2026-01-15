# ✅ Vercel Deployment Checklist

## Quick Fix for "Website Not Working" on Vercel

### Problem
You connected your GitHub repo to Vercel, but the website doesn't work.

### Solution (2 Steps)

---

## Step 1: Add Environment Variables to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 6 variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCu7ybGax9QvbHENewEw54aanKDijD5zYo` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `books2shelf.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `books2shelf` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `books2shelf.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `550048212654` |
| `VITE_FIREBASE_APP_ID` | `1:550048212654:web:21e0d1f7f90dbf85776f3f` |

**Important:** For each variable, select ALL environments (Production, Preview, Development)

---

## Step 2: Add Vercel Domain to Firebase

Go to: **Firebase Console → Authentication → Settings → Authorized domains**

Click **Add domain** and add:
```
your-app-name.vercel.app
```

(Replace `your-app-name` with your actual Vercel domain)

---

## Step 3: Redeploy

Push new code or manually redeploy in Vercel:

```bash
git add .
git commit -m "Update Firebase config"
git push origin main
```

Or in Vercel Dashboard: **Deployments → Latest → ... → Redeploy**

---

## ✅ That's It!

Your website should now work on Vercel!

**Test your site:**
- Visit your Vercel URL
- Try to sign up/login
- Add a book
- Check if everything works

---

## 🔍 Still Not Working?

### Check 1: Environment Variables
- Go to Vercel → Settings → Environment Variables
- Make sure all 6 variables are there
- Make sure "Production" is selected for each

### Check 2: Firebase Domain
- Go to Firebase Console → Authentication → Settings
- Check if your Vercel domain is in "Authorized domains"

### Check 3: Build Logs
- Go to Vercel → Deployments → Latest deployment
- Click "Building" to see logs
- Look for error messages

### Check 4: Browser Console
- Open your Vercel website
- Press F12 to open developer tools
- Check Console tab for errors

---

## 📝 Files Updated

These files have been updated for Vercel deployment:

- ✅ `src/Firebase/config.js` - Now uses environment variables
- ✅ `.env.local` - Local development environment variables
- ✅ `.env.example` - Example environment file
- ✅ `vercel.json` - Vercel routing configuration (already existed)

---

## 🎯 Your Next Steps

1. [ ] Add 6 environment variables to Vercel
2. [ ] Add Vercel domain to Firebase authorized domains
3. [ ] Push code to GitHub (or redeploy manually)
4. [ ] Wait for deployment to complete
5. [ ] Test your website
6. [ ] Share your live URL! 🎉

---

**Need detailed instructions?** 
Check `VERCEL_SETUP.md` for step-by-step guide with screenshots.
