// Groq API configuration
// This is a utility file for managing the Groq API key and URL

// Get the API key from environment variables
export const GROQ_API_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) || 
  ""; // You need to provide your Groq API key in the environment variables

// Groq API endpoint
export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Available models (from most to least capable)
const GROQ_MODELS = {
  LLAMA3_70B: "llama3-70b-8192", // Most powerful Llama model
  LLAMA3_8B: "llama3-8b-8192",   // Smaller, faster Llama model
  MIXTRAL: "mixtral-8x7b-32768", // Long context model
  GEMMA: "gemma-7b-it"           // Google's Gemma model
};

// Default model to use
export const DEFAULT_MODEL = GROQ_MODELS.LLAMA3_70B;

// Function to check if Groq API key is configured
export function isGroqConfigured(): boolean {
  return !!GROQ_API_KEY;
}

// Main function to call Groq API with fallback support
export async function callGroqAPI(
  prompt: string, 
  history: { role: 'user' | 'assistant', content: string }[] = [],
  options: {
    model?: string,
    temperature?: number,
    maxTokens?: number,
    systemPrompt?: string
  } = {}
) {
  try {
    // Check if API key is available
    if (!isGroqConfigured()) {
      throw new Error("Groq API key is not configured. Please set VITE_GROQ_API_KEY in your environment variables.");
    }

    // Default options
    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature ?? 0.5;
    const maxTokens = options.maxTokens ?? 1024;
    const systemPrompt = options.systemPrompt || 
      "You are a mental health assistant named Clara. You provide supportive, compassionate responses to help users with stress, anxiety, and depression. Offer practical advice and coping strategies, while being conversational and empathetic. Never claim to be a substitute for professional mental health care.";

    // Prepare messages array
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...history,
      {
        role: "user",
        content: prompt
      }
    ];

    console.log(`Calling Groq API with model: ${model}`);
    
    // Call the Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      let errorMessage = `Groq API error: ${response.status} ${response.statusText}`;
      
      try {
        errorDetails = JSON.parse(errorText);
        console.error("Groq API error details:", errorDetails);
        
        // Extract more specific error information if available
        if (errorDetails.error) {
          errorMessage = `Groq API error: ${errorDetails.error.message || errorDetails.error}`;
        }
      } catch (e) {
        console.error("Groq API error (non-JSON):", errorText);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Extract the response content
    let responseContent = '';
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      responseContent = data.choices[0].message.content;
    } else {
      console.warn("Unexpected response format:", data);
      throw new Error("Unexpected response format from Groq API");
    }

    return {
      success: true,
      data,
      text: responseContent
    };
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Function to list available Groq models (if needed in the future)
export function getAvailableModels() {
  return Object.values(GROQ_MODELS);
} 