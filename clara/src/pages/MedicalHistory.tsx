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
  ChevronLeft, 
  ChevronUp,
  Download,
  Share2
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
    label: string;
  }
} = {
  consultation: { 
    icon: <Stethoscope size={20} />, 
    color: 'border-blue-500 bg-blue-500/10 text-blue-500', 
    label: 'Consultation' 
  },
  report: { 
    icon: <FileBarChart size={20} />, 
    color: 'border-green-500 bg-green-500/10 text-green-500', 
    label: 'Medical Report' 
  },
  medication: { 
    icon: <Pill size={20} />, 
    color: 'border-purple-500 bg-purple-500/10 text-purple-500', 
    label: 'Medication' 
  },
  vaccination: { 
    icon: <HeartPulse size={20} />, 
    color: 'border-red-500 bg-red-500/10 text-red-500', 
    label: 'Vaccination' 
  },
  test: { 
    icon: <Activity size={20} />, 
    color: 'border-yellow-500 bg-yellow-500/10 text-yellow-500', 
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
  const [view, setView] = useState<'timeline' | 'metrics'>('timeline');

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
  };

  // Get trend direction icon
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="text-red-500" size={16} />;
      case 'down':
        return <ChevronDown className="text-green-500" size={16} />;
      case 'stable':
        return <ChevronRight className="text-yellow-500" size={16} />;
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
    <div className="bg-black min-h-screen text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Medical History</h1>
          <p className="text-xl text-gray-400">
            Access your complete medical timeline with saved consultations, reports, and track health progress over time.
          </p>
        </div>
        
        {/* View Toggle and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-lg flex items-center ${view === 'timeline' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setView('timeline')}
            >
              <Calendar className="mr-2" size={18} />
              Timeline
            </button>
            <button 
              className={`px-4 py-2 rounded-lg flex items-center ${view === 'metrics' ? 'bg-blue-600' : 'bg-gray-800'}`}
              onClick={() => setView('metrics')}
            >
              <Activity className="mr-2" size={18} />
              Health Metrics
            </button>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search medical records..."
                className="bg-gray-800 py-2 pl-10 pr-4 rounded-lg w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <button 
                className="bg-gray-800 py-2 px-4 rounded-lg flex items-center justify-between w-full sm:w-auto"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              >
                <div className="flex items-center">
                  <Filter className="mr-2" size={18} />
                  <span>Filter</span>
                </div>
                <ChevronDown size={18} className={`ml-2 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterDropdownOpen && (
                <div className="absolute z-10 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4 right-0">
                  <h3 className="text-sm font-medium mb-2">Filter by type</h3>
                  <div className="space-y-2 mb-4">
                    {Object.entries(eventTypeConfig).map(([type, config]) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`filter-${type}`}
                          className="mr-2"
                          checked={activeFilters.includes(type)}
                          onChange={() => toggleFilter(type)}
                        />
                        <label htmlFor={`filter-${type}`} className="flex items-center">
                          <span className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]} mr-2`}></span>
                          {config.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="w-full bg-gray-700 hover:bg-gray-600 py-1 px-3 rounded text-sm"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline View */}
          {view === 'timeline' && (
            <>
              {/* Medical Events Timeline */}
              <div className="lg:col-span-2 bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <FileText className="mr-3 text-blue-400" size={24} />
                    Medical Timeline
                  </h2>
                  
                  {Object.keys(eventsByMonth).length > 0 ? (
                    <div className="space-y-8">
                      {Object.entries(eventsByMonth).map(([monthYear, monthEvents]) => (
                        <div key={monthYear} className="relative">
                          <div className="flex items-center mb-4">
                            <CalendarIcon className="text-blue-400 mr-2" size={18} />
                            <h3 className="text-lg font-medium">{monthYear}</h3>
                          </div>
                          
                          <div className="space-y-4 ml-2 pl-6 border-l-2 border-gray-700">
                            {monthEvents.map((event) => (
                              <div 
                                key={event.id} 
                                className={`relative pl-6 pb-2 cursor-pointer ${selectedEvent?.id === event.id ? 'bg-gray-800 -ml-6 pl-12 pr-6 py-2 rounded-lg' : ''}`}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className={`absolute left-[-9px] w-4 h-4 rounded-full ${eventTypeConfig[event.type].color.split(' ')[0]} border-2 border-gray-900`}></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <h4 className="font-medium">{event.title}</h4>
                                    <div className="flex items-center text-sm text-gray-400 mt-1">
                                      <div className={`flex items-center mr-3 ${eventTypeConfig[event.type].color}`}>
                                        {eventTypeConfig[event.type].icon}
                                        <span className="ml-1">{eventTypeConfig[event.type].label}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <User size={14} className="mr-1" /> 
                                        {event.provider}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center mt-2 sm:mt-0 text-sm text-gray-400">
                                    <Clock size={14} className="mr-1" />
                                    <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No medical events found with the current filters.</p>
                      <button 
                        className="mt-4 text-blue-400 hover:text-blue-300"
                        onClick={clearFilters}
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Event Details */}
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg lg:col-span-1">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Event Details</h2>
                  
                  {selectedEvent ? (
                    <div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${eventTypeConfig[selectedEvent.type].color} mb-4`}>
                        {eventTypeConfig[selectedEvent.type].icon}
                        <span className="ml-2">{eventTypeConfig[selectedEvent.type].label}</span>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2">{selectedEvent.title}</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-400">
                          <Calendar className="mr-2" size={16} />
                          <span>{formatDate(selectedEvent.date)} at {formatTime(selectedEvent.date)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-400">
                          <User className="mr-2" size={16} />
                          <span>{selectedEvent.provider}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-700">
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-gray-300">{selectedEvent.description}</p>
                        </div>
                        
                        {selectedEvent.metrics && Object.keys(selectedEvent.metrics).length > 0 && (
                          <div className="pt-4 border-t border-gray-700">
                            <h4 className="font-medium mb-3">Health Metrics</h4>
                            <div className="space-y-3">
                              {Object.entries(selectedEvent.metrics).map(([name, data]) => (
                                <div key={name} className="bg-gray-800 p-3 rounded-lg">
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">{name}</span>
                                    <div className="flex items-center">
                                      <span className="font-medium">{data.value} {data.unit}</span>
                                      {data.trend && (
                                        <span className="ml-2">
                                          {getTrendIcon(data.trend)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {data.previousValue && (
                                    <div className="mt-1 text-sm text-gray-400">
                                      Previous: {data.previousValue} {data.unit}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                          <div className="pt-4 border-t border-gray-700">
                            <h4 className="font-medium mb-3">Attachments</h4>
                            <div className="space-y-2">
                              {selectedEvent.attachments.map(attachment => (
                                <div key={attachment.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                  <div className="flex items-center">
                                    <FileText className="mr-2 text-blue-400" size={16} />
                                    <div>
                                      <div>{attachment.name}</div>
                                      <div className="text-sm text-gray-400">{attachment.type} · {attachment.size}</div>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    <button className="p-2 hover:bg-gray-700 rounded-full">
                                      <Download size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-gray-700 rounded-full">
                                      <Share2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-400">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Select an event from the timeline to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Health Metrics View */}
          {view === 'metrics' && (
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {metrics.map(metric => (
                <div key={metric.id} className="bg-gray-900 rounded-xl overflow-hidden shadow-lg p-6">
                  <h3 className="text-lg font-medium mb-3">{metric.name}</h3>
                  <div className="h-40 bg-gray-800 rounded-lg p-3 mb-4">
                    {/* This is a placeholder for a chart - in a real application you would use Recharts or similar */}
                    <div className="flex items-end justify-around h-28">
                      {metric.values.map((value, index) => {
                        const height = `${(value.value / Math.max(...metric.values.map(v => v.value))) * 100}%`;
                        const isInRange = !metric.normalRange || (value.value >= metric.normalRange.min && value.value <= metric.normalRange.max);
                        
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className={`w-6 rounded-t-sm ${isInRange ? 'bg-blue-500' : 'bg-red-500'}`} 
                              style={{ height }}
                            ></div>
                            <div className="mt-1 text-xs text-gray-400">
                              {new Date(value.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-gray-400">Current Value</div>
                    <div className="font-medium text-lg">
                      {metric.values[metric.values.length - 1].value} {metric.unit}
                    </div>
                  </div>
                  
                  {metric.normalRange && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <div>Normal Range</div>
                      <div>{metric.normalRange.min} - {metric.normalRange.max} {metric.unit}</div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <button className="w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-lg">
                      View Full History
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg p-6 flex flex-col justify-center items-center text-center">
                <Activity size={40} className="text-blue-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Track a New Metric</h3>
                <p className="text-gray-400 mb-4">Add a new health metric to start tracking your progress</p>
                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg">
                  Add New Metric
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;