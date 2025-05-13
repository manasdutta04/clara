import React, { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, FilePlus, PenLine, Pill, PlusCircle, Stethoscope } from 'lucide-react';

interface SymptomOption {
  id: string;
  name: string;
}

interface BodyArea {
  id: string;
  name: string;
  symptoms: SymptomOption[];
}

interface DiagnosisResult {
  condition: string;
  probability: number;
  description: string;
  precautions: string[];
  medications: {
    name: string;
    dosage: string;
    notes: string;
  }[];
}

const AiDiagnosis: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true);

  // Sample data - in a real application, this would likely come from an API
  const bodyAreas: BodyArea[] = [
    {
      id: 'head',
      name: 'Head & Neck',
      symptoms: [
        { id: 'headache', name: 'Headache' },
        { id: 'dizziness', name: 'Dizziness' },
        { id: 'sore_throat', name: 'Sore Throat' },
        { id: 'blurred_vision', name: 'Blurred Vision' }
      ]
    },
    {
      id: 'chest',
      name: 'Chest & Lungs',
      symptoms: [
        { id: 'chest_pain', name: 'Chest Pain' },
        { id: 'shortness_of_breath', name: 'Shortness of Breath' },
        { id: 'cough', name: 'Cough' },
        { id: 'palpitations', name: 'Palpitations' }
      ]
    },
    {
      id: 'abdomen',
      name: 'Abdomen & Digestive',
      symptoms: [
        { id: 'nausea', name: 'Nausea' },
        { id: 'abdominal_pain', name: 'Abdominal Pain' },
        { id: 'diarrhea', name: 'Diarrhea' },
        { id: 'constipation', name: 'Constipation' }
      ]
    },
    {
      id: 'musculoskeletal',
      name: 'Muscles & Joints',
      symptoms: [
        { id: 'joint_pain', name: 'Joint Pain' },
        { id: 'muscle_ache', name: 'Muscle Ache' },
        { id: 'swelling', name: 'Swelling' },
        { id: 'stiffness', name: 'Stiffness' }
      ]
    },
    {
      id: 'general',
      name: 'General Symptoms',
      symptoms: [
        { id: 'fatigue', name: 'Fatigue' },
        { id: 'fever', name: 'Fever' },
        { id: 'chills', name: 'Chills' },
        { id: 'appetite_loss', name: 'Loss of Appetite' }
      ]
    }
  ];

  const durationOptions = [
    '< 24 hours',
    '1-3 days',
    '4-7 days',
    '1-2 weeks',
    '2-4 weeks',
    '1-3 months',
    '> 3 months'
  ];

  const toggleBodyArea = (areaId: string) => {
    setSelectedBodyAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId) 
        : [...prev, areaId]
    );
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId) 
        : [...prev, symptomId]
    );
  };

  const availableSymptoms = bodyAreas
    .filter(area => selectedBodyAreas.includes(area.id))
    .flatMap(area => area.symptoms);

  const getProgressPercentage = () => {
    const totalSteps = 4;
    return (step / totalSteps) * 100;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedBodyAreas.length > 0;
      case 2:
        return selectedSymptoms.length > 0;
      case 3:
        return duration !== '';
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    
    // In a real app, this would be an API call to your backend
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock diagnosis results based on selected symptoms
    const mockResults: DiagnosisResult[] = [];
    
    if (selectedSymptoms.includes('headache') && selectedSymptoms.includes('dizziness')) {
      mockResults.push({
        condition: 'Migraine',
        probability: 0.82,
        description: 'A neurological condition that causes various symptoms, most notably a throbbing, pulsing headache on one side of your head.',
        precautions: [
          'Rest in a quiet, dark room',
          'Apply cold packs to forehead',
          'Stay hydrated',
          'Avoid triggers like bright lights and loud sounds'
        ],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400-600mg every 6-8 hours',
            notes: 'Take with food to reduce stomach irritation'
          },
          {
            name: 'Acetaminophen',
            dosage: '500-1000mg every 4-6 hours',
            notes: 'Do not exceed 4000mg in 24 hours'
          }
        ]
      });
    }
    
    if (selectedSymptoms.includes('sore_throat') && selectedSymptoms.includes('fever')) {
      mockResults.push({
        condition: 'Common Cold / Upper Respiratory Infection',
        probability: 0.75,
        description: 'A viral infection affecting the upper respiratory tract, including the nose and throat.',
        precautions: [
          'Rest and get plenty of sleep',
          'Stay hydrated with warm fluids',
          'Use a humidifier to add moisture to the air',
          'Gargle with salt water for sore throat relief'
        ],
        medications: [
          {
            name: 'Throat lozenges',
            dosage: 'As needed for throat pain',
            notes: 'Sugar-free options available for diabetics'
          },
          {
            name: 'Saline nasal spray',
            dosage: '1-2 sprays per nostril as needed',
            notes: 'Helps relieve congestion and dryness'
          }
        ]
      });
    }
    
    if (selectedSymptoms.includes('nausea') && selectedSymptoms.includes('abdominal_pain')) {
      mockResults.push({
        condition: 'Gastroenteritis',
        probability: 0.68,
        description: 'An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.',
        precautions: [
          'Stay hydrated with small sips of clear fluids',
          'Avoid solid foods until nausea subsides',
          'Gradually reintroduce bland foods',
          'Avoid dairy, caffeine, and fatty foods'
        ],
        medications: [
          {
            name: 'Bismuth subsalicylate',
            dosage: '30ml every 30-60 minutes as needed',
            notes: 'Do not use if allergic to aspirin'
          },
          {
            name: 'Oral rehydration solution',
            dosage: 'Drink small amounts frequently',
            notes: 'Important to restore electrolytes'
          }
        ]
      });
    }
    
    if (selectedSymptoms.includes('fatigue') && selectedSymptoms.includes('joint_pain')) {
      mockResults.push({
        condition: 'Influenza (Flu)',
        probability: 0.58,
        description: 'A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs.',
        precautions: [
          'Rest as much as possible',
          'Stay hydrated',
          'Isolate to prevent spreading to others',
          'Monitor temperature regularly'
        ],
        medications: [
          {
            name: 'Acetaminophen',
            dosage: '500-1000mg every 4-6 hours',
            notes: 'For fever and body aches'
          },
          {
            name: 'Dextromethorphan',
            dosage: '10-20mg every 4 hours',
            notes: 'For cough suppression'
          }
        ]
      });
    }
    
    // If no specific conditions match, provide a generic response
    if (mockResults.length === 0) {
      mockResults.push({
        condition: 'Non-specific symptoms',
        probability: 0.45,
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
        ]
      });
    }
    
    setDiagnosisResults(mockResults);
    setIsAnalyzing(false);
  };

  const resetDiagnosis = () => {
    setStep(1);
    setSelectedBodyAreas([]);
    setSelectedSymptoms([]);
    setDuration('');
    setIntensity(5);
    setAdditionalNotes('');
    setDiagnosisResults([]);
  };

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
                    {selectedBodyAreas.includes(area.id) ? (
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <span>{area.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 2: Select Symptoms</h2>
            <p className="text-gray-400">What symptoms are you experiencing? Select all that apply.</p>
            
            {availableSymptoms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSymptoms.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-4 rounded-lg border transition-colors text-left ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center">
                      {selectedSymptoms.includes(symptom.id) ? (
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <PlusCircle className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span>{symptom.name}</span>
                    </div>
                  </button>
                ))}
              </div>
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
                <label className="block text-gray-300 mb-2">Duration</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {durationOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDuration(option)}
                      className={`py-2 px-4 rounded-md transition-colors ${
                        duration === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">
                  Intensity (1 = very mild, 10 = severe)
                </label>
                <div className="flex items-center space-x-4">
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
                  <span className="bg-blue-500/20 text-blue-400 py-1 px-3 rounded-md ml-2 w-10 text-center">
                    {intensity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 4: Additional Information</h2>
            <p className="text-gray-400">
              Any other details you'd like to share with our AI? (Optional)
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Notes</label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Enter any additional information here..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white resize-y"
                  rows={5}
                />
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <Stethoscope className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-blue-200 text-sm">
                    Your responses will be analyzed by our AI to generate preliminary health insights.
                    This is not a medical diagnosis and should not replace a consultation with a healthcare professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderResults = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">AI Assessment Results</h2>
          <button
            onClick={resetDiagnosis}
            className="text-blue-400 hover:text-blue-300 flex items-center"
          >
            <PenLine className="h-4 w-4 mr-1" />
            New Assessment
          </button>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-yellow-200 text-sm">
              <strong>Important:</strong> This AI assessment provides preliminary insights only and 
              is not a substitute for professional medical diagnosis. Please consult with a qualified 
              healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          {diagnosisResults.map((result, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="border-b border-gray-700 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{result.condition}</h3>
                  <div className="flex items-center">
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
                <p className="text-gray-400 mt-2">{result.description}</p>
              </div>
              
              <div className="p-4 border-b border-gray-700">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  Suggested Precautions
                </h4>
                <ul className="space-y-2">
                  {result.precautions.map((precaution, i) => (
                    <li key={i} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white mr-3 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-gray-300">{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <Pill className="h-5 w-5 text-blue-500 mr-2" />
                  Recommended OTC Medications
                </h4>
                <div className="space-y-4">
                  {result.medications.map((med, i) => (
                    <div key={i} className="bg-gray-700/50 rounded-md p-3">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-gray-400 text-sm mt-1">Dosage: {med.dosage}</div>
                      <div className="text-gray-400 text-sm mt-1">Note: {med.notes}</div>
                    </div>
                  ))}
                </div>
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
        </div>
      </div>
    );
  };

  const getProgressColorClass = (probability: number) => {
    if (probability >= 0.8) return 'bg-red-600';
    if (probability >= 0.6) return 'bg-orange-500';
    if (probability >= 0.4) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Diagnosis</h1>
          <p className="text-gray-400">
            Receive preliminary assessments with probability indicators, suggested precautions, and recommended OTC medicines.
          </p>
        </div>
        
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
                  className={`py-2 px-4 rounded-md transition-colors ${
                    step === 1
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  Back
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isAnalyzing}
                  className={`py-2 px-6 rounded-md transition-colors ${
                    !canProceed() || isAnalyzing
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    step === 4 ? 'Generate Assessment' : 'Next'
                  )}
                </button>
              </div>
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
    </div>
  );
};

export default AiDiagnosis;

// Utility function to get probability color (not exported)
function getProgressColorClass(probability: number) {
  if (probability >= 0.8) return 'bg-red-600';
  if (probability >= 0.6) return 'bg-orange-500';
  if (probability >= 0.4) return 'bg-yellow-500';
  return 'bg-blue-500';
}