# Environment Variables

This document describes the environment variables that should be set for this project to function correctly.

## API Keys

### Google Gemini API

The AI Diagnosis page uses Google's Gemini API for advanced health assessments. You need to set up the following variables in a `.env` file at the root of the project:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

Replace `your_gemini_api_key_here` with your actual Gemini API key.

### Getting a Gemini API Key

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Copy the API key to your `.env` file

## Firebase Configuration

If you're using Firebase authentication and other Firebase features, you'll need to set up these variables as well:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Usage in Code

Environment variables can be accessed in code using:

```typescript
// For Vite projects
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// For Create React App projects
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
```

## Security Notes

- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use environment-specific configurations for different deployment environments
- Consider using a secrets management service for production deployments 