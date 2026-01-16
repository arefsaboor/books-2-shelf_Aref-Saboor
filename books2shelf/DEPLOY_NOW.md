# 🚀 Deploy to Vercel - Complete Guide

## ⚠️ IMPORTANT: You MUST do these 3 simple steps

I cannot access Vercel website directly, but here's **exactly** what you need to do:

---

## Step 1: Login to Vercel (1 minute)

1. Open your browser
2. Go to: https://vercel.com
3. Click "Login" or "Sign Up"
4. Login with your GitHub account

---

## Step 2: Import Your Project (2 minutes)

1. After login, click **"Add New..."** button (top right)
2. Click **"Project"**
3. You'll see your GitHub repositories
4. Find **"books-2-shelf_Aref-Saboor"** 
5. Click **"Import"** next to it

---

## Step 3: Configure Project Settings (3 minutes)

### A. Root Directory ⚠️ CRITICAL
```
Root Directory: books2shelf
```
**How to set:**
- Look for "Root Directory" field
- Click "Edit"
- Type: `books2shelf`
- Click Save

### B. Framework Settings (Usually Auto-detected)
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### C. Environment Variables ⚠️ MOST IMPORTANT

Click **"Environment Variables"** section and add these **6 variables**:

**Copy these exactly:**

```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyCu7ybGax9QvbHENewEw54aanKDijD5zYo
Environments: Production, Preview, Development ✓ (select all 3)
```

```
Name: VITE_FIREBASE_AUTH_DOMAIN
Value: books2shelf.firebaseapp.com
Environments: Production, Preview, Development ✓
```

```
Name: VITE_FIREBASE_PROJECT_ID
Value: books2shelf
Environments: Production, Preview, Development ✓
```

```
Name: VITE_FIREBASE_STORAGE_BUCKET
Value: books2shelf.firebasestorage.app
Environments: Production, Preview, Development ✓
```

```
Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 550048212654
Environments: Production, Preview, Development ✓
```

```
Name: VITE_FIREBASE_APP_ID
Value: 1:550048212654:web:21e0d1f7f90dbf85776f3f
Environments: Production, Preview, Development ✓
```

### D. Click "Deploy"

After adding all variables, click the big **"Deploy"** button!

---

## Step 4: Wait for Deployment (2-3 minutes)

Vercel will:
1. ✅ Clone your repository
2. ✅ Install dependencies
3. ✅ Build your project
4. ✅ Deploy to their CDN

You'll see a progress screen. Wait for it to finish.

---

## Step 5: Add Vercel Domain to Firebase (2 minutes)

After deployment succeeds:

1. Vercel will show your live URL (e.g., `books-2-shelf-aref-saboor.vercel.app`)
2. **Copy this URL**
3. Go to: https://console.firebase.google.com
4. Select your project: **books2shelf**
5. Go to: **Authentication** → **Settings** tab
6. Scroll to **"Authorized domains"**
7. Click **"Add domain"**
8. Paste your Vercel URL (without https://)
9. Click **"Add"**

---

## ✅ Done! Test Your Site

Visit your Vercel URL and test:
- ✅ Sign up / Login
- ✅ Add a book
- ✅ View your dashboard
- ✅ Update profile

---

## 🆘 If It Doesn't Work:

### Error: "Build Failed"
- Make sure Root Directory is set to `books2shelf`
- Check if all 6 environment variables are added
- Make sure each variable is selected for all 3 environments

### Error: "Firebase Auth Domain"
- Add your Vercel domain to Firebase authorized domains
- Wait 2-3 minutes for Firebase to update

### Error: "Blank Page"
- Press F12 to open browser console
- Look for red error messages
- Share them with me

---

## 📸 Need Visual Help?

If you're stuck on any step, take a screenshot and I can guide you through it!

---

## 🎯 Quick Checklist

- [ ] Login to Vercel
- [ ] Import project from GitHub
- [ ] Set Root Directory to `books2shelf`
- [ ] Add 6 environment variables (all with Production, Preview, Development)
- [ ] Click Deploy
- [ ] Wait for build to finish
- [ ] Copy Vercel URL
- [ ] Add URL to Firebase authorized domains
- [ ] Test your site

**Total time: ~10 minutes**

---

## Alternative: Use Vercel CLI (If you prefer terminal)

If you want to deploy from terminal instead:

1. Run: `npx vercel login`
2. Follow login instructions
3. Run: `npx vercel`
4. Answer the setup questions
5. Add environment variables via Vercel dashboard afterward

But the website method is easier! 😊
