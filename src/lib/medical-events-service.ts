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
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { firestore } from './firebase';

// Types for medical events records
export interface MedicalEventRecord {
  id?: string;
  userId: string;
  date: Date | string | Timestamp;
  title: string;
  type: 'consultation' | 'report' | 'medication' | 'vaccination' | 'test';
  provider: string;
  description: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
  }>;
  metrics?: {
    [key: string]: {
      value: number;
      unit: string;
      trend?: 'up' | 'down' | 'stable';
      previousValue?: number;
    };
  };
  createdAt?: any; // Firestore timestamp
}

// Collection names
const COLLECTIONS = {
  MEDICAL_EVENTS: 'medicalEvents',
};

/**
 * Saves a medical event to Firestore
 */
export const saveMedicalEvent = async (
  userId: string,
  eventData: Omit<MedicalEventRecord, 'userId' | 'createdAt'>
): Promise<string> => {
  try {
    // Create a Firestore record
    const eventRecord: MedicalEventRecord = {
      userId,
      ...eventData,
      createdAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(firestore, COLLECTIONS.MEDICAL_EVENTS), eventRecord);
    console.log('Medical event saved to Firestore with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving medical event:', error);
    throw new Error(`Failed to save medical event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gets all medical events for a user
 */
export const getUserMedicalEvents = async (userId: string): Promise<MedicalEventRecord[]> => {
  if (!userId) {
    console.error('Invalid userId provided to getUserMedicalEvents:', userId);
    throw new Error('User ID is required to fetch medical events');
  }

  console.log(`Attempting to fetch medical events for user: ${userId}`);
  
  try {
    // Create the query
    const medicalEventsRef = collection(firestore, COLLECTIONS.MEDICAL_EVENTS);
    
    try {
      // Try to query with ordering by date
      const medicalEventsQuery = query(
        medicalEventsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      // Execute the query
      const querySnapshot = await getDocs(medicalEventsQuery);
      console.log(`Query executed, returned ${querySnapshot.size} documents`);
      
      // Process the results
      const events: MedicalEventRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          // Handle date conversion from Firestore Timestamp if needed
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        });
      });
      
      return events;
    } catch (error) {
      console.error('Error executing query with ordering:', error);
      
      if (error instanceof Error && 
          error.message.includes('Missing or insufficient permissions') || 
          error.message.includes('index')) {
        console.log('Attempting to check if collection exists by creating a sample record...');
        
        // If the collection doesn't exist yet, try to create it with a first record
        try {
          // Create a sample event just to establish the collection
          await createSampleMedicalEvent(userId);
          
          // Then try a simplified query without the index dependency
          const basicQuery = query(
            medicalEventsRef,
            where('userId', '==', userId)
          );
          
          const fallbackSnapshot = await getDocs(basicQuery);
          console.log(`Basic query executed, returned ${fallbackSnapshot.size} documents`);
          
          // Process the results
          const events: MedicalEventRecord[] = [];
          fallbackSnapshot.forEach((doc) => {
            const data = doc.data();
            events.push({
              id: doc.id,
              ...data,
              // Handle date conversion from Firestore Timestamp if needed
              date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
            });
          });
          
          // Sort manually since we're not using orderBy
          events.sort((a, b) => {
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          });
          
          return events;
        } catch (initError) {
          console.error('Error initializing collection:', initError);
          return []; // Return empty array instead of error for first-time use
        }
      }
      
      // If it's a different error, try the fallback query without ordering
      const fallbackQuery = query(
        medicalEventsRef,
        where('userId', '==', userId)
      );
      
      const fallbackSnapshot = await getDocs(fallbackQuery);
      console.log(`Fallback query executed, returned ${fallbackSnapshot.size} documents`);
      
      // Process the results
      const events: MedicalEventRecord[] = [];
      fallbackSnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          // Handle date conversion from Firestore Timestamp if needed
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        });
      });
      
      // Sort manually since we're not using orderBy
      events.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      return events;
    }
  } catch (error) {
    console.error('Error fetching medical events:', error);
    // For first-time use, return empty array instead of error
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.log('This appears to be a permissions issue. Returning empty data set.');
      return [];
    }
    throw new Error(`Failed to fetch medical events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gets a specific medical event record
 */
export const getMedicalEventRecord = async (recordId: string): Promise<MedicalEventRecord | null> => {
  try {
    const docRef = doc(firestore, COLLECTIONS.MEDICAL_EVENTS, recordId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore timestamp to Date if needed
        date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching medical event record ${recordId}:`, error);
    throw new Error(`Failed to fetch medical event record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Updates a medical event record
 */
export const updateMedicalEventRecord = async (
  recordId: string, 
  updates: Partial<MedicalEventRecord>
): Promise<void> => {
  try {
    const docRef = doc(firestore, COLLECTIONS.MEDICAL_EVENTS, recordId);
    await updateDoc(docRef, { ...updates });
  } catch (error) {
    console.error(`Error updating medical event record ${recordId}:`, error);
    throw new Error(`Failed to update medical event record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Deletes a medical event record
 */
export const deleteMedicalEventRecord = async (recordId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, COLLECTIONS.MEDICAL_EVENTS, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting medical event record ${recordId}:`, error);
    throw new Error(`Failed to delete medical event record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Creates a sample medical event for testing
 */
export const createSampleMedicalEvent = async (userId: string): Promise<string> => {
  try {
    const eventTypes: Array<'consultation' | 'report' | 'medication' | 'vaccination' | 'test'> = [
      'consultation', 'report', 'medication', 'vaccination', 'test'
    ];
    
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Create a sample event
    const sampleEvent: MedicalEventRecord = {
      userId,
      title: `Sample ${randomType} record`,
      date: new Date(),
      type: randomType,
      provider: 'Sample Healthcare Provider',
      description: 'This is a sample medical event record created for testing purposes.',
      createdAt: serverTimestamp()
    };
    
    // Add metrics if it's a consultation or test
    if (randomType === 'consultation' || randomType === 'test') {
      sampleEvent.metrics = {
        'Blood Pressure': { value: 120, unit: 'mmHg', trend: 'stable', previousValue: 118 },
        'Weight': { value: 68, unit: 'kg', trend: 'down', previousValue: 70 }
      };
    }
    
    // Add attachment if it's a report
    if (randomType === 'report') {
      sampleEvent.attachments = [
        { id: `att-${Date.now()}`, name: 'Sample Report', type: 'PDF', size: '1.2 MB' }
      ];
    }
    
    // Add to Firestore
    const docRef = await addDoc(collection(firestore, COLLECTIONS.MEDICAL_EVENTS), sampleEvent);
    console.log('Sample medical event saved to Firestore with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating sample medical event:', error);
    throw new Error(`Failed to create sample medical event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 