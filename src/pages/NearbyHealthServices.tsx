import React, { useState } from 'react';
import { Search, MapPin, Phone, Clock, Star, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

// Types
interface HealthService {
  id: string;
  name: string;
  category: 'hospital' | 'clinic' | 'pharmacy' | 'mental-health' | 'specialist';
  address: string;
  distance: number; // in km
  rating: number;
  phone: string;
  hours: string;
  services: string[];
  isOpen: boolean;
}

// Sample data
const sampleHealthServices: HealthService[] = [
  {
    id: '1',
    name: 'City General Hospital',
    category: 'hospital',
    address: '123 Healthcare Avenue, Downtown',
    distance: 2.3,
    rating: 4.5,
    phone: '+1 (555) 123-4567',
    hours: 'Open 24 hours',
    services: ['Emergency Care', 'Surgery', 'Radiology', 'Laboratory'],
    isOpen: true
  },
  {
    id: '2',
    name: 'Wellness Family Clinic',
    category: 'clinic',
    address: '456 Medical Lane, Northside',
    distance: 1.5,
    rating: 4.8,
    phone: '+1 (555) 765-4321',
    hours: '8:00 AM - 6:00 PM',
    services: ['General Medicine', 'Pediatrics', 'Vaccinations', 'Check-ups'],
    isOpen: true
  },
  {
    id: '3',
    name: 'MediQuick Pharmacy',
    category: 'pharmacy',
    address: '789 Health Street, Eastside',
    distance: 0.8,
    rating: 4.3,
    phone: '+1 (555) 987-6543',
    hours: '9:00 AM - 9:00 PM',
    services: ['Prescription Filling', 'Vaccinations', 'Health Products', 'Consultation'],
    isOpen: true
  },
  {
    id: '4',
    name: 'Mind & Wellness Center',
    category: 'mental-health',
    address: '567 Healing Boulevard, Westside',
    distance: 3.1,
    rating: 4.7,
    phone: '+1 (555) 234-5678',
    hours: '9:00 AM - 7:00 PM',
    services: ['Therapy', 'Counseling', 'Psychiatric Care', 'Support Groups'],
    isOpen: false
  },
  {
    id: '5',
    name: 'Specialized Care Center',
    category: 'specialist',
    address: '890 Expert Circle, Southside',
    distance: 4.2,
    rating: 4.6,
    phone: '+1 (555) 345-6789',
    hours: '8:30 AM - 5:30 PM',
    services: ['Cardiology', 'Dermatology', 'Orthopedics', 'Ophthalmology'],
    isOpen: true
  },
  {
    id: '6',
    name: 'Community Health Clinic',
    category: 'clinic',
    address: '234 Public Service Road, Downtown',
    distance: 1.9,
    rating: 4.2,
    phone: '+1 (555) 456-7890',
    hours: '8:00 AM - 8:00 PM',
    services: ['Primary Care', 'Women\'s Health', 'Dental', 'Mental Health'],
    isOpen: true
  }
];

// Categories with icons (you would import actual icons)
const categories = [
  { id: 'all', name: 'All Services' },
  { id: 'hospital', name: 'Hospitals' },
  { id: 'clinic', name: 'Clinics' },
  { id: 'pharmacy', name: 'Pharmacies' },
  { id: 'mental-health', name: 'Mental Health' },
  { id: 'specialist', name: 'Specialists' }
];

const NearbyHealthServices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');

  // Filter services based on search and category
  const filteredServices = sampleHealthServices
    .filter(service => 
      (selectedCategory === 'all' || service.category === selectedCategory) &&
      (service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       service.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance;
      } else {
        return b.rating - a.rating;
      }
    });

  const toggleExpand = (id: string) => {
    setExpandedService(expandedService === id ? null : id);
  };

  // Render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <Star className="absolute top-0 left-0 w-4 h-4 text-yellow-400 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </span>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nearby Health Services</h1>
          <p className="text-gray-400">
            Find healthcare providers near you, from hospitals to specialists
          </p>
        </header>

        {/* Search and Filter Section */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="distance">Nearest</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <p className="text-gray-400">No health services found matching your criteria.</p>
            </div>
          ) : (
            filteredServices.map(service => (
              <div key={service.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                <div 
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-800`}
                  onClick={() => toggleExpand(service.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-semibold mr-2">{service.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          service.isOpen ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {service.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <MapPin size={14} className="mr-1" />
                        <span>{service.address}</span>
                        <span className="mx-2">•</span>
                        <span>{service.distance} km away</span>
                      </div>
                      
                      <div className="flex items-center">
                        {renderStars(service.rating)}
                        <span className="ml-2 text-sm text-gray-400">{service.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <button className="text-gray-400">
                      {expandedService === service.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
                
                {expandedService === service.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="flex items-center text-gray-400 mb-2">
                          <Phone size={14} className="mr-2" />
                          <span>{service.phone}</span>
                        </p>
                        
                        <p className="flex items-center text-gray-400">
                          <Clock size={14} className="mr-2" />
                          <span>{service.hours}</span>
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Services</h4>
                        <ul className="grid grid-cols-2 gap-1">
                          {service.services.map((item, index) => (
                            <li key={index} className="text-sm text-gray-400">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between">
                      <button className="text-blue-400 text-sm flex items-center hover:text-blue-300 transition-colors">
                        Get directions
                        <ExternalLink size={14} className="ml-1" />
                      </button>
                      
                      <button className="text-blue-400 text-sm flex items-center hover:text-blue-300 transition-colors">
                        View more details
                        <ChevronDown size={14} className="ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-900/30 border border-blue-800 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Note:</strong> This feature uses your current location to find healthcare services nearby.
            Please make sure location services are enabled in your browser for accurate results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NearbyHealthServices; 