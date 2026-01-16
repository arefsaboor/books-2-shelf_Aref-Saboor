# Testing Guide - New Firebase Structure

## Quick Start

### 1. Start Development Server
```bash
cd /Users/arefsaboor/Downloads/Modul-3/books-2-shelf_Aref-Saboor/books2shelf
npm run dev
```

### 2. Test User Signup
1. Navigate to signup page
2. Create new account with email/password
3. **Expected Result:**
   - User authenticated
   - `Users/[userId]/userData/info` document created
   - `Users/[userId]/userProfile/info` document created
   - Redirected to dashboard

### 3. Test Google Sign-In
1. Click "Sign in with Google"
2. Complete Google authentication
3. **Expected Result:**
   - User authenticated
   - If new user: `userData` and `userProfile` created
   - If existing user: just signed in
   - Redirected to dashboard

### 4. Test Adding Books
1. Search for a book
2. Click "Add to Shelf"
3. **Expected Result:**
   - Success message displayed
   - Book saved to `Users/[userId]/userShelf/[bookId]`
   - Book has thumbnail (HTTPS URL)
   - Book data is flattened (title, authors directly accessible)

### 5. Test Dashboard
1. Navigate to dashboard
2. **Expected Result:**
   - All books displayed
   - Book thumbnails visible (HTTPS images)
   - Statistics show correct counts
   - Books sorted by newest first

### 6. Test Book Status Update
1. On dashboard, change a book's status
2. **Expected Result:**
   - Status updates in Firebase
   - Statistics update automatically
   - No page refresh needed

### 7. Test Book Removal
1. Click remove/delete on a book
2. **Expected Result:**
   - Book removed from shelf
   - Statistics update automatically
   - Book disappears from dashboard

## Firebase Console Checks

### Check User Data Structure
1. Open Firebase Console
2. Go to Firestore Database
3. Navigate to: `Users → [your-user-id]`
4. Verify structure:
   ```
   Users/
     └── [userId]/
         ├── userData/
         │   └── info (should have email, displayName, etc.)
         ├── userProfile/
         │   └── info (should have bio, photoURL, etc.)
         └── userShelf/
             └── [bookId] (one document per book)
   ```

### Check Book Data
1. Open any book document in `userShelf`
2. Verify fields are flat (not nested):
   - ✅ `title: "Book Title"`
   - ✅ `authors: ["Author Name"]`
   - ✅ `thumbnail: "https://..."`
   - ❌ NOT `volumeInfo.title` (should be flattened)

### Check Thumbnails
1. Look at `thumbnail` field in book documents
2. Should be direct HTTPS URL: `"https://books.google.com/books/content?id=..."`
3. NOT nested in `imageLinks` object

## Browser Console Checks

Open browser console (F12) and look for debug logs:

### When Adding Book:
```
Adding book to shelf: {id: "...", volumeInfo: {...}}
Book volumeInfo: {title: "...", authors: [...], ...}
Book added successfully: {success: true, book: {...}, message: "..."}
```

### When Loading Dashboard:
```
Dashboard received books: [{...}, {...}]
First book data: {id: "...", title: "...", thumbnail: "https://..."}
First book thumbnail: "https://..."
```

### Expected: No Errors
- No "Cannot read property of undefined" errors
- No "Document not found" errors
- No 403 permission errors (if rules are set correctly)

## Common Issues & Solutions

### Issue: Books show but no images
**Check:**
1. Open browser console
2. Look for thumbnail URL in book data
3. Verify it's HTTPS (not HTTP)
4. Check if URL is valid by opening in new tab

**Solution:** 
- userService.js already converts HTTP to HTTPS
- If still failing, check Google Books API response

### Issue: "Permission denied" errors
**Solution:** Update Firebase Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Users/{userId} {
      match /userData/info {
        allow read, write: if request.auth.uid == userId;
      }
      match /userProfile/info {
        allow read: if true;
        allow write: if request.auth.uid == userId;
      }
      match /userShelf/{bookId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

### Issue: Books not showing on dashboard
**Check:**
1. Browser console for errors
2. Firebase Console for book documents
3. User is authenticated (currentUser exists)

**Debug:**
```javascript
// In Dashboard.jsx, check these console.logs:
console.log('Dashboard received books:', books);
console.log('First book thumbnail:', books[0]?.thumbnail);
```

### Issue: Statistics not updating
**Check:**
1. `getShelfStats()` is being called after updates
2. Stats state is being set correctly
3. No errors in console

## Vercel Deployment Testing

### Before Deploying:
1. ✅ Test all features locally first
2. ✅ Ensure build succeeds: `npm run build`
3. ✅ Check all environment variables are in `.env.local`

### After Deploying:
1. Add Vercel domain to Firebase authorized domains:
   - Firebase Console → Authentication → Settings
   - Add: `your-project.vercel.app`

2. Verify environment variables in Vercel:
   - Project Settings → Environment Variables
   - Check all 6 VITE_FIREBASE_* variables exist

3. Test on live site:
   - Signup
   - Add books
   - View dashboard
   - Update status
   - Remove book

### If Issues on Vercel:
1. Check Vercel deployment logs
2. Check browser console on live site
3. Verify Firebase authorized domains include Vercel URL
4. Check environment variables are all set

## Success Criteria

✅ New users create userData + userProfile automatically
✅ Books save to Users/[userId]/userShelf/[bookId]
✅ Book data is flattened (no nested volumeInfo)
✅ Thumbnails display correctly (HTTPS URLs)
✅ Dashboard loads all books
✅ Statistics show correct counts
✅ Status updates work
✅ Book removal works
✅ No console errors
✅ Build succeeds
✅ Deploys to Vercel successfully

## Next Steps After Testing

1. If all tests pass locally → Push to GitHub
2. Vercel auto-deploys → Test on live site
3. If live tests pass → Update Firebase security rules for production
4. Remove debug console.log statements (optional)
5. Deprecate old `bookshelfServiceNew.js` file
6. Update any remaining components that might use old structure
