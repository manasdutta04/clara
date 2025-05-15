import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Activity, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Clock,
  FileBarChart, 
  HeartPulse,
  Pill,
  Stethoscope,
  User,
  Calendar as CalendarIcon,
  Download,
  Share2,
  Plus,
  X,
  ExternalLink,
  ChevronUp,
  Eye,
  Save,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { firestore } from '@/lib/firebase';
import { 
  getMedicalEventRecord, 
  getUserMedicalEvents, 
  saveMedicalEvent,
  updateMedicalEventRecord,
  deleteMedicalEventRecord,
  createSampleMedicalEvent
} from '@/lib/medical-events-service';
import type { MedicalEventRecord } from '@/lib/medical-events-service';

interface MedicalEvent {
  id: string;
  date: string;
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
}

interface HealthMetric {
  id: string;
  name: string;
  values: Array<{
    date: string;
    value: number;
  }>;
  unit: string;
  normalRange?: {
    min: number;
    max: number;
  };
}

// Sample data for demonstration
const sampleMedicalEvents: MedicalEvent[] = [
  {
    id: 'event-1',
    date: '2025-05-10T09:30:00',
    title: 'Annual Physical Examination',
    type: 'consultation',
    provider: 'Dr. Sarah Johnson',
    description: 'Routine annual physical examination with blood work and general health assessment.',
    attachments: [
      { id: 'att-1', name: 'Physical Exam Report', type: 'PDF', size: '1.2 MB' },
      { id: 'att-2', name: 'Recommendation Notes', type: 'PDF', size: '0.5 MB' },
    ],
    metrics: {
      'Blood Pressure': { value: 120, unit: 'mmHg', trend: 'stable', previousValue: 118 },
      'Weight': { value: 68, unit: 'kg', trend: 'down', previousValue: 70 },
      'BMI': { value: 23.5, unit: 'kg/m²', trend: 'down', previousValue: 24.2 },
    }
  },
  {
    id: 'event-2',
    date: '2025-04-15T14:00:00',
    title: 'Blood Test Results',
    type: 'report',
    provider: 'HealthLab Diagnostics',
    description: 'Complete blood count, metabolic panel, and cholesterol screening results.',
    attachments: [
      { id: 'att-3', name: 'Blood Test Results', type: 'PDF', size: '2.4 MB' },
    ],
    metrics: {
      'Cholesterol': { value: 185, unit: 'mg/dL', trend: 'down', previousValue: 195 },
      'Glucose': { value: 92, unit: 'mg/dL', trend: 'stable', previousValue: 90 },
    }
  },
  {
    id: 'event-3',
    date: '2025-03-22T10:15:00',
    title: 'Allergy Specialist Consultation',
    type: 'consultation',
    provider: 'Dr. Michael Chen',
    description: 'Consultation for seasonal allergies and potential new treatment options.',
    attachments: [
      { id: 'att-4', name: 'Allergy Test Results', type: 'PDF', size: '1.7 MB' },
      { id: 'att-5', name: 'Allergy Management Plan', type: 'PDF', size: '0.8 MB' },
    ]
  },
  {
    id: 'event-4',
    date: '2025-03-05T09:00:00',
    title: 'Medication Prescription',
    type: 'medication',
    provider: 'Dr. Sarah Johnson',
    description: 'Prescription for Atorvastatin 10mg, daily for cholesterol management.',
  },
  {
    id: 'event-5',
    date: '2025-02-18T11:30:00',
    title: 'Influenza Vaccination',
    type: 'vaccination',
    provider: 'City Health Clinic',
    description: 'Annual influenza vaccination, seasonal quadrivalent formula.',
    attachments: [
      { id: 'att-6', name: 'Vaccination Record', type: 'PDF', size: '0.3 MB' },
    ]
  },
  {
    id: 'event-6',
    date: '2025-01-20T15:45:00',
    title: 'Cardiac Stress Test',
    type: 'test',
    provider: 'Heartcare Medical Center',
    description: 'Treadmill stress test to evaluate cardiac function during physical activity.',
    attachments: [
      { id: 'att-7', name: 'Stress Test Results', type: 'PDF', size: '3.1 MB' },
      { id: 'att-8', name: 'ECG Readings', type: 'PDF', size: '1.9 MB' },
    ],
    metrics: {
      'Heart Rate (Max)': { value: 145, unit: 'bpm', trend: 'stable', previousValue: 148 },
      'Recovery Time': { value: 3.5, unit: 'min', trend: 'up', previousValue: 3.2 },
    }
  },
];

const sampleHealthMetrics: HealthMetric[] = [
  {
    id: 'metric-1',
    name: 'Blood Pressure (Systolic)',
    values: [
      { date: '2025-01-15', value: 122 },
      { date: '2025-02-15', value: 124 },
      { date: '2025-03-15', value: 121 },
      { date: '2025-04-15', value: 118 },
      { date: '2025-05-10', value: 120 },
    ],
    unit: 'mmHg',
    normalRange: { min: 90, max: 120 }
  },
  {
    id: 'metric-2',
    name: 'Weight',
    values: [
      { date: '2025-01-15', value: 72 },
      { date: '2025-02-15', value: 71 },
      { date: '2025-03-15', value: 70 },
      { date: '2025-04-15', value: 69 },
      { date: '2025-05-10', value: 68 },
    ],
    unit: 'kg'
  },
  {
    id: 'metric-3',
    name: 'Cholesterol',
    values: [
      { date: '2024-10-15', value: 205 },
      { date: '2025-01-15', value: 198 },
      { date: '2025-04-15', value: 185 },
    ],
    unit: 'mg/dL',
    normalRange: { min: 0, max: 200 }
  }
];

// Event type mapping to icons and colors
const eventTypeConfig: {
  [key: string]: {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    label: string;
  }
} = {
  consultation: { 
    icon: <Stethoscope size={18} />, 
    color: 'text-blue-500 border-blue-500', 
    bgColor: 'bg-blue-500/10',
    label: 'Consultation' 
  },
  report: { 
    icon: <FileBarChart size={18} />, 
    color: 'text-emerald-500 border-emerald-500', 
    bgColor: 'bg-emerald-500/10',
    label: 'Medical Report' 
  },
  medication: { 
    icon: <Pill size={18} />, 
    color: 'text-purple-500 border-purple-500', 
    bgColor: 'bg-purple-500/10',
    label: 'Medication' 
  },
  vaccination: { 
    icon: <HeartPulse size={18} />, 
    color: 'text-rose-500 border-rose-500', 
    bgColor: 'bg-rose-500/10',
    label: 'Vaccination' 
  },
  test: { 
    icon: <Activity size={18} />, 
    color: 'text-amber-500 border-amber-500', 
    bgColor: 'bg-amber-500/10',
    label: 'Medical Test' 
  },
};

// Format date to readable string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Format time to readable string
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const MedicalHistory: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>(sampleHealthMetrics);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<MedicalEvent>>({
    type: 'consultation',
    date: new Date().toISOString().slice(0, 16),
    title: '',
    provider: '',
    description: ''
  });

  // Apply filters and search
  const filteredEvents = events.filter(event => {
    // Apply type filters if any are active
    if (activeFilters.length > 0 && !activeFilters.includes(event.type)) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.provider.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Toggle filter selection
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  // Handle event selection
  const handleEventClick = (event: MedicalEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  // Close the details panel
  const closeDetails = () => {
    setIsDetailsOpen(false);
    // Wait for the animation to finish before deselecting the event
    setTimeout(() => setSelectedEvent(null), 300);
  };

  // Get trend direction icon
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="text-rose-500" size={16} />;
      case 'down':
        return <ChevronDown className="text-emerald-500" size={16} />;
      case 'stable':
        return <ChevronRight className="text-amber-500" size={16} />;
      default:
        return null;
    }
  };

  // Organize events by month for timeline view
  const eventsByMonth: { [key: string]: MedicalEvent[] } = {};
  filteredEvents.forEach(event => {
    const date = new Date(event.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!eventsByMonth[monthYear]) {
      eventsByMonth[monthYear] = [];
    }
    
    eventsByMonth[monthYear].push(event);
  });

  // Handle adding new event
  const handleAddEvent = () => {
    setShowAddModal(true);
  };

  // Handle input change for new event
  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Fetch user's medical events from Firebase
  const fetchUserMedicalEvents = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const medicalEvents = await getUserMedicalEvents(user.id);
      console.log('Fetched medical events:', medicalEvents.length, 'records');
      
      if (medicalEvents.length === 0) {
        // No records yet - this could be the first time
        console.log('No records found - collection may be empty or not exist yet');
        setEvents([]);
        return;
      }
      
      // Convert Firebase records to the local MedicalEvent format
      const convertedEvents: MedicalEvent[] = medicalEvents.map(record => ({
        id: record.id || `event-${Date.now()}`,
        date: typeof record.date === 'string' ? record.date : record.date instanceof Date ? record.date.toISOString() : new Date().toISOString(),
        title: record.title,
        type: record.type,
        provider: record.provider,
        description: record.description,
        attachments: record.attachments,
        metrics: record.metrics
      }));
      
      setEvents(convertedEvents);
    } catch (error) {
      console.error('Error fetching medical events:', error);
      // Handle the error gracefully
      if (error instanceof Error && 
          (error.message.includes('permissions') || error.message.includes('index'))) {
        setError('Permission issue with Firestore. Try creating a sample record or check your account permissions.');
      } else {
        setError('Failed to load medical history. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Load user medical events when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching medical events...');
      fetchUserMedicalEvents();
    } else if (!authLoading) {
      // Clear events when user logs out
      setEvents([]);
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);
  
  // Create a sample medical event for testing
  const handleCreateSampleEvent = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      await createSampleMedicalEvent(user.id);
      // Refresh the events list
      await fetchUserMedicalEvents();
    } catch (error) {
      console.error('Error creating sample event:', error);
      setError('Failed to create sample event. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for new event
  const handleSubmitNewEvent = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to add medical records');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Create the new event object
      const eventToAdd: Omit<MedicalEventRecord, 'userId' | 'createdAt'> = {
        date: newEvent.date || new Date().toISOString(),
        title: newEvent.title || 'Untitled Event',
        type: (newEvent.type as MedicalEvent['type']) || 'consultation',
        provider: newEvent.provider || 'Unknown Provider',
        description: newEvent.description || '',
      };
      
      // Save to Firebase
      const recordId = await saveMedicalEvent(user.id, eventToAdd);
      console.log('Saved new medical event with ID:', recordId);
      
      // Refresh the events list
      await fetchUserMedicalEvents();
      
      // Reset the form and close the modal
      setNewEvent({
        type: 'consultation',
        date: new Date().toISOString().slice(0, 16),
        title: '',
        provider: '',
        description: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving new medical event:', error);
      setError('Failed to save medical record. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  return (
    <div className="w-full mx-auto px-4 pb-12 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="py-6 flex justify-between items-center border-b border-gray-800">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Calendar className="mr-3 h-6 w-6 text-blue-400" /> 
              Medical History
            </h1>
            {user && (
              <p className="text-gray-400 text-sm mt-1">
                Viewing records for {user.name} ({user.email})
              </p>
            )}
          </div>
          
          {/* Header Actions */}
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200 text-sm"
                  />
                </div>
                
                <button 
                  onClick={handleAddEvent}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center justify-center text-white transition-all duration-200 text-sm font-medium"
                  disabled={loading}
                >
                  <Plus size={18} className="mr-2" />
                  Add Record
                </button>
                
                <button 
                  onClick={fetchUserMedicalEvents}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-full"
                  title="Refresh records"
                  disabled={loading}
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </>
            ) : (
              <div className="text-gray-400 text-sm flex items-center">
                <User size={16} className="mr-2" />
                Please sign in to view your medical records
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="py-4 flex flex-wrap gap-2 mb-6">
          <span className="text-gray-400 text-sm py-2">Filter by:</span>
          {Object.entries(eventTypeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-3 py-2 rounded-lg flex items-center text-sm border transition-all ${
                activeFilters.includes(type)
                  ? `${config.color} ${config.bgColor} border-current`
                  : 'text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <span className="mr-2">{config.icon}</span>
              {config.label}
            </button>
          ))}
          
          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Timeline Container */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center">
            <CalendarIcon className="text-blue-400 mr-2" size={18} />
            <h2 className="text-lg font-medium text-white">Medical Timeline</h2>
          </div>
          
          <div className="p-6">
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Loading your medical records...</p>
              </div>
            )}
            
            {/* Error state */}
            {error && !loading && (
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6 my-4">
                <p className="text-red-400 mb-2">{error}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <button 
                    onClick={fetchUserMedicalEvents}
                    className="text-blue-400 hover:text-blue-300 flex items-center px-3 py-2 bg-blue-950/30 rounded-md"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Try again
                  </button>
                  
                  {isAuthenticated && user && (
                    <button 
                      onClick={handleCreateSampleEvent}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center px-3 py-2 bg-emerald-950/30 rounded-md"
                    >
                      <Plus size={14} className="mr-1" />
                      Create sample record
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Not authenticated state */}
            {!isAuthenticated && !authLoading && !loading && (
              <div className="text-center py-16 bg-gray-800/20 rounded-lg border border-gray-800">
                <User size={48} className="mx-auto mb-4 text-gray-700" />
                <p className="text-gray-300 mb-2 text-lg">Sign in to access your medical records</p>
                <p className="text-gray-400 max-w-md mx-auto">
                  Your medical timeline is personal and requires authentication. 
                  Please sign in to view your records.
                </p>
              </div>
            )}
            
            {/* Empty records state - only show when not loading, no error, and authenticated */}
            {!loading && !error && isAuthenticated && Object.keys(eventsByMonth).length === 0 && (
              <div className="text-center py-16 bg-gray-800/20 rounded-lg border border-gray-800">
                <FileText size={48} className="mx-auto mb-4 text-gray-700" />
                <p className="text-gray-300 mb-2">No medical records found</p>
                <div className="flex flex-col gap-2 items-center">
                  {activeFilters.length > 0 || searchQuery ? (
                    <button 
                      className="text-blue-400 hover:text-blue-300"
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <button 
                        className="text-blue-400 hover:text-blue-300 flex items-center px-3 py-2 bg-blue-950/30 rounded-md"
                        onClick={handleAddEvent}
                      >
                        <Plus size={14} className="mr-1" />
                        Add your first record
                      </button>
                      
                      <button 
                        className="text-emerald-400 hover:text-emerald-300 flex items-center px-3 py-2 bg-emerald-950/30 rounded-md"
                        onClick={handleCreateSampleEvent}
                      >
                        <Plus size={14} className="mr-1" />
                        Create a sample record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Records display - only show when not loading and has records */}
            {!loading && Object.keys(eventsByMonth).length > 0 && (
              <div className="space-y-8">
                {Object.entries(eventsByMonth).map(([monthYear, monthEvents]) => (
                  <div key={monthYear} className="relative">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-600/20 p-2 rounded-md mr-3">
                        <CalendarIcon className="text-blue-400" size={16} />
                      </div>
                      <h3 className="text-md font-medium text-blue-50">{monthYear}</h3>
                    </div>
                    
                    <div className="space-y-3 ml-2 pl-8 border-l border-gray-800">
                      {monthEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className={`relative pl-6 cursor-pointer group ${
                            selectedEvent?.id === event.id 
                              ? 'bg-gray-800 -ml-6 pl-12 pr-6 py-3 rounded-md' 
                              : 'hover:bg-gray-800/30 py-3 pr-6 -ml-0 hover:ml-0 rounded-md'
                          }`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className={`absolute left-[-14px] w-6 h-6 rounded-full flex items-center justify-center ${eventTypeConfig[event.type].bgColor} border border-gray-800 z-10`}>
                            {eventTypeConfig[event.type].icon}
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-medium text-white">{event.title}</h4>
                              <div className="flex flex-wrap items-center text-sm text-gray-400 mt-1 gap-x-4">
                                <div className={`flex items-center ${eventTypeConfig[event.type].color}`}>
                                  {eventTypeConfig[event.type].icon}
                                  <span className="ml-1">{eventTypeConfig[event.type].label}</span>
                                </div>
                                <div className="flex items-center">
                                  <User size={14} className="mr-1" /> 
                                  {event.provider}
                                </div>
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-1" />
                                  <span>{formatTime(event.date)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {event.attachments && (
                                <span className="text-xs bg-gray-800 px-2 py-1 rounded flex items-center">
                                  <FileText size={12} className="mr-1" />
                                  {event.attachments.length}
                                </span>
                              )}
                              <button className="text-blue-400 hover:text-blue-300 flex items-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye size={16} className="mr-1" />
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <div className={`mr-3 p-2 rounded-md ${eventTypeConfig[selectedEvent.type].bgColor}`}>
                      {eventTypeConfig[selectedEvent.type].icon}
                    </div>
                    Event Details
                  </h2>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 hover:bg-gray-800 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className={`px-4 py-3 rounded-lg ${eventTypeConfig[selectedEvent.type].bgColor} border ${eventTypeConfig[selectedEvent.type].color}`}>
                    <div className="flex items-center">
                      <div className="mr-3">
                        {eventTypeConfig[selectedEvent.type].icon}
                      </div>
                      <div>
                        <div className={`text-sm ${eventTypeConfig[selectedEvent.type].color}`}>
                          {eventTypeConfig[selectedEvent.type].label}
                        </div>
                        <h3 className="text-lg font-medium text-white">{selectedEvent.title}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="mr-2 text-gray-400" size={16} />
                      <span>{formatDate(selectedEvent.date)} at {formatTime(selectedEvent.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <User className="mr-2 text-gray-400" size={16} />
                      <span>{selectedEvent.provider}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-300">Description</h4>
                    <p className="text-gray-400 bg-gray-800/50 p-4 rounded-lg">{selectedEvent.description}</p>
                  </div>
                  
                  {selectedEvent.metrics && Object.keys(selectedEvent.metrics).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-300">Health Metrics</h4>
                      <div className="grid gap-3">
                        {Object.entries(selectedEvent.metrics).map(([name, data]) => (
                          <div key={name} className="bg-gray-800/70 p-4 rounded-lg">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">{name}</span>
                              <div className="flex items-center">
                                <span className="font-medium text-white">{data.value} {data.unit}</span>
                                {data.trend && (
                                  <span className="ml-2">
                                    {getTrendIcon(data.trend)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {data.previousValue && (
                              <div className="text-sm text-gray-500">
                                Previous: {data.previousValue} {data.unit}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-300">Attachments</h4>
                      <div className="grid gap-2">
                        {selectedEvent.attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center justify-between bg-gray-800/70 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                            <div className="flex items-center">
                              <div className="bg-blue-600/20 p-2 rounded mr-3">
                                <FileText className="text-blue-400" size={16} />
                              </div>
                              <div>
                                <div className="text-gray-200">{attachment.name}</div>
                                <div className="text-xs text-gray-500">{attachment.type} · {attachment.size}</div>
                              </div>
                            </div>
                            <div className="flex">
                              <button className="p-2 hover:bg-gray-700 rounded-full" title="Download">
                                <Download size={16} />
                              </button>
                              <button className="p-2 hover:bg-gray-700 rounded-full" title="Share">
                                <Share2 size={16} />
                              </button>
                              <button className="p-2 hover:bg-gray-700 rounded-full" title="Open">
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Record Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Plus className="mr-3 text-blue-400" size={22} />
                    Add New Medical Record
                  </h2>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-800 rounded-full"
                    disabled={isSaving}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {!isAuthenticated ? (
                  <div className="text-center py-8 bg-gray-800/20 rounded-lg border border-gray-800">
                    <User size={36} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-300 font-medium mb-2">Authentication Required</p>
                    <p className="text-gray-400 mb-4">
                      You need to be signed in to add medical records.
                      Please sign in to continue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {error && (
                      <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-4">
                        <p className="text-red-400">{error}</p>
                      </div>
                    )}
                  
                    <div>
                      <label className="block text-sm font-medium mb-3">Record Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(eventTypeConfig).map(([type, config]) => (
                          <div 
                            key={type}
                            onClick={() => !isSaving && setNewEvent({ ...newEvent, type: type as MedicalEvent['type'] })}
                            className={`flex items-center p-3 rounded-lg cursor-pointer border transition-colors ${
                              newEvent.type === type 
                                ? `${config.color} ${config.bgColor} border-current` 
                                : 'border-gray-700 hover:border-gray-600'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="mr-2">{config.icon}</div>
                            <span>{config.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">Title *</label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          placeholder="E.g., Annual Check-up"
                          value={newEvent.title}
                          onChange={handleNewEventChange}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                          required
                          disabled={isSaving}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="provider" className="block text-sm font-medium mb-2">Healthcare Provider *</label>
                        <input
                          type="text"
                          id="provider"
                          name="provider"
                          placeholder="E.g., Dr. Sarah Johnson"
                          value={newEvent.provider}
                          onChange={handleNewEventChange}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                          required
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium mb-2">Date and Time *</label>
                      <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={newEvent.date}
                        onChange={handleNewEventChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                        required
                        disabled={isSaving}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter details about this medical record..."
                        value={newEvent.description}
                        onChange={handleNewEventChange}
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white resize-none"
                        disabled={isSaving}
                      />
                    </div>
                    
                    {/* Temporarily disabled for Firebase integration */}
                    {/*
                    <div>
                      <label className="block text-sm font-medium mb-2">Attachments</label>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                        <FileText size={28} className="mx-auto mb-2 text-gray-500" />
                        <p className="text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
                        <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">
                          Browse Files
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                    */}
                    
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
                      <button 
                        onClick={handleCloseModal} 
                        className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-white"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSubmitNewEvent}
                        className={`px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center text-white ${
                          isSaving || !newEvent.title || !newEvent.provider || !newEvent.date ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isSaving || !newEvent.title || !newEvent.provider || !newEvent.date}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="mr-2" />
                            Save Record
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;