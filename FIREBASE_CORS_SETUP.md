# Firebase Storage CORS Configuration

When developing locally, you may encounter CORS (Cross-Origin Resource Sharing) errors when trying to upload files to Firebase Storage. This document explains how to configure CORS for your Firebase Storage bucket.

## What is CORS?

CORS is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page. This is a security measure to prevent malicious websites from accessing data from other websites.

## CORS Errors in Development

When running your app locally (e.g., on `http://localhost:5173`), you may see errors like:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Setting Up CORS for Firebase Storage

1. **Install Firebase CLI** (if you haven't already):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set up your project**:
   ```bash
   firebase use your-project-id
   ```

4. **Use the CORS configuration file**:
   We've provided a `cors.json` file in the root of this project with the necessary configuration.

5. **Apply the CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://your-project-id.appspot.com
   ```
   Replace `your-project-id.appspot.com` with your actual Firebase Storage bucket name (usually `project-id.appspot.com`).

6. **Verify the CORS configuration**:
   ```bash
   gsutil cors get gs://your-project-id.appspot.com
   ```

## Alternative: Using the Firebase Console

If you don't have `gsutil` installed, you can also set up CORS using the Firebase Console:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Storage
4. Click on the "Rules" tab
5. Add the following CORS configuration to your rules:

```
cors {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://clara-io.web.app", "https://clara-io.firebaseapp.com"];
  method: ["GET", "PUT", "POST", "DELETE", "HEAD"];
  maxAgeSeconds: 3600;
  responseHeader: ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"];
}
```

## Local Development Workaround

The app has been updated to handle CORS errors gracefully during local development:

1. When running on localhost, the app will detect potential CORS issues
2. Instead of attempting actual uploads, it will generate mock URLs
3. This allows you to continue development without needing to configure CORS

However, for production use, you should properly configure CORS as described above. 