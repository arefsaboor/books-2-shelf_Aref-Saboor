# Vercel Deployment Guide for Books2Shelf

## 🚀 Quick Deployment Steps

### Step 1: Update Firebase Configuration

Your Firebase config needs to use environment variables for security.

**Already done for you!** ✅ (See updated `src/Firebase/config.js`)

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: **books-2-shelf_Aref-Saboor**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_FIREBASE_API_KEY=AIzaSyCu7ybGax9QvbHENewEw54aanKDijD5zYo
VITE_FIREBASE_AUTH_DOMAIN=books2shelf.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=books2shelf
VITE_FIREBASE_STORAGE_BUCKET=books2shelf.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=550048212654
VITE_FIREBASE_APP_ID=1:550048212654:web:21e0d1f7f90dbf85776f3f
```

**Important:** Select **All** (Production, Preview, and Development) for each variable!

### Step 3: Verify Build Settings in Vercel

1. Go to **Settings** → **Build & Development Settings**
2. Verify these settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 4: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **...** (three dots) → **Redeploy**
4. Or push a new commit to trigger automatic deployment

---

## 🔍 Common Issues & Solutions

### Issue 1: Build fails with "Firebase is not defined"
**Solution:** Make sure all environment variables are added to Vercel

### Issue 2: 404 on page refresh
**Solution:** The `vercel.json` file already handles this with rewrites ✅

### Issue 3: Environment variables not loading
**Solution:** 
- Ensure variable names start with `VITE_`
- Redeploy after adding variables
- Check that variables are set for all environments

### Issue 4: Build succeeds but app doesn't work
**Solution:**
- Check browser console for errors
- Verify Firebase config in production
- Ensure Firebase domain is authorized

---

## 🔐 Firebase Setup (Important!)

### Add Vercel Domain to Firebase

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **books2shelf**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your Vercel domain(s):
   - `your-app.vercel.app`
   - Any custom domains you have

---

## ✅ Deployment Checklist

- [ ] Environment variables added to Vercel
- [ ] All variables set for Production, Preview, and Development
- [ ] Firebase config updated to use environment variables
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Build settings verified in Vercel
- [ ] Code committed and pushed to GitHub
- [ ] Deployment triggered (automatic or manual redeploy)
- [ ] Website accessible at Vercel URL
- [ ] Login/signup works
- [ ] Books can be added
- [ ] Profile updates work

---

## 🎯 Expected URLs

After deployment, your site will be available at:
- **Production:** `https://books-2-shelf-aref-saboor.vercel.app`
- **Or your custom domain if configured**

---

## 🔄 Continuous Deployment

Once set up, Vercel automatically deploys when you:
- Push to `main` branch (Production)
- Push to any other branch (Preview)
- Open a pull request (Preview)

---

## 📊 Monitoring

After deployment, monitor:
1. **Vercel Dashboard** → **Deployments** - Check build logs
2. **Vercel Dashboard** → **Analytics** - Track usage
3. **Browser Console** - Check for runtime errors
4. **Firebase Console** → **Authentication** - Verify users can sign in

---

## 🆘 Troubleshooting Commands

If deployment fails, check:

```bash
# Test build locally
npm run build

# Test preview locally
npm run preview

# Check for errors
npm run lint
```

---

## 📝 Notes

- Environment variables are automatically injected during build
- Vite requires variables to start with `VITE_`
- Changes to environment variables require redeployment
- Firebase credentials are safe to expose (they're client-side)
- Firebase security is controlled by security rules, not credentials

---

## ✨ Next Steps After Deployment

1. Test all features on production URL
2. Update Firebase security rules if needed
3. Deploy indexes: `firebase deploy --only firestore:indexes`
4. Deploy rules: `firebase deploy --only firestore:rules`
5. Set up custom domain (optional)
6. Configure analytics (optional)

---

## 🎉 Success!

Once deployed, your Books2Shelf app will be live on Vercel with:
- ✅ Automatic deployments on push
- ✅ HTTPS enabled
- ✅ Global CDN
- ✅ Fast performance
- ✅ Free hosting

**Your app will be live at:** `https://books-2-shelf-aref-saboor.vercel.app`
