import React, { useState, useEffect } from 'react';
import { Activity, FileText, AlertTriangle, CheckCircle, TrendingUp, CalendarDays, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserMedicalHistory, type MedicalHistoryRecord } from '@/lib/medical-history-service';
import { getUserLabReports, type LabReport } from '@/lib/lab-report-service';

interface HealthSummaryProps {
  className?: string;
}

interface HealthStat {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'alert';
  icon?: React.ReactNode;
}

interface HealthIssue {
  name: string;
  type: 'diagnosis' | 'lab' | 'symptom';
  date: Date;
  priority: 'high' | 'medium' | 'low';
  details?: string;
}

const HealthSummary: React.FC<HealthSummaryProps> = ({ className }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Health data
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryRecord[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  
  // Processed health stats
  const [healthStats, setHealthStats] = useState<HealthStat[]>([]);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [lastCheckup, setLastCheckup] = useState<Date | null>(null);

  // Fetch health data when component mounts
  useEffect(() => {
    const fetchHealthData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch medical history and lab reports in parallel
        const [historyData, labData] = await Promise.all([
          getUserMedicalHistory(user.id),
          getUserLabReports(user.id)
        ]);

        setMedicalHistory(historyData);
        setLabReports(labData);

        // Process the data to generate health stats
        processHealthData(historyData, labData);
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to load your health summary. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [user, isAuthenticated]);

  // Process health data to generate statistics and insights
  const processHealthData = (history: MedicalHistoryRecord[], labData: LabReport[]) => {
    // Calculate number of records and dates
    const totalDiagnoses = history.length;
    const totalLabReports = labData.length;
    
    // Find most recent activity date
    const allDates = [
      ...history.map(h => new Date(h.date)),
      ...labData.map(l => new Date(l.date))
    ].sort((a, b) => b.getTime() - a.getTime());
    
    const lastActivityDate = allDates.length > 0 ? allDates[0] : null;
    setLastCheckup(lastActivityDate);
    
    // Identify health issues (abnormal findings or high probability diagnoses)
    const issues: HealthIssue[] = [];
    
    // Process diagnosis data
    history.forEach(record => {
      if (record.probability && record.probability > 0.7) {
        issues.push({
          name: record.diagnosis,
          type: 'diagnosis',
          date: new Date(record.date),
          priority: record.probability > 0.85 ? 'high' : 'medium',
          details: record.description
        });
      }
    });
    
    // Process lab report data
    labData.forEach(report => {
      if (report.results.abnormalFindings && report.results.abnormalFindings.length > 0) {
        report.results.abnormalFindings.forEach(finding => {
          issues.push({
            name: typeof finding === 'string' ? finding : 'Abnormal lab result',
            type: 'lab',
            date: new Date(report.date),
            priority: 'medium',
            details: report.results.explanation
          });
        });
      }
    });
    
    // Sort issues by priority and date
    issues.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return b.date.getTime() - a.date.getTime();
    });
    
    // Generate health stats
    const stats: HealthStat[] = [
      {
        label: 'Medical Records',
        value: totalDiagnoses + totalLabReports,
        icon: <FileText className="h-5 w-5 text-blue-400" />
      },
      {
        label: 'Health Issues',
        value: issues.length,
        status: issues.length > 5 ? 'alert' : issues.length > 2 ? 'warning' : 'normal',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />
      },
      {
        label: 'Last Checkup',
        value: lastActivityDate ? formatDate(lastActivityDate) : 'None',
        icon: <CalendarDays className="h-5 w-5 text-green-400" />
      }
    ];
    
    setHealthStats(stats);
    setHealthIssues(issues.slice(0, 3)); // Show only top 3 issues
  };

  // Format a date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Placeholder message if no data available
  if (!isAuthenticated) {
    return (
      <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 ${className}`}>
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <p className="text-gray-300 mb-2">Sign in to view your health summary</p>
          <p className="text-sm text-gray-500">Track and monitor your health metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-medium text-white flex items-center">
          <Activity className="mr-2 text-blue-400" size={18} />
          Your Health Summary
        </h3>
        <span className="text-xs text-gray-500">
          {lastCheckup ? `Last updated: ${formatDate(lastCheckup)}` : 'No data available'}
        </span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-gray-700 rounded"></div>
                  <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-gray-400">{error}</p>
          </div>
        ) : medicalHistory.length === 0 && labReports.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">No health data available yet</p>
            <p className="text-sm text-gray-500">Use the AI diagnosis or upload lab reports to start tracking your health</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {healthStats.map((stat, index) => (
                <div 
                  key={index}
                  className={`bg-gray-800 rounded-lg p-4 ${
                    stat.status === 'alert' ? 'border-l-4 border-red-500' : 
                    stat.status === 'warning' ? 'border-l-4 border-yellow-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-gray-400">{stat.label}</h4>
                    {stat.icon}
                  </div>
                  <p className="text-xl font-medium text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Health Issues */}
            {healthIssues.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Health Issues to Monitor</h4>
                <div className="space-y-3">
                  {healthIssues.map((issue, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border-l-4 ${
                        issue.priority === 'high' ? 'border-red-500 bg-red-900/20' : 
                        issue.priority === 'medium' ? 'border-yellow-500 bg-yellow-900/20' : 
                        'border-blue-500 bg-blue-900/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-200">{issue.name}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-400">
                              {issue.type === 'diagnosis' ? 'AI Diagnosis' : 
                               issue.type === 'lab' ? 'Lab Result' : 'Symptom'}
                            </span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-xs text-gray-400">{formatDate(issue.date)}</span>
                          </div>
                        </div>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            issue.priority === 'high' ? 'bg-red-900/50 text-red-300' : 
                            issue.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' : 
                            'bg-blue-900/50 text-blue-300'
                          }`}
                        >
                          {issue.priority === 'high' ? 'High Priority' : 
                           issue.priority === 'medium' ? 'Medium Priority' : 
                           'Low Priority'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthSummary;

 