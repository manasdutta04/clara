import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  FilePlus, 
  PenLine, 
  Pill, 
  PlusCircle, 
  Stethoscope, 
  Brain, 
  History, 
  Download, 
  ArrowRight, 
  ArrowLeft,
  Search, 
  HelpCircle, 
  Calendar,
  Clock,
  BarChart,
  FileText,
  Sparkles,
  KeyRound,
  RefreshCw,
  Save
} from 'lucide-react';
import { ShineBorder } from '@/components/magicui/shine-border';
import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { cn } from '@/lib/utils';
import { callGeminiAPI, extractJsonFromText, isGeminiConfigured, listAvailableModels } from '@/lib/gemini-api';
import { useAuth } from '@/lib/auth-context';
import { saveDiagnosisReport } from '@/lib/medical-history-service';
import { trackUserActivity, Feature, Action } from '@/lib/user-activity-service';

interface SymptomOption {
  id: string;
  name: string;
  description?: string;
}

interface BodyArea {
  id: string;
  name: string;
  icon?: React.ReactNode;
  symptoms: SymptomOption[];
}

interface Medication {
  name: string;
  dosage: string;
  notes: string;
  interactions?: string[];
  sideEffects?: string[];
}

interface DiagnosisResult {
  condition: string;
  probability: number;
  confidenceScore?: number;
  description: string;
  additionalInfo?: string;
  possibleCauses?: string[];
  precautions: string[];
  medications: Medication[];
  whenToSeekHelp?: string[];
  relatedConditions?: string[];
  estimatedRecoveryTime?: string;
  source?: string;
}

interface GeminiResponse {
  results: DiagnosisResult[];
  summary: string;
  disclaimers: string[];
}

interface MedicalHistory {
  id: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  saved: boolean;
}

// Add this context definition before the AiDiagnosis component
interface AiDiagnosisContextType {
  isFetchingHistory: boolean;
  historyError: string | null;
  fetchUserMedicalHistory: () => void;
}

const AiDiagnosisContext = createContext<AiDiagnosisContextType | undefined>(undefined);

const AiDiagnosis: React.FC = () => {
  // Main wizard state
  const [step, setStep] = useState<number>(1);
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSymptoms, setFilteredSymptoms] = useState<SymptomOption[]>([]);
  
  // Symptom details
  const [duration, setDuration] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [medicalHistory, setMedicalHistory] = useState<string>('');
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string>('');
  const [existingConditions, setExistingConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  
  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true);
  const [activeResultTab, setActiveResultTab] = useState<string>('overview');
  const [showGeminiDetails, setShowGeminiDetails] = useState<boolean>(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // Results
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [geminiResponse, setGeminiResponse] = useState<GeminiResponse | null>(null);
  const [pastDiagnoses, setPastDiagnoses] = useState<MedicalHistory[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<MedicalHistory | null>(null);
  // Add an error state
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced sample data with more comprehensive symptom coverage
  const bodyAreas: BodyArea[] = [
    {
      id: 'head',
      name: 'Head & Neck',
      icon: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">H</div>,
      symptoms: [
        { id: 'headache', name: 'Headache', description: 'Pain in any region of the head' },
        { id: 'migraine', name: 'Migraine', description: 'Recurring headache, moderate to severe, often with nausea and sensitivity to light/sound' },
        { id: 'dizziness', name: 'Dizziness', description: 'Feeling faint, woozy, or unsteady' },
        { id: 'vertigo', name: 'Vertigo', description: 'Sensation of spinning or swaying' },
        { id: 'sore_throat', name: 'Sore Throat', description: 'Pain or irritation in the throat, worsened by swallowing' },
        { id: 'ear_pain', name: 'Ear Pain', description: 'Pain inside or around the ear' },
        { id: 'hearing_loss', name: 'Hearing Loss', description: 'Partial or total inability to hear' },
        { id: 'tinnitus', name: 'Tinnitus', description: 'Ringing or buzzing sound in one or both ears' },
        { id: 'blurred_vision', name: 'Blurred Vision', description: 'Lack of sharpness of vision resulting in the inability to see fine detail' },
        { id: 'eye_pain', name: 'Eye Pain', description: 'Discomfort in or around the eye' },
        { id: 'nasal_congestion', name: 'Nasal Congestion', description: 'Stuffy nose, blockage of nasal passages' }
      ]
    },
    {
      id: 'chest',
      name: 'Chest & Respiratory',
      icon: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white">C</div>,
      symptoms: [
        { id: 'chest_pain', name: 'Chest Pain', description: 'Discomfort or pain in the chest area' },
        { id: 'shortness_of_breath', name: 'Shortness of Breath', description: 'Difficulty breathing or catching your breath' },
        { id: 'rapid_breathing', name: 'Rapid Breathing', description: 'Breathing faster than normal' },
        { id: 'wheezing', name: 'Wheezing', description: 'High-pitched whistling sound while breathing' },
        { id: 'cough', name: 'Cough', description: 'Sudden expulsion of air from the lungs' },
        { id: 'dry_cough', name: 'Dry Cough', description: 'Cough that doesn\'t produce phlegm' },
        { id: 'wet_cough', name: 'Wet/Productive Cough', description: 'Cough that produces phlegm or mucus' },
        { id: 'coughing_blood', name: 'Coughing Blood', description: 'Presence of blood in cough or phlegm' },
        { id: 'palpitations', name: 'Heart Palpitations', description: 'Feeling of having a racing, fluttering, or pounding heart' },
        { id: 'irregular_heartbeat', name: 'Irregular Heartbeat', description: 'Heart rhythm that is abnormal' }
      ]
    },
    {
      id: 'abdomen',
      name: 'Abdomen & Digestive',
      icon: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">A</div>,
      symptoms: [
        { id: 'nausea', name: 'Nausea', description: 'Feeling of sickness with an inclination to vomit' },
        { id: 'vomiting', name: 'Vomiting', description: 'Forceful expulsion of stomach contents through the mouth' },
        { id: 'abdominal_pain', name: 'Abdominal Pain', description: 'Pain felt anywhere between chest and groin' },
        { id: 'stomach_cramps', name: 'Stomach Cramps', description: 'Painful contractions or tightening of abdominal muscles' },
        { id: 'bloating', name: 'Bloating', description: 'Swollen or distended feeling in the abdomen' },
        { id: 'diarrhea', name: 'Diarrhea', description: 'Loose, watery bowel movements' },
        { id: 'constipation', name: 'Constipation', description: 'Difficulty passing stools or infrequent bowel movements' },
        { id: 'blood_in_stool', name: 'Blood in Stool', description: 'Presence of blood in bowel movements' },
        { id: 'heartburn', name: 'Heartburn/Acid Reflux', description: 'Burning pain in chest that worsens when lying down' },
        { id: 'loss_of_appetite', name: 'Loss of Appetite', description: 'Reduced desire to eat' },
        { id: 'increased_appetite', name: 'Increased Appetite', description: 'Abnormally increased hunger' }
      ]
    },
    {
      id: 'musculoskeletal',
      name: 'Muscles & Joints',
      icon: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">M</div>,
      symptoms: [
        { id: 'joint_pain', name: 'Joint Pain', description: 'Discomfort, pain, or inflammation in any joint' },
        { id: 'muscle_ache', name: 'Muscle Ache', description: 'Pain or tenderness in muscles' },
        { id: 'back_pain', name: 'Back Pain', description: 'Pain in the back, anywhere from neck to tailbone' },
        { id: 'neck_pain', name: 'Neck Pain', description: 'Pain in the neck area' },
        { id: 'swelling', name: 'Swelling', description: 'Enlargement of a body part due to fluid buildup' },
        { id: 'stiffness', name: 'Stiffness', description: 'Difficulty moving a joint or muscle' },
        { id: 'weakness', name: 'Muscle Weakness', description: 'Reduced strength in one or more muscles' },
        { id: 'limping', name: 'Limping', description: 'Altered gait to avoid pain when walking' },
        { id: 'muscle_cramps', name: 'Muscle Cramps', description: 'Sudden, involuntary contraction of a muscle' },
        { id: 'joint_stiffness', name: 'Joint Stiffness', description: 'Difficult movement of a joint, especially after rest' }
      ]
    },
    {
      id: 'skin',
      name: 'Skin & Dermatological',
      icon: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white">S</div>,
      symptoms: [
        { id: 'rash', name: 'Rash', description: 'Area of irritated or swollen skin' },
        { id: 'hives', name: 'Hives', description: 'Itchy, raised welts on the skin' },
        { id: 'itching', name: 'Itching', description: 'Irritating sensation causing a desire to scratch' },
        { id: 'dry_skin', name: 'Dry Skin', description: 'Skin that feels rough, tight, or flaky' },
        { id: 'blisters', name: 'Blisters', description: 'Fluid-filled sacs on the skin' },
        { id: 'bruising', name: 'Bruising', description: 'Discoloration of the skin due to bleeding underneath' },
        { id: 'skin_discoloration', name: 'Skin Discoloration', description: 'Change in the natural color of the skin' },
        { id: 'excessive_sweating', name: 'Excessive Sweating', description: 'Abnormally increased perspiration' }
      ]
    },
    {
      id: 'neurological',
      name: 'Neurological',
      icon: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white">N</div>,
      symptoms: [
        { id: 'confusion', name: 'Confusion', description: 'Difficulty thinking clearly or quickly' },
        { id: 'memory_problems', name: 'Memory Problems', description: 'Difficulty remembering information' },
        { id: 'seizure', name: 'Seizure', description: 'Sudden, uncontrolled electrical disturbance in the brain' },
        { id: 'tingling', name: 'Tingling/Numbness', description: 'Reduced sensation or pins-and-needles feeling' },
        { id: 'tremor', name: 'Tremor', description: 'Involuntary shaking movement' },
        { id: 'loss_of_balance', name: 'Loss of Balance', description: 'Difficulty maintaining equilibrium' },
        { id: 'difficulty_speaking', name: 'Difficulty Speaking', description: 'Problems forming words or sentences' },
        { id: 'fainting', name: 'Fainting', description: 'Temporary loss of consciousness' }
      ]
    },
    {
      id: 'general',
      name: 'General Symptoms',
      icon: <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white">G</div>,
      symptoms: [
        { id: 'fatigue', name: 'Fatigue', description: 'Feeling of tiredness, lack of energy' },
        { id: 'fever', name: 'Fever', description: 'Elevated body temperature' },
        { id: 'chills', name: 'Chills', description: 'Feeling of cold with shivering' },
        { id: 'night_sweats', name: 'Night Sweats', description: 'Excessive sweating during sleep' },
        { id: 'weight_loss', name: 'Unexplained Weight Loss', description: 'Losing weight without trying' },
        { id: 'weight_gain', name: 'Unexplained Weight Gain', description: 'Gaining weight without increased intake' },
        { id: 'appetite_loss', name: 'Loss of Appetite', description: 'Reduced desire to eat' },
        { id: 'dehydration', name: 'Dehydration', description: 'Abnormal loss of body fluids' },
        { id: 'malaise', name: 'General Malaise', description: 'Overall feeling of discomfort or illness' },
        { id: 'insomnia', name: 'Insomnia', description: 'Difficulty falling or staying asleep' }
      ]
    }
  ];

  // Duration options
  const durationOptions = [
    '< 24 hours',
    '1-3 days',
    '4-7 days',
    '1-2 weeks',
    '2-4 weeks',
    '1-3 months',
    '> 3 months'
  ];

  // Get all symptoms regardless of body area
  const allSymptoms = bodyAreas.flatMap(area => area.symptoms);

  // Toggle body area selection
  const toggleBodyArea = (areaId: string) => {
    setSelectedBodyAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId) 
        : [...prev, areaId]
    );
  };

  // Toggle symptom selection
  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId) 
        : [...prev, symptomId]
    );
  };

  // Get symptoms based on selected body areas
  const availableSymptoms = bodyAreas
    .filter(area => selectedBodyAreas.includes(area.id))
    .flatMap(area => area.symptoms);

  // Filter symptoms based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSymptoms(availableSymptoms);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = availableSymptoms.filter(symptom => 
      symptom.name.toLowerCase().includes(query) || 
      (symptom.description && symptom.description.toLowerCase().includes(query))
    );
    
    setFilteredSymptoms(filtered);
  }, [searchQuery, selectedBodyAreas]);
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    const totalSteps = 5;
    return (step / totalSteps) * 100;
  };

  // Navigation functions
  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Check if user can proceed to next step
  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedBodyAreas.length > 0;
      case 2:
        return selectedSymptoms.length > 0;
      case 3:
        return duration !== '';
      case 4:
        return age !== null;
      default:
        return true;
    }
  };

  // Get the authenticated user
  const { user, isAuthenticated } = useAuth();
  
  // Add state for saving to Firebase
  const [isSavingToFirebase, setIsSavingToFirebase] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track when user visits the AI Diagnosis page
  useEffect(() => {
    if (isAuthenticated && user) {
      trackUserActivity(user.id, Feature.AI_DIAGNOSIS, Action.VIEW);
    }
  }, [isAuthenticated, user]);

  // Save diagnosis to history (both local state and Firebase if user is authenticated)
  const saveDiagnosis = async () => {
    if (diagnosisResults.length === 0) return;
    
    // Create local history record
    const newHistory: MedicalHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      symptoms: selectedSymptoms.map(id => 
        allSymptoms.find(s => s.id === id)?.name || id
      ),
      diagnosis: diagnosisResults[0].condition,
      saved: true
    };
    
    // Update local state
    setPastDiagnoses(prev => [newHistory, ...prev]);
    
    // If user is authenticated, save to Firebase
    if (isAuthenticated && user) {
      try {
        setIsSavingToFirebase(true);
        setSaveError(null);
        
        // Get symptom names for storage
        const symptomNames = selectedSymptoms.map(id => {
          const symptom = allSymptoms.find(s => s.id === id);
          return symptom ? symptom.name : id;
        });
        
        // Save to Firebase
        await saveDiagnosisReport(
          user.id,
          geminiResponse,  // The full diagnosis data
          symptomNames     // The symptoms
        );
        
        setSaveSuccess(true);
        console.log('Diagnosis saved to Firebase successfully');
        
        // Clear success message after a few seconds
        setTimeout(() => {
          setSaveSuccess(null);
        }, 3000);
      } catch (error) {
        console.error('Error saving diagnosis to Firebase:', error);
        setSaveError(error instanceof Error ? error.message : String(error));
        setSaveSuccess(false);
      } finally {
        setIsSavingToFirebase(false);
      }
    }
  };
  
  // Call Gemini API for diagnosis
  const getGeminiDiagnosis = async (): Promise<GeminiResponse> => {
    // No need to set isAnalyzing here as it's already set in the handleSubmit function
    
    try {
      // Format the symptoms for the API request
      const symptomNames = selectedSymptoms.map(id => {
        const symptom = allSymptoms.find(s => s.id === id);
        return symptom ? symptom.name : id;
      });
      
      // Prepare medical information
      const medicalInfo = {
        symptoms: symptomNames,
        duration: duration,
        intensity: intensity,
        age: age,
        gender: gender,
        medicalHistory: medicalHistory,
        existingConditions: existingConditions,
        currentMedications: medications,
        allergies: allergies,
        additionalNotes: additionalNotes
      };
      
      console.log("Sending request to Gemini API with data:", medicalInfo);
      
      // Construct the prompt for Gemini
      const prompt = `
        As a medical AI assistant, analyze the following patient symptoms and information, and provide a detailed health assessment.
        
        Patient Information:
        - Age: ${age || 'Not provided'}
        - Gender: ${gender || 'Not provided'}
        - Medical History: ${medicalHistory || 'None provided'}
        - Existing Conditions: ${existingConditions.length > 0 ? existingConditions.join(', ') : 'None'}
        - Current Medications: ${medications.length > 0 ? medications.join(', ') : 'None'}
        - Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
        
        Symptoms:
        - Primary Symptoms: ${symptomNames.join(', ')}
        - Duration: ${duration}
        - Intensity (1-10): ${intensity}
        - Additional Notes: ${additionalNotes || 'None'}
        
        Please provide a comprehensive analysis with the following:
        1. A list of potential conditions with probability indicators
        2. Detailed descriptions of each condition
        3. Possible causes for each condition
        4. Recommended precautions and self-care measures
        5. Suggested over-the-counter medications with dosage and notes
        6. When to seek professional medical help
        7. Estimated recovery time if applicable
        
        Format your response as a structured JSON object with the following structure:
        {
          "results": [
            {
              "condition": "Condition Name",
              "probability": 0.85, // a decimal between 0 and 1
              "confidenceScore": 0.82, // a decimal between 0 and 1
              "description": "Description of the condition",
              "additionalInfo": "More detailed information about the condition",
              "possibleCauses": ["Cause 1", "Cause 2", "Cause 3"],
              "precautions": ["Precaution 1", "Precaution 2", "Precaution 3"],
              "medications": [
                {
                  "name": "Medication name",
                  "dosage": "Dosage instructions",
                  "notes": "Additional notes",
                  "sideEffects": ["Side effect 1", "Side effect 2"]
                }
              ],
              "whenToSeekHelp": ["Warning sign 1", "Warning sign 2"],
              "relatedConditions": ["Related condition 1", "Related condition 2"],
              "estimatedRecoveryTime": "Estimated recovery time",
              "source": "Gemini Health Knowledge Base"
            }
          ],
          "summary": "A general summary of the assessment",
          "disclaimers": ["Disclaimer 1", "Disclaimer 2", "Disclaimer 3"]
        }
        
        Provide at least 2-3 potential conditions if appropriate, ordered by probability.
        Include standard medical disclaimers about the limitations of AI diagnosis.
        
        IMPORTANT: Create a completely unique assessment based on the SPECIFIC symptoms and information provided. 
        Each condition should be SPECIFICALLY relevant to the symptoms listed and should NOT be generic.
        The probabilities should accurately reflect the likelihood based on the specific symptom combination.
      `;
      
      // Call the Gemini API using our utility function
      const apiResponse = await callGeminiAPI(prompt);
      
      if (!apiResponse.success) {
        console.error("Gemini API error:", apiResponse.error);
        throw new Error(`Gemini API error: ${apiResponse.error}`);
      }
      
      console.log("Gemini API response:", apiResponse.data);
      
      // Extract JSON from the text response
      let parsedResponse: GeminiResponse;
      try {
        parsedResponse = extractJsonFromText(apiResponse.text);
        
        // Validate the response structure
        if (!parsedResponse.results || !Array.isArray(parsedResponse.results) || parsedResponse.results.length === 0) {
          throw new Error("Invalid response format: missing results array");
        }
        
        // Ensure we have all required fields in each result
        parsedResponse.results = parsedResponse.results.map(result => {
          // Ensure medications has the right format
          if (!result.medications || !Array.isArray(result.medications)) {
            result.medications = [];
          }
          
          // Fill in missing fields with empty values to prevent UI errors
          return {
            condition: result.condition || "Unknown condition",
            probability: typeof result.probability === 'number' ? result.probability : 0.5,
            confidenceScore: typeof result.confidenceScore === 'number' ? result.confidenceScore : 0.5,
            description: result.description || "No description available",
            additionalInfo: result.additionalInfo || "",
            possibleCauses: Array.isArray(result.possibleCauses) ? result.possibleCauses : [],
            precautions: Array.isArray(result.precautions) ? result.precautions : [],
            medications: result.medications.map(med => ({
              name: med.name || "Unknown medication",
              dosage: med.dosage || "As directed",
              notes: med.notes || "",
              sideEffects: Array.isArray(med.sideEffects) ? med.sideEffects : []
            })),
            whenToSeekHelp: Array.isArray(result.whenToSeekHelp) ? result.whenToSeekHelp : [],
            relatedConditions: Array.isArray(result.relatedConditions) ? result.relatedConditions : [],
            estimatedRecoveryTime: result.estimatedRecoveryTime || "",
            source: result.source || "Gemini Health Knowledge Base"
          };
        });
        
        // Ensure we have summary and disclaimers
        if (!parsedResponse.summary) {
          parsedResponse.summary = "Based on the symptoms provided, the AI analysis suggests several possible conditions. These are preliminary assessments and should be discussed with a healthcare provider for proper diagnosis and treatment.";
        }
        
        if (!parsedResponse.disclaimers || !Array.isArray(parsedResponse.disclaimers) || parsedResponse.disclaimers.length === 0) {
          parsedResponse.disclaimers = [
            "This AI assessment is for informational purposes only and does not constitute medical advice.",
            "Gemini AI provides health information based on symptoms, but cannot diagnose medical conditions.",
            "Always consult with a qualified healthcare professional for proper diagnosis and treatment options."
          ];
        }
        
        return parsedResponse;
      } catch (error) {
        console.error("Error parsing Gemini response as JSON:", error);
        // Try to extract any textual content to provide partial results
        const textResponse = apiResponse.text || "";
        
        // Return a formatted error response
        return createErrorDiagnosisResponse(`Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Return an error response
      return createErrorDiagnosisResponse(`API connection error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Generate color class based on probability
  const getProgressColorClass = (probability: number) => {
    if (probability >= 0.8) return 'bg-red-600';
    if (probability >= 0.6) return 'bg-orange-500';
    if (probability >= 0.4) return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  
  // Reset the diagnosis form
  const resetDiagnosis = () => {
    setStep(1);
    setSelectedBodyAreas([]);
    setSelectedSymptoms([]);
    setSearchQuery('');
    setDuration('');
    setIntensity(5);
    setAge(null);
    setGender('');
    setExistingConditions([]);
    setMedications([]);
    setAllergies([]);
    setAdditionalNotes('');
    setMedicalHistory('');
    setDiagnosisResults([]);
    setGeminiResponse(null);
    setActiveResultTab('overview');
    setError(null);
    setSaveSuccess(null);
    setSaveError(null);
  };

  // Mock diagnosis based on symptoms
  const generateMockDiagnosisResults = (): DiagnosisResult[] => {
    const results: DiagnosisResult[] = [];
    
    if (selectedSymptoms.includes('headache') && selectedSymptoms.includes('dizziness')) {
      results.push({
        condition: 'Migraine',
        probability: 0.82,
        confidenceScore: 0.85,
        description: 'A neurological condition that causes various symptoms, most notably a throbbing, pulsing headache on one side of your head.',
        additionalInfo: 'Migraines are often accompanied by nausea, vomiting, and extreme sensitivity to light and sound. They can last for hours to days, and the pain can be so severe that it interferes with daily activities.',
        possibleCauses: [
          'Genetic factors',
          'Hormonal changes',
          'Environmental triggers (certain foods, stress, sensory stimuli)',
          'Neurological factors'
        ],
        precautions: [
          'Rest in a quiet, dark room',
          'Apply cold packs to forehead',
          'Stay hydrated',
          'Avoid triggers like bright lights and loud sounds',
          'Practice stress management techniques'
        ],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400-600mg every 6-8 hours',
            notes: 'Take with food to reduce stomach irritation',
            sideEffects: ['Stomach pain', 'Heartburn', 'Dizziness']
          },
          {
            name: 'Acetaminophen',
            dosage: '500-1000mg every 4-6 hours',
            notes: 'Do not exceed 4000mg in 24 hours',
            sideEffects: ['Nausea', 'Rash', 'Liver damage with overdose']
          },
          {
            name: 'Sumatriptan',
            dosage: '50-100mg at onset of migraine',
            notes: 'Prescription medication; consult doctor',
            sideEffects: ['Tingling', 'Flushing', 'Dizziness']
          }
        ],
        whenToSeekHelp: [
          'If you experience the "worst headache of your life"',
          'If headache is accompanied by fever, stiff neck, confusion',
          'If headache starts suddenly and is explosive or violent',
          'If headache occurs after a head injury'
        ],
        relatedConditions: ['Tension headache', 'Cluster headache', 'Vestibular disorders'],
        estimatedRecoveryTime: '4-72 hours for individual episodes',
        source: 'Gemini Health Knowledge Base'
      });
    }
    
    if (selectedSymptoms.includes('sore_throat') && selectedSymptoms.includes('fever')) {
      results.push({
        condition: 'Streptococcal Pharyngitis (Strep Throat)',
        probability: 0.75,
        confidenceScore: 0.78,
        description: 'A bacterial infection causing inflammation and pain in the throat.',
        additionalInfo: 'Strep throat is caused by group A Streptococcus bacteria. Unlike viral sore throats, strep throat requires antibiotic treatment to prevent complications.',
        possibleCauses: [
          'Group A Streptococcus bacterial infection',
          'Close contact with infected individuals',
          'Breathing in respiratory droplets containing bacteria'
        ],
        precautions: [
          'Complete the full course of prescribed antibiotics',
          'Rest and get plenty of sleep',
          'Stay hydrated with warm fluids',
          'Gargle with salt water for sore throat relief',
          'Use throat lozenges for pain relief'
        ],
        medications: [
          {
            name: 'Penicillin or Amoxicillin',
            dosage: 'As prescribed by doctor',
            notes: 'Prescription required; complete full course',
            sideEffects: ['Diarrhea', 'Rash', 'Nausea']
          },
          {
            name: 'Acetaminophen',
            dosage: '500-1000mg every 4-6 hours',
            notes: 'For fever and pain relief',
            sideEffects: ['Nausea', 'Liver damage with overdose']
          },
          {
            name: 'Throat lozenges',
            dosage: 'As needed for throat pain',
            notes: 'Sugar-free options available for diabetics',
            sideEffects: ['Mild stomach upset']
          }
        ],
        whenToSeekHelp: [
          'Difficulty breathing or swallowing',
          'Fever above 101°F (38°C) that lasts more than 48 hours',
          'Rash appears during or after a sore throat',
          'Symptoms not improving after 48 hours of antibiotics'
        ],
        relatedConditions: ['Viral pharyngitis', 'Tonsillitis', 'Mononucleosis'],
        estimatedRecoveryTime: '7-10 days with antibiotics; 24-48 hours for symptom improvement',
        source: 'Gemini Health Knowledge Base'
      });
    }
    
    // Add more mock results based on symptoms...
    
    // If no specific conditions match, provide a generic response
    if (results.length === 0) {
      results.push({
        condition: 'Non-specific symptoms',
        probability: 0.45,
        confidenceScore: 0.40,
        description: 'Your symptoms could indicate various conditions. We recommend monitoring them and consulting a healthcare professional if they persist or worsen.',
        precautions: [
          'Get adequate rest',
          'Stay hydrated',
          'Monitor symptoms for changes',
          'Seek medical attention if symptoms worsen'
        ],
        medications: [
          {
            name: 'Based on symptoms',
            dosage: 'As appropriate for specific symptoms',
            notes: 'Follow package instructions carefully'
          }
        ],
        whenToSeekHelp: [
          'Symptoms worsen or persist beyond 7 days',
          'New symptoms develop',
          'You have underlying health conditions that may be affected'
        ]
      });
    }
    
    return results;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsAnalyzing(true);
    
    try {
      // Check if Gemini API is configured
      if (!isGeminiConfigured()) {
        throw new Error("Gemini API key is not configured. Please add it to your environment variables.");
      }
      
      // Get advanced analysis from Gemini API
      const geminiResponse = await getGeminiDiagnosis();
      setGeminiResponse(geminiResponse);
      setDiagnosisResults(geminiResponse.results);
      
      // Create a local history record
      const newHistory: MedicalHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        symptoms: selectedSymptoms.map(id => 
          allSymptoms.find(s => s.id === id)?.name || id
        ),
        diagnosis: geminiResponse.results[0]?.condition || "Unknown condition",
        saved: true
      };
      
      // Update local state
      setPastDiagnoses(prev => [newHistory, ...prev]);
      
      // Automatically save to Firebase if user is authenticated
      if (isAuthenticated && user) {
        try {
          // Get symptom names for storage
          const symptomNames = selectedSymptoms.map(id => {
            const symptom = allSymptoms.find(s => s.id === id);
            return symptom ? symptom.name : id;
          });
          
          // Set saving indicator
          setIsSavingToFirebase(true);
          setSaveError(null);
          
          // Save to Firebase
          await saveDiagnosisReport(
            user.id,
            geminiResponse,
            symptomNames
          );
          
          setSaveSuccess(true);
            console.log('Diagnosis automatically saved to user profile');
          
          // Clear success message after a few seconds
          setTimeout(() => {
            setSaveSuccess(null);
          }, 3000);
          
          // Refresh the medical history to include the new entry
          fetchUserMedicalHistory();
          
        } catch (error) {
          console.error('Error saving diagnosis to Firebase:', error);
          setSaveError(error instanceof Error ? error.message : String(error));
          setSaveSuccess(false);
        } finally {
          setIsSavingToFirebase(false);
        }
      }
    } catch (error) {
      console.error("Error during diagnosis:", error);
      // Show error message to the user
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Component for symptom search functionality
  const SymptomSearch = () => {
    return (
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for symptoms..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
        {searchQuery && filteredSymptoms.length === 0 && (
          <div className="mt-2 text-gray-400 text-sm">
            No symptoms found matching "{searchQuery}". Try another search term or browse by body area.
          </div>
        )}
      </div>
    );
  };

  // Render content for each step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 1: Select Body Areas</h2>
            <p className="text-gray-400">Where are you experiencing symptoms? Select all that apply.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bodyAreas.map(area => (
                <button
                  key={area.id}
                  onClick={() => toggleBodyArea(area.id)}
                  className={`p-4 rounded-lg border transition-colors text-left ${
                    selectedBodyAreas.includes(area.id)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center">
                    {area.icon ? (
                      <div className="mr-3">{area.icon}</div>
                    ) : (
                      selectedBodyAreas.includes(area.id) ? (
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-gray-400 mr-2" />
                      )
                    )}
                    <div>
                      <span className="font-medium">{area.name}</span>
                      <span className="text-xs text-gray-400 block mt-1">
                        {area.symptoms.length} symptoms
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-blue-200 text-sm">
                  Select all areas where you're experiencing symptoms. This helps us narrow down possible conditions.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <span>Step 2: Select Symptoms</span>
              <span className="ml-3 text-sm bg-blue-500/20 text-blue-300 py-1 px-2 rounded-full">
                {selectedSymptoms.length} selected
              </span>
            </h2>
            <p className="text-gray-400">What symptoms are you experiencing? Select all that apply.</p>
            
            <SymptomSearch />
            
            {availableSymptoms.length > 0 ? (
              <>
                {searchQuery && filteredSymptoms.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSymptoms.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-4 rounded-lg border transition-colors text-left ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 hover:border-blue-400'
                    }`}
                  >
                          <div className="flex items-start">
                      {selectedSymptoms.includes(symptom.id) ? (
                              <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                            ) : (
                              <PlusCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            )}
                            <div>
                              <span className="font-medium">{symptom.name}</span>
                              {symptom.description && (
                                <p className="text-xs text-gray-400 mt-1">{symptom.description}</p>
                              )}
                            </div>
                    </div>
                  </button>
                ))}
              </div>
                  </div>
                ) : !searchQuery && (
                  <div className="space-y-6">
                    {bodyAreas
                      .filter(area => selectedBodyAreas.includes(area.id))
                      .map(area => (
                        <div key={area.id} className="mb-6">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            {area.icon ? <div className="mr-2">{area.icon}</div> : null}
                            {area.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {area.symptoms.map(symptom => (
                              <button
                                key={symptom.id}
                                onClick={() => toggleSymptom(symptom.id)}
                                className={`p-4 rounded-lg border transition-colors text-left ${
                                  selectedSymptoms.includes(symptom.id)
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-gray-700 hover:border-blue-400'
                                }`}
                              >
                                <div className="flex items-start">
                                  {selectedSymptoms.includes(symptom.id) ? (
                                    <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                  ) : (
                                    <PlusCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                  )}
                                  <div>
                                    <span className="font-medium">{symptom.name}</span>
                                    {symptom.description && (
                                      <p className="text-xs text-gray-400 mt-1">{symptom.description}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                
                {selectedSymptoms.length > 0 && (
                  <div className="mt-8 bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3">Selected Symptoms ({selectedSymptoms.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map(id => {
                        const symptom = allSymptoms.find(s => s.id === id);
                        return (
                          <div 
                            key={id} 
                            className="bg-blue-500/20 text-blue-300 py-1 px-3 rounded-full flex items-center"
                          >
                            <span>{symptom?.name || id}</span>
                            <button 
                              onClick={() => toggleSymptom(id)}
                              className="ml-2 text-blue-300 hover:text-blue-100"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No body areas selected</p>
                <p className="text-gray-400 mt-2">
                  Please go back and select at least one body area.
                </p>
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 3: Symptom Details</h2>
            <p className="text-gray-400">Provide more information about your symptoms.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">How long have you been experiencing these symptoms?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {durationOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDuration(option)}
                      className={`p-3 rounded-md transition-colors flex items-center justify-center ${
                        duration === option
                          ? 'bg-blue-600 text-white border-2 border-blue-400'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                      }`}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-3 font-medium">
                  Rate the intensity of your symptoms (1 = very mild, 10 = severe)
                </label>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-4 mb-2">
                  <span className="text-gray-400">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-400">10</span>
                    <span className={`text-white py-1 px-3 rounded-md ml-2 w-10 text-center
                      ${intensity >= 8 ? 'bg-red-500' : 
                        intensity >= 5 ? 'bg-orange-500' : 
                        intensity >= 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    >
                    {intensity}
                  </span>
                </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Are your symptoms constant or do they come and go?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdditionalNotes(prev => prev + " Symptoms are constant and persistent.")}
                    className="p-3 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                  >
                    Constant
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdditionalNotes(prev => prev + " Symptoms come and go intermittently.")}
                    className="p-3 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                  >
                    Intermittent
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <label className="block text-gray-300 mb-2 font-medium">
                  What makes your symptoms better or worse? (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="For example: 'Pain worsens when standing but improves with rest,' or 'Headache gets worse in bright light'"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-y"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 4: Personal Information</h2>
            <p className="text-gray-400">
              This information helps provide more accurate assessments. All data is kept private and secure.
            </p>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-blue-200 text-sm">
                  Age, gender, and medical history are important factors in medical assessment. 
                  This information helps the AI provide more accurate and relevant results.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-gray-300 mb-2 font-medium">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={age || ''}
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                    placeholder="Enter your age"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Any existing medical conditions?</label>
                <textarea
                  value={existingConditions.join(", ")}
                  onChange={(e) => setExistingConditions(e.target.value.split(",").map(item => item.trim()))}
                  placeholder="E.g., Diabetes, Hypertension, Asthma (comma separated)"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-y"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Current medications</label>
                <textarea
                  value={medications.join(", ")}
                  onChange={(e) => setMedications(e.target.value.split(",").map(item => item.trim()))}
                  placeholder="E.g., Lisinopril, Metformin, Albuterol (comma separated)"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-y"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Any allergies?</label>
                <textarea
                  value={allergies.join(", ")}
                  onChange={(e) => setAllergies(e.target.value.split(",").map(item => item.trim()))}
                  placeholder="E.g., Penicillin, Peanuts, Latex (comma separated)"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-y"
                  rows={2}
                />
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 5: Additional Information</h2>
            <p className="text-gray-400">
              Any other details you'd like to share with our AI? This information helps provide a more accurate assessment.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Relevant medical history</label>
                <textarea
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="E.g., past surgeries, family history of certain conditions, recent changes in health"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-y"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Additional notes</label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any other details that might be relevant to your symptoms"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-y"
                  rows={4}
                />
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-start">
                  <Sparkles className="h-6 w-6 text-blue-400 mt-0.5 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-300 mb-2">Gemini AI Analysis</h3>
                    <p className="text-blue-200 text-sm mb-3">
                      Your information will be processed by our advanced Gemini AI to provide a comprehensive health assessment including:
                    </p>
                    <ul className="space-y-2 text-sm text-blue-200">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Possible conditions based on your symptoms</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Probability indicators for each condition</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Recommended precautions and self-care measures</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Suggested over-the-counter medications when appropriate</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Guidance on when to seek professional medical care</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render diagnosis results
  const renderResults = () => {
    if (!geminiResponse || diagnosisResults.length === 0) return null;
    
    return (
      <div className="space-y-8">
        <div className="relative">
          <InteractiveGridPattern
            className={cn(
              "absolute inset-0 w-full h-full z-0 opacity-30",
              "[mask-image:radial-gradient(ellipse_at_center,white_50%,transparent_90%)]",
            )}
            count={30}
            pointColor="rgb(59, 130, 246)"
            lineColor="rgba(59, 130, 246, 0.15)"
            pointSize={1}
            pointDuration={2000}
            cursorEffect={100}
          />

          <div className="relative z-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">AI Health Assessment</h2>
                <p className="text-blue-200 mt-2 max-w-3xl">
                  {geminiResponse.summary}
                </p>
              </div>
          <button
            onClick={resetDiagnosis}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
          >
                <PenLine className="h-4 w-4 mr-2" />
            New Assessment
          </button>
        </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center">
                <Brain className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Gemini AI Analysis</h3>
                  <p className="text-sm text-gray-400">Powered by advanced medical knowledge</p>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center">
                <BarChart className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Confidence-Rated Results</h3>
                  <p className="text-sm text-gray-400">Probability indicators for each condition</p>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 flex items-center">
                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Detailed Information</h3>
                  <p className="text-sm text-gray-400">Comprehensive health insights</p>
                </div>
              </div>
            </div>
            
            {/* AI Details toggle */}
            <div className="mt-6 flex items-center space-x-4">
              <button 
                className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
                onClick={() => setShowGeminiDetails(!showGeminiDetails)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {showGeminiDetails ? 'Hide AI Details' : 'Show AI Details'}
              </button>
              
              {/* Auto-save status indicators */}
              {isSavingToFirebase && (
                <div className="flex items-center text-gray-400 text-xs">
                  <div className="animate-spin h-3 w-3 mr-1 border-t-2 border-blue-500 border-solid rounded-full"></div>
                  Saving to profile...
                </div>
              )}
              {saveSuccess === true && (
                <span className="text-green-400 text-xs">Saved to profile!</span>
              )}
              {saveSuccess === false && (
                <span className="text-red-400 text-xs">Save failed</span>
              )}
              {saveError && (
                <span className="text-red-400 text-xs" title={saveError}>Error saving</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Gemini API Details */}
        {showGeminiDetails && (
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-900/30 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
              Gemini AI Processing Details
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <strong>Input:</strong> {selectedSymptoms.length} symptoms analyzed with {
                  Object.entries({
                    "Age": age,
                    "Gender": gender,
                    "Duration": duration,
                    "Intensity": intensity,
                    "Medical History": medicalHistory || "None provided",
                    "Existing Conditions": existingConditions.length || "None provided",
                    "Current Medications": medications.length || "None provided",
                    "Allergies": allergies.length || "None provided"
                  }).filter(([_, value]) => value).length
                } additional data points
              </p>
              <p>
                <strong>Processing:</strong> Gemini analyzed your symptoms against a comprehensive medical knowledge base, considering factors like symptom combinations, duration, intensity, age, and medical history.
              </p>
              <p>
                <strong>Analysis Quality:</strong> {diagnosisResults[0]?.confidenceScore ? `${Math.round(diagnosisResults[0].confidenceScore * 100)}% confidence in primary assessment` : 'Confidence level varies by condition'}
              </p>
              <p>
                <strong>Conditions Evaluated:</strong> Multiple potential conditions were analyzed, with {diagnosisResults.length} most relevant results presented
              </p>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
            <p className="text-yellow-200 text-sm">
                <strong>Important Medical Disclaimer:</strong> This AI assessment provides preliminary insights only and 
              is not a substitute for professional medical diagnosis. Please consult with a qualified 
              healthcare provider for proper diagnosis and treatment.
            </p>
              {geminiResponse.disclaimers && geminiResponse.disclaimers.length > 0 && (
                <ul className="mt-2 text-xs text-yellow-200/80 space-y-1">
                  {geminiResponse.disclaimers.map((disclaimer, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{disclaimer}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs for each condition */}
        <div className="space-y-6">
          {diagnosisResults.map((result, index) => (
            <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
              <ShineBorder 
                shineColor={["#3B82F6", "#8B5CF6"]} 
                borderWidth={1}
                size={500}
                interval={4000}
                duration={1500}
                borderRadius={12}
                className="z-10"
              />
              
              <div className="border-b border-gray-800 p-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{result.condition}</h3>
                  <div className="flex items-center bg-gray-800 rounded-full p-1 pr-3">
                    <span className="text-sm mr-2">Probability:</span>
                    <div className="bg-gray-700 rounded-full h-6 w-28 overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColorClass(result.probability)}`}
                        style={{ width: `${result.probability * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium">{Math.round(result.probability * 100)}%</span>
                  </div>
                </div>
                <p className="text-gray-400 mt-3">{result.description}</p>
                
                {result.additionalInfo && (
                  <div className="mt-3 text-sm text-gray-400">
                    {result.additionalInfo}
                  </div>
                )}
              </div>
              
              {/* Tabs Navigation */}
              <div className="border-b border-gray-800">
                <nav className="flex overflow-x-auto p-1 bg-gray-900">
                  <button
                    onClick={() => setActiveResultTab('overview')}
                    className={`px-4 py-3 text-sm font-medium rounded-t-lg ${
                      activeResultTab === 'overview'
                        ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveResultTab('precautions')}
                    className={`px-4 py-3 text-sm font-medium rounded-t-lg ${
                      activeResultTab === 'precautions'
                        ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    Precautions
                  </button>
                  <button
                    onClick={() => setActiveResultTab('medications')}
                    className={`px-4 py-3 text-sm font-medium rounded-t-lg ${
                      activeResultTab === 'medications'
                        ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    Medications
                  </button>
                  {result.whenToSeekHelp && result.whenToSeekHelp.length > 0 && (
                    <button
                      onClick={() => setActiveResultTab('whenToSeekHelp')}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg ${
                        activeResultTab === 'whenToSeekHelp'
                          ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      When to Seek Help
                    </button>
                  )}
                  {result.possibleCauses && result.possibleCauses.length > 0 && (
                    <button
                      onClick={() => setActiveResultTab('causes')}
                      className={`px-4 py-3 text-sm font-medium rounded-t-lg ${
                        activeResultTab === 'causes'
                          ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      Possible Causes
                    </button>
                  )}
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="p-5">
                {activeResultTab === 'overview' && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium mb-3">About this Condition</h4>
                        <p className="text-gray-400">{result.description}</p>
                        {result.additionalInfo && (
                          <p className="text-gray-400 mt-2">{result.additionalInfo}</p>
                        )}
                      </div>
                      
                      <div>
                        {result.estimatedRecoveryTime && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-1">Estimated Recovery Time</h4>
                            <div className="bg-gray-800/60 rounded-md p-3 flex items-center">
                              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                              <span>{result.estimatedRecoveryTime}</span>
                            </div>
                          </div>
                        )}
                        
                        {result.relatedConditions && result.relatedConditions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-1">Related Conditions</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.relatedConditions.map((condition, i) => (
                                <div key={i} className="bg-gray-800/60 rounded-full py-1 px-3 text-sm">
                                  {condition}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {result.possibleCauses && result.possibleCauses.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-3">Common Causes</h4>
                        <ul className="space-y-2">
                          {result.possibleCauses.slice(0, 3).map((cause, i) => (
                            <li key={i} className="flex items-start">
                              <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white mr-3 mt-0.5">
                                {i + 1}
                              </div>
                              <span className="text-gray-300">{cause}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {activeResultTab === 'precautions' && (
                  <div>
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  Suggested Precautions
                </h4>
                    <ul className="space-y-3">
                  {result.precautions.map((precaution, i) => (
                        <li key={i} className="flex items-start bg-gray-800/50 rounded-md p-3">
                          <div className="h-5 w-5 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-white mr-3 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-gray-300">{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
                )}
              
                {activeResultTab === 'medications' && (
                  <div>
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <Pill className="h-5 w-5 text-blue-500 mr-2" />
                  Recommended OTC Medications
                </h4>
                <div className="space-y-4">
                  {result.medications.map((med, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-md p-4">
                          <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 mr-3">
                              <Pill className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-gray-400 text-sm mt-1">Dosage: {med.dosage}</div>
                      <div className="text-gray-400 text-sm mt-1">Note: {med.notes}</div>
                              
                              {med.sideEffects && med.sideEffects.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-xs text-yellow-400 mb-1">Possible Side Effects:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {med.sideEffects.map((effect, j) => (
                                      <span key={j} className="text-xs bg-gray-700 rounded-full py-1 px-2">
                                        {effect}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                    </div>
                  ))}
                </div>
                    <div className="bg-yellow-500/10 text-yellow-200 text-sm p-3 rounded-md mt-4">
                      <strong>Note:</strong> Always read and follow the label instructions. Consult with a pharmacist or healthcare provider before taking any new medication.
              </div>
            </div>
                )}
                
                {activeResultTab === 'whenToSeekHelp' && result.whenToSeekHelp && result.whenToSeekHelp.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      When to Seek Medical Help
                    </h4>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                      <p className="text-red-200 text-sm">
                        Seek immediate medical attention if you experience any of the following symptoms:
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {result.whenToSeekHelp.map((item, i) => (
                        <li key={i} className="flex items-start bg-gray-800/50 rounded-md p-3">
                          <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {activeResultTab === 'causes' && result.possibleCauses && result.possibleCauses.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium mb-3">Possible Causes</h4>
                    <ul className="space-y-3">
                      {result.possibleCauses.map((cause, i) => (
                        <li key={i} className="flex items-start bg-gray-800/50 rounded-md p-3">
                          <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white mr-3 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-gray-300">{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700 pt-6 mt-8">
          <p className="text-gray-400 text-sm">
            Assessment based on reported symptoms. If your symptoms persist, worsen, or if you experience 
            emergency warning signs (such as difficulty breathing, persistent chest pain, confusion, or 
            bluish lips/face), seek immediate medical attention.
          </p>
          
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={resetDiagnosis}
              className="text-blue-400 hover:text-blue-300 flex items-center"
            >
              <PenLine className="h-4 w-4 mr-1" />
              New Assessment
            </button>
            
            <button
              onClick={downloadDiagnosisReport}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Check API configuration on component mount
  useEffect(() => {
    if (!isGeminiConfigured()) {
      setError("Gemini API key is not configured. Please add it to your .env.local file to enable AI diagnosis.");
    } else {
      setError(null);
    }
  }, []);

  // Display an API key configuration message if needed
  const ApiKeyNotice = () => {
    if (!error || !error.includes("Gemini API key")) return null;
    
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <KeyRound className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-300">API Key Required</h3>
            <p className="mt-2 text-red-200">
              {error}
            </p>
            <div className="mt-4">
              <p className="text-red-200 text-sm">
                To configure your API key:
              </p>
              <ol className="list-decimal text-red-200 text-sm ml-5 mt-2 space-y-1">
                <li>Create a .env.local file in the project root</li>
                <li>Add the line: VITE_GEMINI_API_KEY=your_api_key_here</li>
                <li>Restart the development server</li>
              </ol>
              <p className="text-red-200 text-sm mt-2">
                You can get an API key from the <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Display API error troubleshooting tools if needed
  const ApiErrorNotice = () => {
    if (!error || error.includes("Gemini API key")) return null;

  return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-300">API Error Detected</h3>
            <p className="mt-2 text-red-200">
              {error}
            </p>
            <div className="mt-4">
              <p className="text-red-200 text-sm">
                Possible solutions:
              </p>
              <ul className="list-disc text-red-200 text-sm ml-5 mt-2 space-y-1">
                <li>Check your internet connection</li>
                <li>Verify your API key is correct</li>
                <li>Try again in a few minutes</li>
              </ul>
            </div>
          </div>
        </div>
        
        <ModelTroubleshooter />
      </div>
    );
  };

  // Create a placeholder error response when API calls fail
  const createErrorDiagnosisResponse = (errorMessage: string): GeminiResponse => {
    // Extract specific error codes if they exist
    const errorCode = errorMessage.includes('404') ? '404' : 
                     errorMessage.includes('403') ? '403' :
                     errorMessage.includes('401') ? '401' : null;
    
    // Create more specific error information based on error codes
    let errorDetails = 'This is not a medical diagnosis. Please try again with different symptoms or consult a healthcare professional.';
    let possibleCauses = ["API error", "Connection issue", "Invalid response format"];
    let troubleshootingSteps = [
      "Check your internet connection",
      "Try again in a few minutes",
      "Contact support if the issue persists"
    ];
    
    if (errorCode === '404') {
      errorDetails = 'API endpoint not found. This could be due to an incorrect API URL or recent changes to the Gemini API.';
      possibleCauses = ["Incorrect API URL", "API endpoint has changed", "API version is outdated"];
      troubleshootingSteps = [
        "Update to the latest version of the application",
        "Check if the Gemini API endpoints have changed recently",
        "Try using a different model version (e.g., gemini-1.5-pro instead of gemini-pro)"
      ];
    } else if (errorCode === '403' || errorCode === '401') {
      errorDetails = 'API authentication failed. This is likely due to an invalid or expired API key.';
      possibleCauses = ["Invalid API key", "API key has expired", "API key usage limits exceeded"];
      troubleshootingSteps = [
        "Verify your API key is correct and active",
        "Create a new API key if necessary",
        "Check if you've exceeded your API usage limits"
      ];
    }
    
    return {
      results: [{
        condition: "Error",
        probability: 0.5,
        confidenceScore: 0.5,
        description: `There was an error processing your request: ${errorMessage}`,
        additionalInfo: errorDetails,
        possibleCauses: possibleCauses,
        precautions: ["If you're experiencing severe symptoms, please consult a healthcare professional immediately"],
        medications: [{
          name: "N/A",
          dosage: "N/A",
          notes: "Please consult a healthcare professional"
        }],
        whenToSeekHelp: ["If symptoms are severe or concerning"],
        relatedConditions: [],
        estimatedRecoveryTime: "",
        source: "Error Response"
      }],
      summary: "There was an error processing your symptoms. Please try again or consult a healthcare professional.",
      disclaimers: [
        "This is an error message, not a medical assessment.",
        "Always consult with a qualified healthcare professional for proper diagnosis and treatment options.",
        "If you're a developer, check the console for more detailed error information.",
        `Troubleshooting: ${troubleshootingSteps.join(' • ')}`
      ]
    };
  };

  // Add these variables to the component's state
  const [isCheckingModels, setIsCheckingModels] = useState<boolean>(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelCheckError, setModelCheckError] = useState<string | null>(null);

  // Add a new function to check available models
  const checkAvailableModels = async () => {
    setIsCheckingModels(true);
    setModelCheckError(null);
    
    try {
      const result = await listAvailableModels();
      if (result.success && result.modelNames) {
        setAvailableModels(result.modelNames);
      } else {
        setModelCheckError(result.error || "Failed to list models");
      }
    } catch (error) {
      setModelCheckError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsCheckingModels(false);
    }
  };

  // Add this component to display model information
  const ModelTroubleshooter = () => {
    if (!error) return null;
    
    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-medium flex items-center">
          <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
          Gemini API Troubleshooter
        </h3>
        
        <p className="text-gray-400 mt-2 mb-3">
          There appears to be an issue connecting to the Gemini API. Let's check which models are available:
        </p>
        
        {!isCheckingModels && !availableModels.length && !modelCheckError && (
          <button
            onClick={checkAvailableModels}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Available Models
          </button>
        )}
        
        {isCheckingModels && (
          <div className="flex items-center text-blue-300">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
            Checking available models...
          </div>
        )}
        
        {modelCheckError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            <p><strong>Error checking models:</strong> {modelCheckError}</p>
            <p className="mt-2">This may indicate an issue with your API key or network connection.</p>
          </div>
        )}
        
        {availableModels.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-3 mt-3">
            <h4 className="font-medium text-blue-300 mb-2">Available Models:</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              {availableModels.map((model, index) => (
                <li key={index} className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  {model}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-400 mt-3">
              Try updating the API settings to use one of these models.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Fetch user's medical history from Firestore
  const fetchUserMedicalHistory = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsFetchingHistory(true);
      const { getUserMedicalHistory } = await import('@/lib/medical-history-service');
      const history = await getUserMedicalHistory(user.id);
      
      console.log('Fetched medical history:', history.length, 'records');
      
      // Convert Firestore records to the local MedicalHistory format
      const convertedHistory: MedicalHistory[] = history.map(record => ({
        id: record.id || Date.now().toString(),
        date: typeof record.date === 'string' ? record.date : record.date.toISOString(),
        symptoms: record.symptoms || [],
        diagnosis: record.diagnosis || "Unknown condition",
        saved: true
      }));
      
      // Sort by date (newest first)
      convertedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Update local state with fetched history
      setPastDiagnoses(convertedHistory);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      setHistoryError('Failed to load medical history. Please try again later.');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // Load user medical history when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching medical history...');
      fetchUserMedicalHistory();
    } else {
      // Clear history when user logs out
      setPastDiagnoses([]);
    }
  }, [isAuthenticated, user]);

  // Add this new helper function to create and download a diagnosis report
  const downloadDiagnosisReport = () => {
    if (!geminiResponse || diagnosisResults.length === 0) return;
    
    // Format date for the filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `clara-diagnosis-report-${dateStr}.txt`;
    
    // Create text content for the report
    let reportContent = `CLARA HEALTH AI DIAGNOSIS REPORT\n`;
    reportContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    // Add summary
    reportContent += `SUMMARY\n${geminiResponse.summary}\n\n`;
    
    // Add patient information
    reportContent += `PATIENT INFORMATION\n`;
    reportContent += `Age: ${age || 'Not provided'}\n`;
    reportContent += `Gender: ${gender || 'Not provided'}\n`;
    reportContent += `Reported Symptoms: ${selectedSymptoms.map(id => 
      allSymptoms.find(s => s.id === id)?.name || id
    ).join(', ')}\n`;
    reportContent += `Symptom Duration: ${duration || 'Not provided'}\n`;
    reportContent += `Symptom Intensity: ${intensity}/10\n`;
    if (existingConditions.length > 0) reportContent += `Existing Conditions: ${existingConditions.join(', ')}\n`;
    if (medications.length > 0) reportContent += `Current Medications: ${medications.join(', ')}\n`;
    if (allergies.length > 0) reportContent += `Allergies: ${allergies.join(', ')}\n`;
    if (additionalNotes) reportContent += `Additional Notes: ${additionalNotes}\n`;
    reportContent += '\n';
    
    // Add diagnosis results
    reportContent += `DIAGNOSIS RESULTS\n`;
    diagnosisResults.forEach((result, index) => {
      reportContent += `\n[${index + 1}] ${result.condition}\n`;
      reportContent += `Probability: ${Math.round(result.probability * 100)}%\n`;
      reportContent += `Description: ${result.description}\n`;
      
      if (result.additionalInfo) {
        reportContent += `Additional Info: ${result.additionalInfo}\n`;
      }
      
      if (result.possibleCauses && result.possibleCauses.length > 0) {
        reportContent += `\nPossible Causes:\n`;
        result.possibleCauses.forEach((cause, i) => {
          reportContent += `  ${i + 1}. ${cause}\n`;
        });
      }
      
      if (result.precautions && result.precautions.length > 0) {
        reportContent += `\nRecommended Precautions:\n`;
        result.precautions.forEach((precaution, i) => {
          reportContent += `  ${i + 1}. ${precaution}\n`;
        });
      }
      
      if (result.medications && result.medications.length > 0) {
        reportContent += `\nRecommended Medications:\n`;
        result.medications.forEach((med, i) => {
          reportContent += `  ${i + 1}. ${med.name} - ${med.dosage}\n`;
          if (med.notes) reportContent += `     Notes: ${med.notes}\n`;
          if (med.sideEffects && med.sideEffects.length > 0) {
            reportContent += `     Possible Side Effects: ${med.sideEffects.join(', ')}\n`;
          }
        });
      }
      
      if (result.whenToSeekHelp && result.whenToSeekHelp.length > 0) {
        reportContent += `\nWhen to Seek Medical Help:\n`;
        result.whenToSeekHelp.forEach((item, i) => {
          reportContent += `  ${i + 1}. ${item}\n`;
        });
      }
    });
    
    // Add disclaimers
    reportContent += `\nDISCLAIMERS\n`;
    if (geminiResponse.disclaimers && geminiResponse.disclaimers.length > 0) {
      geminiResponse.disclaimers.forEach((disclaimer, i) => {
        reportContent += `${i + 1}. ${disclaimer}\n`;
      });
    } else {
      reportContent += `This AI assessment is for informational purposes only and does not constitute medical advice.\n`;
      reportContent += `Always consult with a qualified healthcare professional for proper diagnosis and treatment options.\n`;
    }
    
    // Create a blob and download it
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-black text-white min-h-screen relative">
      {/* Interactive Grid Pattern Background */}
      <InteractiveGridPattern
        className={cn(
          "fixed inset-0 w-full h-full z-0 opacity-30",
          "[mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_95%)]",
        )}
        count={50}
        pointColor="rgb(255, 255, 255)"
        lineColor="rgba(79, 122, 158, 0.2)"
        pointSize={1}
        pointDuration={3000}
        cursorEffect={100}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              AI Diagnosis
            </h1>
            
              <button 
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className={`${isAuthenticated ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'} text-white py-2 px-4 rounded-md flex items-center transition-colors`}
                title="View Medical History"
              disabled={!isAuthenticated}
              >
                <History className="h-4 w-4 mr-2" />
              {isAuthenticated ? 'Medical History' : 'Sign in to view history'}
              </button>
          </div>
          <p className="text-gray-400 max-w-3xl">
            Receive comprehensive health assessments with advanced Gemini AI analysis, probability indicators, 
            suggested precautions, and recommended treatments for your symptoms.
            {!isAuthenticated && (
              <span className="text-blue-400 ml-1">
                Sign in to save your diagnosis history automatically.
              </span>
            )}
          </p>
        </div>
        
        {/* API Key configuration notice */}
        <ApiKeyNotice />
        
        {/* API Error troubleshooting */}
        <ApiErrorNotice />
        
        {showDisclaimer && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-300">Important Health Disclaimer</h3>
                <p className="mt-2 text-blue-200">
                  This AI Diagnosis tool provides preliminary assessments based on reported symptoms. 
                  It is not intended to replace professional medical advice, diagnosis, or treatment. 
                  Always seek the advice of your physician or other qualified health provider with any 
                  questions you may have regarding a medical condition.
                </p>
                <div className="mt-4">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    onClick={() => setShowDisclaimer(false)}
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {diagnosisResults.length > 0 ? (
          renderResults()
        ) : (
          <>
            <div className="bg-gray-900 rounded-lg p-6 mb-8">
              <div className="relative mb-8">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-800">
                  <div 
                    style={{ width: `${getProgressPercentage()}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all"
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <div>Body Areas</div>
                  <div>Symptoms</div>
                  <div>Details</div>
                  <div>Additional Info</div>
                </div>
              </div>
              
              {renderStepContent()}
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                    step === 1
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isAnalyzing || !isGeminiConfigured()}
                  className={`py-2 px-6 rounded-md transition-colors flex items-center ${
                    !canProceed() || isAnalyzing || !isGeminiConfigured()
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Analyzing with Gemini AI...
                    </div>
                  ) : (
                    <>
                      {step === 5 ? 'Generate Assessment' : 'Next'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
              
              {/* Display any errors that occur during form submission */}
              {error && !error.includes("Gemini API key") && (
                <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-300">Error</h3>
                      <p className="mt-1 text-sm text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 flex items-center">
                <Activity className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Symptom Analysis</h3>
                  <p className="text-sm text-gray-400">Using advanced pattern recognition</p>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 flex items-center">
                <FilePlus className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Comprehensive Assessment</h3>
                  <p className="text-sm text-gray-400">With probability indicators</p>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 flex items-center">
                <Pill className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium">Treatment Suggestions</h3>
                  <p className="text-sm text-gray-400">Precautions & over-the-counter options</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Medical History Panel */}
      {showHistoryPanel && isAuthenticated && (
        <MedicalHistoryPanel 
          isVisible={showHistoryPanel}
          onClose={() => setShowHistoryPanel(false)}
          history={pastDiagnoses}
          onSelectRecord={(record) => {
            setSelectedDiagnosis(record);
            setShowHistoryPanel(false);
          }}
          isFetchingHistory={isFetchingHistory}
          historyError={historyError}
          onRefresh={fetchUserMedicalHistory}
          onCreateTestRecord={async () => {
            if (!user) return;
            try {
              setIsFetchingHistory(true);
              const { createTestMedicalHistoryRecord } = await import('@/lib/medical-history-service');
              await createTestMedicalHistoryRecord(user.id);
              // Refresh the history after creating the test record
              fetchUserMedicalHistory();
            } catch (error) {
              console.error('Error creating test record:', error);
              setHistoryError('Failed to create test record. See console for details.');
            } finally {
              setIsFetchingHistory(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default AiDiagnosis;

// Medical History Panel Component
const MedicalHistoryPanel: React.FC<{
  isVisible: boolean; 
  onClose: () => void;
  history: MedicalHistory[];
  onSelectRecord: (record: MedicalHistory) => void;
  isFetchingHistory: boolean;
  historyError: string | null;
  onRefresh: () => void;
  onCreateTestRecord: () => Promise<void>;
}> = ({ isVisible, onClose, history, onSelectRecord, isFetchingHistory, historyError, onRefresh, onCreateTestRecord }) => {
  if (!isVisible) return null;
  
  // Debug information for the panel
  const { user } = useAuth();
  
  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-gray-900 border-l border-gray-800 shadow-xl z-50 transition-all transform">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold flex items-center">
          <History className="h-5 w-5 text-blue-500 mr-2" />
          Medical History
        </h2>
        <div className="flex items-center">
          <button
            onClick={onRefresh}
            className="text-gray-400 hover:text-white p-1 mr-2"
            title="Refresh history"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1"
            title="Close"
        >
          ×
        </button>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
        {/* User info for debugging */}
        {user && (
          <div className="mb-4 text-xs text-gray-500 border-b border-gray-800 pb-2">
            User ID: {user.id} <br />
            Name: {user.name}
            <button 
              onClick={onCreateTestRecord}
              className="mt-2 text-xs text-blue-400 p-1 border border-blue-800 rounded block w-full"
            >
              Create Test Record
            </button>
          </div>
        )}
      
        {/* Loading state */}
        {isFetchingHistory && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading history...</span>
          </div>
        )}
        
        {/* Error state */}
        {historyError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-300 text-sm">{historyError}</p>
            <button 
              onClick={onRefresh}
              className="mt-2 text-blue-400 text-sm flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try again
            </button>
          </div>
        )}
        
        {/* Empty state */}
        {!isFetchingHistory && !historyError && history.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <FilePlus className="h-10 w-10 mx-auto mb-3 text-gray-500" />
            <p>No diagnosis history found.</p>
            <p className="text-sm mt-2">Complete a diagnosis to save it here.</p>
          </div>
        )}
        
        {/* History records */}
        {!isFetchingHistory && history.length > 0 && (
          <div className="space-y-3">
            {history.map((record) => (
              <div 
                key={record.id}
                className="bg-gray-800 hover:bg-gray-750 p-3 rounded-lg cursor-pointer transition-colors"
                onClick={() => onSelectRecord(record)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{record.diagnosis}</h3>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-blue-500/20 text-blue-300 text-xs rounded-full py-0.5 px-2">
                    {record.symptoms.length} symptoms
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {record.symptoms.slice(0, 3).map((symptom, i) => (
                    <span key={i} className="text-xs bg-gray-700 rounded-full py-0.5 px-2">
                      {symptom}
                    </span>
                  ))}
                  {record.symptoms.length > 3 && (
                    <span className="text-xs bg-gray-700 rounded-full py-0.5 px-2">
                      +{record.symptoms.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};