import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { firestore } from './firebase';

// Types for medical history records
export interface MedicalHistoryRecord {
  id?: string;
  userId: string;
  date: Date | string;
  symptoms: string[];
  diagnosis: string;
  diagnosisResults: any; // The complete diagnosis result 
  probability?: number;
  condition?: string;
  description?: string;
  recommendations?: string[];
  notes?: string;
  createdAt?: any; // Firestore timestamp
}

// Collection names
const COLLECTIONS = {
  MEDICAL_HISTORY: 'medicalHistory',
};

/**
 * Saves a medical diagnosis report to Firestore
 */
export const saveDiagnosisReport = async (
  userId: string,
  diagnosisData: any,
  symptoms: string[],
): Promise<string> => {
  try {
    // Extract primary diagnostic information
    const primaryDiagnosis = diagnosisData.results && diagnosisData.results.length > 0 
      ? diagnosisData.results[0] 
      : { condition: 'Unknown', probability: 0, description: 'No diagnosis available' };
    
    // Create a Firestore record with the full diagnosis data
    const historyRecord: MedicalHistoryRecord = {
      userId,
      date: new Date(),
      symptoms,
      diagnosis: primaryDiagnosis.condition || 'Unknown',
      diagnosisResults: diagnosisData, // Store the full diagnosis data directly in Firestore
      probability: primaryDiagnosis.probability || 0,
      condition: primaryDiagnosis.condition || 'Unknown',
      description: primaryDiagnosis.description || '',
      recommendations: primaryDiagnosis.precautions || [],
      createdAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(firestore, COLLECTIONS.MEDICAL_HISTORY), historyRecord);
    console.log('Diagnosis saved to Firestore with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving diagnosis report:', error);
    throw new Error(`Failed to save diagnosis report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gets all medical history records for a user
 */
export const getUserMedicalHistory = async (userId: string): Promise<MedicalHistoryRecord[]> => {
  if (!userId) {
    console.error('Invalid userId provided to getUserMedicalHistory:', userId);
    throw new Error('User ID is required to fetch medical history');
  }

  console.log(`Attempting to fetch medical history for user: ${userId}`);
  console.log('Firestore instance available:', !!firestore);
  
  try {
    // Log the collection path being used
    const collectionPath = COLLECTIONS.MEDICAL_HISTORY;
    console.log(`Using collection path: ${collectionPath}`);
    
    // Create the query
    const medicalHistoryRef = collection(firestore, collectionPath);
    console.log('Collection reference created');
    
    try {
      // First attempt with both filter and ordering (requires index)
      console.log('Attempting query with ordering (requires index)...');
      const medicalHistoryQuery = query(
        medicalHistoryRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Query created with:', {
        collection: collectionPath,
        filter: `userId == ${userId}`,
        orderBy: 'createdAt desc'
      });
      
      // Execute the query
      console.log('Executing query...');
      const querySnapshot = await getDocs(medicalHistoryQuery);
      console.log(`Query executed, returned ${querySnapshot.size} documents`);
      
      return processQueryResults(querySnapshot);
    } catch (indexError) {
      // If index error occurs, try a simpler query without ordering
      console.warn('Index error occurred, trying simpler query:', indexError);
      
      // Fallback query without ordering (doesn't require composite index)
      const fallbackQuery = query(
        medicalHistoryRef,
        where('userId', '==', userId)
      );
      
      console.log('Executing fallback query without ordering...');
      const fallbackSnapshot = await getDocs(fallbackQuery);
      console.log(`Fallback query returned ${fallbackSnapshot.size} documents`);
      
      // Process the results and sort them in memory instead
      const results = processQueryResults(fallbackSnapshot);
      
      // Sort by date (newest first) in memory
      results.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.date).getTime() / 1000;
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.date).getTime() / 1000;
        return dateB - dateA;
      });
      
      return results;
    }
  } catch (error) {
    console.error('Error fetching medical history:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to fetch medical history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to process query results
const processQueryResults = (querySnapshot: any): MedicalHistoryRecord[] => {
  const medicalHistory: MedicalHistoryRecord[] = [];
  
  // Log each document
  if (querySnapshot.empty) {
    console.log('No documents found matching the query');
  } else {
    console.log('Documents found, processing...');
  }
  
  querySnapshot.forEach((doc: any) => {
    console.log(`Processing document ID: ${doc.id}`);
    const data = doc.data() as any;
    console.log(`Document data:`, data);
    
    try {
      // Extract the diagnosis information
      const diagnosisResults = data.diagnosisResults || {};
      
      // Handle date conversion safely
      let dateValue: Date;
      try {
        if (data.date) {
          if (data.date.toDate && typeof data.date.toDate === 'function') {
            dateValue = data.date.toDate();
            console.log(`Converted Firestore timestamp to date: ${dateValue}`);
          } else if (data.date.seconds) {
            dateValue = new Date(data.date.seconds * 1000);
            console.log(`Converted seconds to date: ${dateValue}`);
          } else {
            dateValue = new Date(data.date);
            console.log(`Parsed date string: ${dateValue}`);
          }
        } else {
          dateValue = new Date();
          console.log('No date found, using current date');
        }
      } catch (dateError) {
        console.error('Error parsing date:', dateError);
        dateValue = new Date();
      }
      
      // Create the record object
      const record: MedicalHistoryRecord = {
        id: doc.id,
        userId: data.userId,
        date: dateValue,
        symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
        diagnosis: data.diagnosis || "Unknown condition",
        diagnosisResults,
        probability: data.probability,
        condition: data.condition,
        description: data.description,
        recommendations: data.recommendations,
        createdAt: data.createdAt
      };
      
      console.log(`Added record to results: ${record.id} - ${record.diagnosis}`);
      medicalHistory.push(record);
    } catch (processingError) {
      console.error(`Error processing document ${doc.id}:`, processingError);
    }
  });
  
  console.log(`Processed ${medicalHistory.length} records successfully`);
  return medicalHistory;
};

/**
 * Gets a specific medical history record
 */
export const getMedicalHistoryRecord = async (recordId: string): Promise<MedicalHistoryRecord | null> => {
  try {
    const docRef = doc(firestore, COLLECTIONS.MEDICAL_HISTORY, recordId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore timestamp to Date if needed
        date: data.date ? new Date(data.date.seconds * 1000) : new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching medical history record ${recordId}:`, error);
    throw new Error(`Failed to fetch medical history record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Updates a medical history record
 */
export const updateMedicalHistoryRecord = async (
  recordId: string, 
  updates: Partial<MedicalHistoryRecord>
): Promise<void> => {
  try {
    const docRef = doc(firestore, COLLECTIONS.MEDICAL_HISTORY, recordId);
    await updateDoc(docRef, { ...updates });
  } catch (error) {
    console.error(`Error updating medical history record ${recordId}:`, error);
    throw new Error(`Failed to update medical history record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Deletes a medical history record
 */
export const deleteMedicalHistoryRecord = async (recordId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, COLLECTIONS.MEDICAL_HISTORY, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting medical history record ${recordId}:`, error);
    throw new Error(`Failed to delete medical history record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * A helper function that gets diagnosis data from the Firestore record
 */
export const getDiagnosisData = async (record: MedicalHistoryRecord): Promise<any> => {
  // If there's no diagnosisResults, we can't do much
  if (!record.diagnosisResults) {
    throw new Error('No diagnosis data available');
  }
  
  // Return the diagnosis data directly from the Firestore record
  return record.diagnosisResults;
};

// Add this testing function to help debug Firestore issues
export const createTestMedicalHistoryRecord = async (userId: string): Promise<string> => {
  try {
    console.log(`Creating test record for user: ${userId}`);
    
    // Create a simple test record
    const testRecord: MedicalHistoryRecord = {
      userId,
      date: new Date(),
      symptoms: ['Test Symptom'],
      diagnosis: 'Test Diagnosis',
      diagnosisResults: {
        results: [{
          condition: 'Test Condition',
          probability: 0.95,
          description: 'This is a test diagnosis record',
          precautions: ['Test precaution']
        }]
      },
      probability: 0.95,
      condition: 'Test Condition',
      description: 'This is a test diagnosis',
      recommendations: ['Test recommendation'],
      createdAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(firestore, COLLECTIONS.MEDICAL_HISTORY), testRecord);
    console.log('Test diagnosis saved to Firestore with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating test record:', error);
    throw new Error(`Failed to create test record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 