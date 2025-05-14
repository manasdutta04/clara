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
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from './firebase';

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
  reportUrl?: string;
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
    // Create a JSON representation of the diagnosis for storage
    const diagnosisJSON = JSON.stringify(diagnosisData);
    
    // First, save the report to Firebase Storage
    const storageRef = ref(storage, `users/${userId}/diagnosis-reports/${Date.now()}.json`);
    await uploadString(storageRef, diagnosisJSON, 'raw');
    const reportUrl = await getDownloadURL(storageRef);
    
    // Extract primary diagnostic information
    const primaryDiagnosis = diagnosisData.results && diagnosisData.results.length > 0 
      ? diagnosisData.results[0] 
      : { condition: 'Unknown', probability: 0, description: 'No diagnosis available' };
    
    // Create a Firestore record
    const historyRecord: MedicalHistoryRecord = {
      userId,
      date: new Date(),
      symptoms,
      diagnosis: primaryDiagnosis.condition || 'Unknown',
      diagnosisResults: diagnosisData,
      probability: primaryDiagnosis.probability || 0,
      condition: primaryDiagnosis.condition || 'Unknown',
      description: primaryDiagnosis.description || '',
      recommendations: primaryDiagnosis.precautions || [],
      reportUrl,
      createdAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(firestore, COLLECTIONS.MEDICAL_HISTORY), historyRecord);
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
  try {
    const medicalHistoryQuery = query(
      collection(firestore, COLLECTIONS.MEDICAL_HISTORY),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(medicalHistoryQuery);
    const medicalHistory: MedicalHistoryRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      medicalHistory.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to Date if needed
        date: data.date ? new Date(data.date.seconds * 1000) : new Date(),
      });
    });
    
    return medicalHistory;
  } catch (error) {
    console.error('Error fetching medical history:', error);
    throw new Error(`Failed to fetch medical history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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