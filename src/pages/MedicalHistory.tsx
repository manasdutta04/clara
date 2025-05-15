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
  Eye
} from 'lucide-react';

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
  const [events, setEvents] = useState<MedicalEvent[]>(sampleMedicalEvents);
  const [metrics, setMetrics] = useState<HealthMetric[]>(sampleHealthMetrics);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-12">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Calendar className="mr-3 h-7 w-7 text-blue-400" /> 
          Medical History
        </h1>
        
        {/* Add Record Button */}
        <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg shadow-md flex items-center justify-center text-white transition-all duration-200">
          <Plus size={20} className="mr-2" />
          Add Record
        </button>
      </div>
      <p className="text-gray-400 max-w-3xl mb-8">
        Access complete medical timeline with consultations, reports, medications, and more in one central place.
      </p>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-8 bg-gray-900/80 p-4 rounded-xl backdrop-blur shadow-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search your medical records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-gray-400 hidden md:inline">Filter by:</span>
          {Object.entries(eventTypeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-3 py-2 rounded-lg flex items-center text-sm border transition-all ${
                activeFilters.includes(type)
                  ? `${config.color} ${config.bgColor} border-current`
                  : 'text-gray-400 border-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="mr-2">{config.icon}</span>
              {config.label}
            </button>
          ))}
          
          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Timeline with Details Sidebar */}
      <div className={`grid grid-cols-1 ${isDetailsOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8 relative`}>
        {/* Medical Events Timeline */}
        <div className={`${isDetailsOpen ? 'lg:col-span-2' : 'lg:col-span-1'} bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-800`}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <CalendarIcon className="mr-3 text-blue-400" size={22} />
              Medical Timeline
            </h2>
            
            {Object.keys(eventsByMonth).length > 0 ? (
              <div className="space-y-10">
                {Object.entries(eventsByMonth).map(([monthYear, monthEvents]) => (
                  <div key={monthYear} className="relative">
                    <div className="flex items-center mb-5">
                      <div className="bg-blue-600/20 p-2 rounded-lg mr-3">
                        <CalendarIcon className="text-blue-400" size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-blue-50">{monthYear}</h3>
                    </div>
                    
                    <div className="space-y-4 ml-2 pl-8 border-l-2 border-gray-700">
                      {monthEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className={`relative pl-6 pb-2 cursor-pointer transition-all duration-200 ${
                            selectedEvent?.id === event.id 
                              ? 'bg-gray-800 -ml-6 pl-12 pr-6 py-4 rounded-lg border-l-4 border-blue-500 shadow-md' 
                              : 'hover:bg-gray-800/40 hover:-ml-4 hover:pl-10 hover:rounded-lg'
                          }`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className={`absolute left-[-16px] w-8 h-8 rounded-full flex items-center justify-center ${eventTypeConfig[event.type].bgColor} ${eventTypeConfig[event.type].color} border border-current z-10`}>
                            {eventTypeConfig[event.type].icon}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-white text-lg">{event.title}</h4>
                              <div className="flex flex-wrap items-center text-sm text-gray-400 mt-1 gap-3">
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
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded flex items-center">
                                  <FileText size={12} className="mr-1" />
                                  {event.attachments.length}
                                </span>
                              )}
                              <button className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
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
            ) : (
              <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
                <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">No medical events found with the current filters</p>
                <button 
                  className="text-blue-400 hover:text-blue-300 mt-2"
                  onClick={clearFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Event Details Sidebar */}
        <div 
          className={`bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-800 h-fit lg:sticky lg:top-4 transition-all duration-300 transform ${
            isDetailsOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 lg:absolute lg:right-0'
          }`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Details</h2>
              <button 
                onClick={closeDetails}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            {selectedEvent && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;