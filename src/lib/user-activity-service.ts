import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from './firebase';

// Types for user activity records
export interface UserActivity {
  id?: string;
  userId: string;
  feature: string;
  action: string;
  timestamp: Date | Timestamp;
  createdAt?: any; // Firestore timestamp
}

// Collection name
const COLLECTION = 'userActivities';

// Features that can be tracked
export enum Feature {
  MEDICAL_HISTORY = 'Medical History',
  LAB_REPORT_ANALYSIS = 'Lab Report Analysis',
  AI_DIAGNOSIS = 'AI Diagnosis',
  NEARBY_HEALTH_SERVICES = 'Nearby Health Services',
  CHATBOT = 'Chatbot'
}

// Actions that can be tracked
export enum Action {
  VIEW = 'Viewed',
  CREATE = 'Created',
  UPDATE = 'Updated',
  DELETE = 'Deleted',
  SEARCH = 'Searched',
  FILTER = 'Filtered'
}

/**
 * Track a user activity
 */
export const trackUserActivity = async (
  userId: string,
  feature: Feature,
  action: Action
): Promise<string | void> => {
  if (!userId) return;
  
  try {
    const activityData: UserActivity = {
      userId,
      feature,
      action,
      timestamp: new Date(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(firestore, COLLECTION), activityData);
    console.log(`Activity tracked: ${action} ${feature}`);
    return docRef.id;
  } catch (error) {
    console.error('Error tracking user activity:', error);
    // Don't throw - activity tracking should fail silently
  }
};

/**
 * Get recent user activities
 */
export const getRecentUserActivities = async (
  userId: string,
  maxResults: number = 10
): Promise<UserActivity[]> => {
  if (!userId) return [];
  
  try {
    const activitiesRef = collection(firestore, COLLECTION);
    const activitiesQuery = query(
      activitiesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(activitiesQuery);
    
    const activities: UserActivity[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        userId: data.userId,
        feature: data.feature,
        action: data.action,
        timestamp: data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp)
      });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting user activities:', error);
    return [];
  }
};

/**
 * Format timestamp for display
 */
export const formatActivityTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
}; 