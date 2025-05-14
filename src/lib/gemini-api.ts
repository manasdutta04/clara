// Gemini API configuration
// This is a utility file for managing the Gemini API key and URL

// Get the API key and URL from environment variables
export const GEMINI_API_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
  "AIzaSyC7sWT85mD0TsMVbnJOv_Ss1VpwrfybRXo"; // Fallback for development - not secure for production

// Define multiple model URLs for fallback
const GEMINI_MODELS = {
  // Primary model - latest Gemini model
  PRIMARY: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  // Fallbacks in order of preference
  FALLBACK_1: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", 
  // Remove the unsupported model and add a newer one
  FALLBACK_2: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
};

// Use the latest stable version of Gemini 1.5 Pro for better capabilities
export const GEMINI_API_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_URL) || 
  GEMINI_MODELS.PRIMARY;

// Function to check if API key is configured
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

// Function to call the Gemini API with fallback support
export async function callGeminiAPI(prompt: string) {
  // Try primary model first, then fallbacks if needed
  let currentModelUrl = GEMINI_API_URL;
  let lastError = null;
  
  // Try each model in succession until one works
  for (const modelUrl of [currentModelUrl, GEMINI_MODELS.FALLBACK_1, GEMINI_MODELS.FALLBACK_2]) {
    try {
      const result = await callSpecificGeminiModel(prompt, modelUrl);
      if (result.success) {
        return result;
      }
      lastError = result.error;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`Error with model ${modelUrl}:`, lastError);
      // Continue to next model
    }
  }
  
  // If all models failed, return the last error
  return { 
    success: false, 
    error: lastError || "All Gemini models failed to respond"
  };
}

// Function to call a specific Gemini model
async function callSpecificGeminiModel(prompt: string, modelUrl: string) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.");
    }

    // Prepare the API request - updated to match latest Gemini API structure
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    console.log("Calling Gemini API with URL:", modelUrl);
    console.log("Using API key:", GEMINI_API_KEY.substring(0, 5) + "..." + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 5));
    
    // Call the Gemini API
    const response = await fetch(`${modelUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
      
      try {
        errorDetails = JSON.parse(errorText);
        console.error("Gemini API error details:", errorDetails);
        
        // Extract more specific error information if available
        if (errorDetails.error) {
          if (errorDetails.error.message) {
            errorMessage = `Gemini API error: ${errorDetails.error.message}`;
          }
          if (errorDetails.error.status) {
            errorMessage += ` (Status: ${errorDetails.error.status})`;
          }
        }
      } catch (e) {
        console.error("Gemini API error (non-JSON):", errorText);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Extract the text content from the response with improved error handling
    let textContent = '';
    if (data.candidates && data.candidates.length > 0) {
      if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        textContent = data.candidates[0].content.parts[0].text || '';
      } else {
        console.warn("Unexpected response format - missing content or parts:", data);
      }
    } else if (data.promptFeedback && data.promptFeedback.blockReason) {
      // Content was blocked for safety reasons
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    } else {
      console.warn("Unexpected response format - missing candidates:", data);
    }
    
    return { 
      success: true, 
      data, 
      text: textContent 
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Function to extract JSON from Gemini response text
export function extractJsonFromText(text: string | undefined): any {
  if (!text) {
    throw new Error("No text content to parse");
  }
  
  try {
    // Find JSON content between code blocks or directly parse if not in code blocks
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || 
                      text.match(/```\n?(.*?)\n?```/s);
    
    if (jsonMatch && jsonMatch[1]) {
      // Parse JSON from code block
      return JSON.parse(jsonMatch[1].trim());
    } else {
      // Try to parse the entire response as JSON
      return JSON.parse(text.trim());
    }
  } catch (error) {
    console.error("Error extracting JSON from text:", error);
    throw new Error("Could not parse JSON response from Gemini API");
  }
}

// Function to list available Gemini models
export async function listAvailableModels() {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    const listModelsUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    console.log("Fetching available Gemini models...");
    
    const response = await fetch(`${listModelsUrl}?key=${GEMINI_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error listing models:", errorText);
      return { success: false, error: `Failed to list models: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    console.log("Available Gemini models:", data);
    
    // Extract just the model names for easier reference
    const modelNames = data.models ? data.models.map((model: any) => model.name) : [];
    
    return { 
      success: true, 
      data,
      modelNames 
    };
  } catch (error) {
    console.error("Error listing Gemini models:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
} 