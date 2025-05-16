# Deploying Clara to Vercel

This guide will walk you through deploying Clara to Vercel for production.

## Prerequisites

- A [Vercel](https://vercel.com) account
- Your project pushed to a GitHub repository

## Deployment Steps

### 1. Connect to GitHub

1. Log in to your Vercel account
2. Click "Add New..." > "Project"
3. Connect your GitHub account if not already connected
4. Select the Clara repository

### 2. Configure Project

The default settings should work, but make sure:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables

If your app uses environment variables (like Firebase keys), add them in the Vercel deployment interface:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" > "Domains"
2. Add your custom domain and follow the verification steps

## Continuous Deployment

Vercel will automatically redeploy your app when you push changes to your GitHub repository.

## Troubleshooting

- If you encounter build errors, check the build logs in Vercel
- For routing issues, verify that the `vercel.json` file is properly configured
- For environment variable issues, make sure they're correctly set in the Vercel dashboard

## Local Preview Before Deploying

To preview your production build locally:

```bash
npm run build
npm run preview
``` 