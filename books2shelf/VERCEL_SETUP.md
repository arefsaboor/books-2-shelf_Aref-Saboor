# 🚀 Vercel Deployment - Step-by-Step Guide

## ✅ Prerequisites Done

- ✅ Firebase config updated to use environment variables
- ✅ `.env.local` created for local development
- ✅ `vercel.json` configured for SPA routing
- ✅ Build tested successfully

---

## 📝 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

```bash
cd /Users/arefsaboor/Downloads/Modul-3/books-2-shelf_Aref-Saboor/books2shelf

# Add all changes
git add .

# Commit with message
git commit -m "Update Firebase config for Vercel deployment"

# Push to GitHub
git push origin main
```

---

### Step 2: Configure Vercel Environment Variables

1. **Go to Vercel:** https://vercel.com/dashboard

2. **Select your project:** `books-2-shelf_Aref-Saboor`

3. **Go to Settings** → **Environment Variables**

4. **Add these 6 variables ONE BY ONE:**

   **Variable 1:**
   ```
   Name: VITE_FIREBASE_API_KEY
   Value: AIzaSyCu7ybGax9QvbHENewEw54aanKDijD5zYo
   Environment: Production, Preview, Development (Select ALL)
   ```

   **Variable 2:**
   ```
   Name: VITE_FIREBASE_AUTH_DOMAIN
   Value: books2shelf.firebaseapp.com
   Environment: Production, Preview, Development (Select ALL)
   ```

   **Variable 3:**
   ```
   Name: VITE_FIREBASE_PROJECT_ID
   Value: books2shelf
   Environment: Production, Preview, Development (Select ALL)
   ```

   **Variable 4:**
   ```
   Name: VITE_FIREBASE_STORAGE_BUCKET
   Value: books2shelf.firebasestorage.app
   Environment: Production, Preview, Development (Select ALL)
   ```

   **Variable 5:**
   ```
   Name: VITE_FIREBASE_MESSAGING_SENDER_ID
   Value: 550048212654
   Environment: Production, Preview, Development (Select ALL)
   ```

   **Variable 6:**
   ```
   Name: VITE_FIREBASE_APP_ID
   Value: 1:550048212654:web:21e0d1f7f90dbf85776f3f
   Environment: Production, Preview, Development (Select ALL)
   ```

5. **Click "Save"** after adding each variable

---

### Step 3: Verify Build Settings

1. Go to **Settings** → **Build & Development Settings**

2. Verify these settings:

   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node.js Version: 18.x (or latest)
   ```

3. If anything is wrong, click **Edit** and update it

---

### Step 4: Trigger Deployment

**Option A: Automatic (Recommended)**
- Just push your code to GitHub
- Vercel will automatically deploy

**Option B: Manual Redeploy**
1. Go to **Deployments** tab
2. Click on the latest deployment (top one)
3. Click the **...** (three dots menu)
4. Click **Redeploy**
5. Check "Use existing Build Cache" if you want faster deployment
6. Click **Redeploy**

---

### Step 5: Add Vercel Domain to Firebase

**IMPORTANT:** Your app won't work until you do this!

1. Go to Firebase Console: https://console.firebase.google.com

2. Select your project: **books2shelf**

3. Go to **Authentication** → **Settings** → **Authorized domains**

4. Click **Add domain**

5. Add your Vercel domain:
   ```
   books-2-shelf-aref-saboor.vercel.app
   ```
   (Replace with your actual Vercel domain)

6. If you have a custom domain, add that too

7. Click **Add**

---

### Step 6: Wait for Deployment

1. Go back to Vercel **Deployments** tab

2. Watch the deployment progress:
   - **Building** - Compiling your app
   - **Deploying** - Uploading to CDN
   - **Ready** - Deployment complete! ✅

3. Click on the deployment URL to visit your site

---

## ✅ Verification Checklist

After deployment, test these features:

- [ ] Website loads at Vercel URL
- [ ] Homepage displays correctly
- [ ] Search books works
- [ ] Sign up works
- [ ] Login works
- [ ] Google sign-in works
- [ ] Add book to shelf works
- [ ] View bookshelf works
- [ ] Profile page loads
- [ ] Profile picture upload works
- [ ] Book details page works
- [ ] Notes can be saved
- [ ] No console errors

---

## 🔍 Troubleshooting

### Problem 1: "Firebase: Error (auth/configuration-not-found)"

**Solution:**
- Add Vercel domain to Firebase Authorized domains
- Wait 2-3 minutes for Firebase to update
- Clear browser cache and try again

---

### Problem 2: White screen / Blank page

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Most likely: Environment variables not set correctly
4. Go back to Step 2 and verify all 6 variables are added
5. Make sure you selected ALL environments (Production, Preview, Development)
6. Redeploy after fixing

---

### Problem 3: Build fails in Vercel

**Solution:**
1. Check the build logs in Vercel
2. Look for the error message
3. Common issues:
   - Missing dependencies: Run `npm install` locally and commit `package-lock.json`
   - Syntax errors: Run `npm run build` locally to test
   - Import errors: Check file paths and imports

---

### Problem 4: Works locally but not on Vercel

**Solution:**
- Environment variables issue
- Verify all variables in Vercel match your `.env.local`
- Check that variable names start with `VITE_`
- Redeploy after adding/updating variables

---

### Problem 5: 404 on page refresh

**Solution:**
- Already fixed! ✅
- The `vercel.json` file handles this
- If still happening, verify `vercel.json` is committed to GitHub

---

## 📊 Your Deployment URLs

After successful deployment, your app will be available at:

**Production URL:**
```
https://books-2-shelf-aref-saboor.vercel.app
```

**Preview URLs** (for each branch/PR):
```
https://books-2-shelf-aref-saboor-[branch-name].vercel.app
```

---

## 🔄 Future Deployments

**Automatic Deployment:**
Every time you push to GitHub, Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys to production (if main branch)
4. Or creates preview URL (if other branch)

**Manual Deployment:**
1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click **Redeploy** on any deployment

---

## 🎯 Post-Deployment Tasks

### 1. Deploy Firebase Indexes

```bash
firebase deploy --only firestore:indexes
```

### 2. Deploy Firebase Security Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Test Everything

Go through your app and test:
- User registration
- Login/logout
- Add/remove books
- Update profile
- Save notes
- All features

### 4. Monitor Performance

- Check Vercel Analytics
- Monitor Firebase Console for errors
- Check browser console for issues

---

## 🔐 Security Notes

✅ **Safe to Expose:**
- Firebase API key
- Firebase Auth domain
- Project ID
- Storage bucket
- App ID

These are client-side credentials. Security is managed by:
- Firebase Security Rules
- Firebase Auth
- Firestore Rules

❌ **Never Expose:**
- Firebase Admin SDK credentials
- Database passwords
- Server-side API keys
- OAuth secrets

---

## 🎉 Success!

Once all steps are complete:
- ✅ Your app is live on Vercel
- ✅ HTTPS enabled automatically
- ✅ Hosted on global CDN
- ✅ Automatic deployments on push
- ✅ Free hosting

**Share your app:**
```
https://books-2-shelf-aref-saboor.vercel.app
```

---

## 📞 Need Help?

If you're stuck:
1. Check Vercel build logs for errors
2. Check browser console for runtime errors
3. Verify all environment variables are set
4. Verify Vercel domain is in Firebase authorized domains
5. Try manual redeploy
6. Clear browser cache

---

## 📝 Quick Reference

**Add environment variable:**
```
Vercel Dashboard → Project → Settings → Environment Variables
```

**Trigger deployment:**
```
git push origin main
```

**View logs:**
```
Vercel Dashboard → Deployments → [Your Deployment] → Building
```

**Add Firebase domain:**
```
Firebase Console → Authentication → Settings → Authorized domains
```

---

**You're all set! Your app should now be live on Vercel! 🚀**
