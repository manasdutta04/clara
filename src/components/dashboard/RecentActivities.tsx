import React, { useState, useEffect } from 'react';
import { ActivitySquare, Clock, Calendar, FileText, Stethoscope, MapPin, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { 
  getRecentUserActivities, 
  formatActivityTimestamp,
  type UserActivity
} from '@/lib/user-activity-service';

interface RecentActivityProps {
  className?: string;
}

// List of features to display
const ALLOWED_FEATURES = [
  'Medical History',
  'Lab Report Analysis',
  'AI Diagnosis',
  'Nearby Health Services',
  'Chatbot'
];

const getActivityIcon = (feature: string) => {
  switch (feature) {
    case 'Medical History':
      return <Calendar size={16} className="text-blue-400" />;
    case 'Lab Report Analysis':
      return <FileText size={16} className="text-amber-400" />;
    case 'AI Diagnosis':
      return <Stethoscope size={16} className="text-purple-400" />;
    case 'Nearby Health Services':
      return <MapPin size={16} className="text-emerald-400" />;
    case 'Chatbot':
      return <MessageSquare size={16} className="text-rose-400" />;
    default:
      return <ActivitySquare size={16} className="text-gray-400" />;
  }
};

const RecentActivities: React.FC<RecentActivityProps> = ({ className }) => {
  const { user, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!isAuthenticated || !user) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const recentActivities = await getRecentUserActivities(user.id, 10);
        // Filter activities to only include the allowed features
        const filteredActivities = recentActivities
          .filter(activity => ALLOWED_FEATURES.includes(activity.feature))
          .slice(0, 5);
        setActivities(filteredActivities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, isAuthenticated]);

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-medium text-white flex items-center">
          <Clock className="mr-2 text-blue-400" size={18} />
          Recent Activities
        </h3>
        <span className="text-xs text-gray-500">Your recent activities</span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-gray-700 rounded"></div>
                  <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">No recent activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-full bg-gray-800">
                  {getActivityIcon(activity.feature)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-200">
                    <span className="mr-1">{activity.action}</span>
                    <span className="font-medium">{activity.feature}</span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatActivityTimestamp(activity.timestamp as Date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities; 