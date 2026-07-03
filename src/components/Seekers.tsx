import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Star, 
  MapPin, 
  Send, 
  MessageSquare, 
  Check, 
  Sparkles, 
  Heart,
  Share2,
  X,
  AlertCircle
} from 'lucide-react';

interface SeekerListing {
  id: string;
  name: string;
  roleNeeded: string;
  company?: string;
  location: string;
  rating: number;
  tags: string[];
  budget: string;
  description: string;
  image: string;
  datePosted: string;
}

const PROVINCES = [
  { code: 'All', name: 'All South Africa' },
  { code: 'GP', name: 'Gauteng (GP)' },
  { code: 'WC', name: 'Western Cape (WC)' },
  { code: 'KZN', name: 'KwaZulu-Natal (KZN)' },
  { code: 'EC', name: 'Eastern Cape (EC)' },
  { code: 'FS', name: 'Free State (FS)' },
  { code: 'MP', name: 'Mpumalanga (MP)' },
  { code: 'LP', name: 'Limpopo (LP)' },
  { code: 'NW', name: 'North West (NW)' },
  { code: 'NC', name: 'Northern Cape (NC)' }
];

const CITY_COORDS: Record<string, { lat: number; lon: number; province: string }> = {
  'Johannesburg, GP': { lat: -26.2041, lon: 28.0473, province: 'GP' },
  'Sandton, GP': { lat: -26.1076, lon: 28.0567, province: 'GP' },
  'Pretoria, GP': { lat: -25.7479, lon: 28.2293, province: 'GP' },
  'Soweto, GP': { lat: -26.2485, lon: 27.8540, province: 'GP' },
  'Cape Town, WC': { lat: -33.9249, lon: 18.4241, province: 'WC' },
  'Stellenbosch, WC': { lat: -33.9321, lon: 18.8602, province: 'WC' },
  'Durban, KZN': { lat: -29.8587, lon: 31.0218, province: 'KZN' },
  'Umhlanga, KZN': { lat: -29.7258, lon: 31.0763, province: 'KZN' },
  'Port Elizabeth, EC': { lat: -33.9608, lon: 25.6022, province: 'EC' },
  'East London, EC': { lat: -33.0153, lon: 27.9116, province: 'EC' },
  'Bloemfontein, FS': { lat: -29.1181, lon: 26.2231, province: 'FS' },
  'Nelspruit, MP': { lat: -25.4753, lon: 30.9694, province: 'MP' },
  'Polokwane, LP': { lat: -23.8962, lon: 29.4486, province: 'LP' },
  'Rustenburg, NW': { lat: -25.6544, lon: 27.2425, province: 'NW' },
  'Kimberley, NC': { lat: -28.7282, lon: 24.7499, province: 'NC' }
};

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export default function Seekers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentLocation, setCurrentLocation] = useState('Johannesburg, GP');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState<number>(30); // in km
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [contactingSeeker, setContactingSeeker] = useState<SeekerListing | null>(null);
  const [contactMessage, setContactMessage] = useState('Hi, is this position still vacant? I would love to apply!');
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [savedSeekers, setSavedSeekers] = useState<Record<string, boolean>>({});

  const saCities = Object.keys(CITY_COORDS);

  const categories = [
    'All', 
    'Social Media', 
    'App Testers', 
    'Promoters', 
    'Voice Over',
    'Flyers & Promos',
    'Surveys',
    'Deliveries',
    'Helper & Handyman',
    'Mystery Shopping',
    'Translation'
  ];

  // Initial mock listings with highly relevant Unsplash images
  const [listings, setListings] = useState<SeekerListing[]>([
    {
      id: 'seeker-1',
      name: 'Thabo Ndlovu',
      roleNeeded: 'Social Media Advocate',
      company: 'Apex Media Agency',
      location: 'Sandton, GP',
      rating: 4.9,
      tags: ['TikTok', 'Instagram', 'SA Creators'],
      budget: 'R150 - R500 / task',
      description: 'We are seeking passionate South African brand advocates to post review clips, participate in challenges, and endorse digital utilities. Steady payouts.',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60',
      datePosted: '1 hour ago'
    },
    {
      id: 'seeker-2',
      name: 'Sarah Jenkins',
      roleNeeded: 'Micro-Task Reviewer',
      company: 'Velo Tech Solutions',
      location: 'Cape Town, WC',
      rating: 4.8,
      tags: ['App Testing', 'Feedback', 'Written Review'],
      budget: 'R30 - R100 / review',
      description: 'Looking for prompt, detailed feedback on beta applications and local fintech products. Must have an active Android/iOS device and provide screenshots.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60',
      datePosted: '4 hours ago'
    },
    {
      id: 'seeker-3',
      name: 'Lwazi Dlamini',
      roleNeeded: 'WhatsApp Promoter',
      company: 'SA Side Hustle Hub',
      location: 'Durban, KZN',
      rating: 4.7,
      tags: ['WhatsApp Status', 'Referrals', 'Promos'],
      budget: 'R50 / 24h status',
      description: 'Need active WhatsApp users with 100+ daily status views to share campaign banners and track engagement. Fast payments and bonuses.',
      image: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=500&auto=format&fit=crop&q=60',
      datePosted: '2 days ago'
    },
    {
      id: 'seeker-4',
      name: 'Elena Vass',
      roleNeeded: 'Voice Over Specialist',
      company: 'Lingua Africa',
      location: 'Pretoria, GP',
      rating: 5.0,
      tags: ['Zulu', 'Xhosa', 'Afrikaans', 'Voice'],
      budget: 'R300 - R1,200 / audio',
      description: 'Seeking native Zulu, Xhosa, and Afrikaans speakers to record brief 30-second promotional audio scripts for financial awareness courses.',
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&auto=format&fit=crop&q=60',
      datePosted: '3 days ago'
    },
    {
      id: 'seeker-5',
      name: 'Bongani Khumalo',
      roleNeeded: 'Flyer Distributor in Pretoria',
      company: 'Gauteng Flyers',
      location: 'Pretoria, GP',
      rating: 4.8,
      tags: ['Flyers', 'Promos', 'Activation', 'Distributor'],
      budget: 'R200 / 2-hours',
      description: 'Looking for energetic youth to hand out retail brand leaflets outside grocery stores in Pretoria CBD. High visibility, immediate mobile wallet payout.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60',
      datePosted: '1 hour ago'
    },
    {
      id: 'seeker-6',
      name: 'Zanele Ndlela',
      roleNeeded: 'Opinion Survey Participants',
      company: 'Metro Insights',
      location: 'Johannesburg, GP',
      rating: 4.9,
      tags: ['Survey', 'Questionnaire', 'Opinion'],
      budget: 'R50 / completion',
      description: 'Seeking feedback from local residents regarding transport accessibility in Johannesburg suburbs. Interactive online form takes 10 mins.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60',
      datePosted: '3 hours ago'
    },
    {
      id: 'seeker-7',
      name: 'Michael Smith',
      roleNeeded: 'Courier Deliveries Helper',
      company: 'FastRoute Logistics',
      location: 'Soweto, GP',
      rating: 4.6,
      tags: ['Delivery', 'Courier', 'Transport', 'Driver'],
      budget: 'R150 / delivery',
      description: 'Need assistance delivering light parcels in the Soweto and surrounding neighborhoods. Great for anyone with a motorcycle or bicycle.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
      datePosted: '5 hours ago'
    },
    {
      id: 'seeker-8',
      name: 'Sipho Nkosi',
      roleNeeded: 'Reliable Assembly Handyman',
      company: 'FurniSet Pretoria',
      location: 'Pretoria, GP',
      rating: 4.7,
      tags: ['Handyman', 'Helper', 'Assembly', 'Repairs'],
      budget: 'R350 / project',
      description: 'Seeking a handy assistant to help construct flatpack storage shelves and desks in Pretoria East offices. Tools are provided.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60',
      datePosted: '2 days ago'
    },
    {
      id: 'seeker-9',
      name: 'Claire du Plessis',
      roleNeeded: 'Retail Mystery Audit Agents',
      company: 'Pulse Auditors',
      location: 'Stellenbosch, WC',
      rating: 5.0,
      tags: ['Audit', 'Shopper', 'Mystery', 'Retail'],
      budget: 'R180 / audit',
      description: 'Evaluate customer service and cleanliness in beauty salons around Stellenbosch. Disguise yourself as a normal customer, complete a checklist, and earn.',
      image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&auto=format&fit=crop&q=60',
      datePosted: 'Just now'
    },
    {
      id: 'seeker-10',
      name: 'Lulu Mthembu',
      roleNeeded: 'isiXhosa Transcribers',
      company: 'VocalScript South Africa',
      location: 'Port Elizabeth, EC',
      rating: 4.9,
      tags: ['Translation', 'Transcription', 'Translator', 'Xhosa'],
      budget: 'R250 / audio-hour',
      description: 'Convert isiXhosa audio focus group discussions into clean written Microsoft Word documentation. Accurate spelling is highly prioritized.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60',
      datePosted: '1 day ago'
    }
  ]);

  // Form states for creating a new listing
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('Johannesburg, GP');
  const [formBudget, setFormBudget] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRole || !formBudget || !formDesc) return;

    // Map a random default image based on tags or category
    let categoryImage = 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=500&auto=format&fit=crop&q=60';
    if (formRole.toLowerCase().includes('voice') || formRole.toLowerCase().includes('audio')) {
      categoryImage = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&auto=format&fit=crop&q=60';
    } else if (formRole.toLowerCase().includes('whatsapp') || formRole.toLowerCase().includes('promo')) {
      categoryImage = 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=500&auto=format&fit=crop&q=60';
    } else if (formRole.toLowerCase().includes('video') || formRole.toLowerCase().includes('tiktok')) {
      categoryImage = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60';
    }

    const newListing: SeekerListing = {
      id: `seeker-${Date.now()}`,
      name: formName,
      roleNeeded: formRole,
      company: formCompany || undefined,
      location: formLocation,
      rating: 5.0,
      tags: formTags ? formTags.split(',').map(t => t.trim()) : ['General', 'Freelance'],
      budget: formBudget,
      description: formDesc,
      image: categoryImage,
      datePosted: 'Just now'
    };

    setListings([newListing, ...listings]);
    setShowPostModal(false);

    // Reset fields
    setFormName('');
    setFormRole('');
    setFormCompany('');
    setFormBudget('');
    setFormTags('');
    setFormDesc('');

    alert(`🎉 Published successfully! Your hiring advertisement "${newListing.roleNeeded}" is now visible to all candidate profiles.`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage) return;

    setHasSentMessage(true);
    setTimeout(() => {
      setHasSentMessage(false);
      setContactMessage('Hi, is this position still vacant? I would love to apply!');
      setContactingSeeker(null);
      alert('📩 Application proposal sent! The Seeker recruiter will reach out via the communication center.');
    }, 1500);
  };

  const toggleSaveSeeker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSeekers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredListings = listings.filter(list => {
    const matchesSearch = list.roleNeeded.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (list.company && list.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          list.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Facebook Marketplace Style Category Matching across simple casual job tags
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      if (catLower === 'social media') {
        matchesCategory = list.tags.some(t => ['tiktok', 'instagram', 'facebook', 'creators', 'social'].includes(t.toLowerCase()));
      } else if (catLower === 'app testers') {
        matchesCategory = list.tags.some(t => ['app testing', 'feedback', 'written review', 'testing', 'beta'].includes(t.toLowerCase()));
      } else if (catLower === 'promoters') {
        matchesCategory = list.tags.some(t => ['whatsapp status', 'referrals', 'promos', 'promoter'].includes(t.toLowerCase()));
      } else if (catLower === 'voice over') {
        matchesCategory = list.tags.some(t => ['zulu', 'xhosa', 'afrikaans', 'voice', 'audio'].includes(t.toLowerCase()));
      } else if (catLower === 'flyers & promos') {
        matchesCategory = list.tags.some(t => ['flyers', 'promos', 'activation', 'distributor'].includes(t.toLowerCase()));
      } else if (catLower === 'surveys') {
        matchesCategory = list.tags.some(t => ['survey', 'questionnaire', 'opinion'].includes(t.toLowerCase()));
      } else if (catLower === 'deliveries') {
        matchesCategory = list.tags.some(t => ['delivery', 'courier', 'transport', 'driver'].includes(t.toLowerCase()));
      } else if (catLower === 'helper & handyman') {
        matchesCategory = list.tags.some(t => ['handyman', 'helper', 'assembly', 'repairs'].includes(t.toLowerCase()));
      } else if (catLower === 'mystery shopping') {
        matchesCategory = list.tags.some(t => ['audit', 'shopper', 'mystery', 'retail'].includes(t.toLowerCase()));
      } else if (catLower === 'translation') {
        matchesCategory = list.tags.some(t => ['translation', 'transcription', 'translator', 'zulu', 'xhosa', 'afrikaans'].includes(t.toLowerCase()));
      }
    }

    // Facebook Marketplace Location + Radius + Province matching
    let matchesLocation = true;
    
    if (selectedProvince !== 'All') {
      const listProv = list.location.split(',')[1]?.trim() || '';
      if (listProv !== selectedProvince) {
        matchesLocation = false;
      }
    }
    
    if (matchesLocation && currentLocation !== 'All South Africa') {
      const originCoords = CITY_COORDS[currentLocation];
      const destCoords = CITY_COORDS[list.location] || CITY_COORDS[`${list.location.split(',')[0].trim()}, ${selectedProvince !== 'All' ? selectedProvince : 'GP'}`];
      
      if (originCoords && destCoords) {
        const dist = getDistanceInKm(originCoords.lat, originCoords.lon, destCoords.lat, destCoords.lon);
        if (dist > selectedRadius) {
          matchesLocation = false;
        }
      } else {
        const cityOnly = currentLocation.split(',')[0].trim();
        if (!list.location.toLowerCase().includes(cityOnly.toLowerCase())) {
          matchesLocation = false;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] overflow-y-auto px-1 py-1 bg-stone-50">
      
      {/* Facebook Marketplace Style Header Block */}
      <div className="bg-white border border-stone-150 rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>Marketplace Seekers</span>
              <span className="text-emerald-600 bg-emerald-50 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">HIRING NOW</span>
            </h2>
            
            {/* Clickable Location Selector */}
            <button 
              onClick={() => setShowLocationModal(true)}
              className="text-xs text-stone-500 hover:text-emerald-600 font-semibold flex items-center gap-1 mt-1 transition-colors"
            >
              <MapPin size={13} className="text-red-500 fill-red-100" />
              <span>
                {currentLocation === 'All South Africa' 
                  ? 'All South Africa' 
                  : `${currentLocation}${selectedProvince !== 'All' ? ` (${selectedProvince})` : ''} • Within ${selectedRadius} km`}
              </span>
              <span className="text-[10px] text-emerald-600 underline ml-1 font-bold">Change</span>
            </button>
          </div>

          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} /> Post Job
          </button>
        </div>

        {/* Unified Search Input */}
        <div className="relative mb-3">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-stone-400">
            <Search size={16} />
          </span>
          <input 
            type="text"
            placeholder="Search roles, recruiters, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Seeker Marketplace Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-150 p-6 flex flex-col items-center">
          <AlertCircle className="text-stone-300 w-12 h-12 mb-2" />
          <p className="text-sm font-bold text-stone-600">No recruiters found nearby.</p>
          <p className="text-xs text-stone-400 mt-1 mb-4">Try widening your search area or selection category.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setCurrentLocation('All South Africa'); }} 
            className="text-xs text-emerald-600 font-extrabold hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-6">
          {filteredListings.map((list) => {
            const isSaved = savedSeekers[list.id];
            return (
              <div 
                key={list.id} 
                onClick={() => setContactingSeeker(list)}
                className="bg-white rounded-xl border border-stone-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer relative"
              >
                {/* Save Heart Button Overlay */}
                <button
                  onClick={(e) => toggleSaveSeeker(list.id, e)}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors shadow-sm"
                >
                  <Heart size={15} className={isSaved ? 'fill-red-500 text-red-500' : ''} />
                </button>

                {/* Listing Image */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 relative">
                  <img 
                    src={list.image} 
                    alt={list.roleNeeded}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-black shadow-sm">
                    <Star size={10} className="fill-white stroke-none" />
                    <span>{list.rating}</span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-3 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Price/Budget */}
                    <div className="text-[13.5px] font-black text-emerald-700 flex items-center leading-none">
                      <span>{list.budget.split('/')[0]}</span>
                    </div>
                    
                    {/* Role Title */}
                    <h3 className="font-semibold text-stone-800 text-[13px] leading-snug mt-1.5 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {list.roleNeeded}
                    </h3>
                    
                    {/* Requester Name */}
                    <p className="text-[11px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                      By {list.name} {list.company ? `(${list.company})` : ''}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                    <span>{list.location}</span>
                    <span>{list.datePosted}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Location Filter Picker Modal (Facebook Marketplace Style) */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowLocationModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-full bg-stone-50"
            >
              <XIcon size={16} />
            </button>

            <h3 className="text-base font-black text-stone-900 mb-1 flex items-center gap-1.5">
              <MapPin className="text-red-500 fill-red-100" size={18} />
              <span>Location & Proximity</span>
            </h3>
            <p className="text-xs text-stone-400 mb-4">Set your province and search radius to find local hiring recruiters nearby.</p>
            
            <div className="space-y-4">
              {/* 1. SELECT PROVINCE */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                  Step 1: Select Province
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PROVINCES.map((prov) => (
                    <button
                      key={prov.code}
                      type="button"
                      onClick={() => {
                        setSelectedProvince(prov.code);
                        if (prov.code === 'All') {
                          setCurrentLocation('All South Africa');
                        } else {
                          // Default to the first city of this province in CITY_COORDS
                          const firstCity = Object.keys(CITY_COORDS).find(
                            (c) => CITY_COORDS[c].province === prov.code
                          );
                          if (firstCity) setCurrentLocation(firstCity);
                        }
                      }}
                      className={`text-xs p-2 rounded-xl text-left font-bold transition-all ${
                        selectedProvince === prov.code
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      {prov.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. ADJUST SEARCH RADIUS */}
              {currentLocation !== 'All South Africa' && (
                <div className="space-y-1.5 p-3 bg-stone-50 rounded-2xl border border-stone-150">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-stone-500 text-[10px]">
                      Step 2: Search Radius
                    </span>
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-[11px]">
                      Within {selectedRadius} km
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                  />
                  
                  <div className="flex justify-between text-[9px] text-stone-400 font-bold px-0.5 mt-1">
                    <span>5 km</span>
                    <span>30 km</span>
                    <span>75 km</span>
                    <span>150 km+</span>
                  </div>
                </div>
              )}

              {/* 3. SELECT LOCAL CITY/SUBURB */}
              {selectedProvince !== 'All' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    Step 3: Select Nearby City / Hub
                  </label>
                  <div className="space-y-1 max-h-[160px] overflow-y-auto border border-stone-200 rounded-xl p-1 bg-white">
                    {saCities
                      .filter((city) => CITY_COORDS[city].province === selectedProvince)
                      .map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setCurrentLocation(city)}
                          className={`w-full text-left p-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                            currentLocation === city 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className={currentLocation === city ? 'text-emerald-600' : 'text-stone-400'} />
                            {city}
                          </span>
                          {currentLocation === city && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-full">Selected</span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLocation('All South Africa');
                    setSelectedProvince('All');
                    setSelectedRadius(30);
                    setShowLocationModal(false);
                  }}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl text-xs font-black transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black shadow-lg transition-colors"
                >
                  Apply Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LISTING MODAL (Hire Talent / Post Job feature) */}
      {showPostModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPostModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full bg-stone-50 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-emerald-600 w-5 h-5" />
              <h3 className="text-lg font-black text-stone-900">Post Seeker Listing</h3>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">YOUR NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Lindiwe Zulu"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">ROLE NEEDED *</label>
                  <input 
                    type="text" 
                    required 
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. WhatsApp Status Promoter"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">COMPANY (OPTIONAL)</label>
                  <input 
                    type="text" 
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. SA Promo agency"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-stone-800"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">BUDGET RANGE *</label>
                  <input 
                    type="text" 
                    required 
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g. R50 - R200 / Task"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">LOCATION</label>
                  <select 
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-stone-800"
                  >
                    {saCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">SEARCH TAGS</label>
                  <input 
                    type="text" 
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. WhatsApp, Video, SA"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">DESCRIPTION *</label>
                <textarea 
                  required 
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Clearly outline the work parameters, expectations and how they can submit completion screenshots..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-stone-800 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Publish Seeker Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FACEBOOK MARKETPLACE STYLE DETAIL / MESSAGE OVERLAY */}
      {contactingSeeker && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-150 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                <span className="text-xs font-black text-stone-700 uppercase tracking-wide">Recruiter Profile & Job</span>
              </div>
              <button 
                onClick={() => { setContactingSeeker(null); setHasSentMessage(false); }}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full bg-stone-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-4 space-y-5 overflow-y-auto">
              
              {/* Product Visual Layout */}
              <div className="rounded-xl overflow-hidden border border-stone-150 bg-stone-100 aspect-[16/10] relative">
                <img 
                  src={contactingSeeker.image} 
                  alt={contactingSeeker.roleNeeded}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Visual Actions overlay */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  <button 
                    onClick={(e) => toggleSaveSeeker(contactingSeeker.id, e)}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:text-red-500 shadow-sm"
                  >
                    <Heart size={14} className={savedSeekers[contactingSeeker.id] ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                  <button 
                    onClick={() => alert('🔗 Share link copied! Spread the opportunity.')}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:text-emerald-500 shadow-sm"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Primary Listing Info */}
              <div>
                <span className="text-[9px] font-black bg-stone-100 border border-stone-200 text-stone-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  #{contactingSeeker.tags[0]}
                </span>
                
                <h3 className="text-lg font-black text-stone-900 leading-snug mt-2">{contactingSeeker.roleNeeded}</h3>
                <div className="text-xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                  <span>{contactingSeeker.budget}</span>
                </div>
                
                {/* Location + Time */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2 font-semibold">
                  <span>Located in <span className="text-stone-800 font-bold">{contactingSeeker.location}</span></span>
                  <span>•</span>
                  <span>Posted {contactingSeeker.datePosted}</span>
                </div>
              </div>

              <hr className="border-stone-150" />

              {/* Recruiter Rating Info Card */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-150 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm shadow-inner uppercase">
                    {contactingSeeker.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">{contactingSeeker.name}</h4>
                    <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-0.5">
                      ★ {contactingSeeker.rating} Rating • Verified Recruiter
                    </p>
                  </div>
                </div>
                
                {contactingSeeker.company && (
                  <span className="text-[10px] font-bold text-stone-500">
                    🏢 {contactingSeeker.company}
                  </span>
                )}
              </div>

              {/* Facebook Quick Message Template Block */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60">
                <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 mb-2.5">
                  <MessageSquare size={13} className="text-emerald-600" />
                  <span>Send Recruiter a Quick Pitch / Proposal</span>
                </h4>
                
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <textarea 
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-200 focus:border-emerald-500 focus:outline-none rounded-lg text-xs font-semibold text-stone-700 shadow-xs resize-none"
                    placeholder="Describe your followers or experience briefly..."
                  />
                  <button 
                    type="submit"
                    disabled={hasSentMessage}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 text-xs font-black shadow-md shadow-emerald-100"
                  >
                    {hasSentMessage ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-emerald-700 rounded-full animate-spin"></span>
                        Sending Application...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Apply & Send Proposal
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Job Description & Core info */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-stone-800 uppercase tracking-wide">Work Scope & Specifications</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                  {contactingSeeker.description}
                </p>
              </div>

              {/* Search Tags Pill List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-extrabold text-stone-400 block">Listing Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {contactingSeeker.tags.map((tag, idx) => (
                    <span key={idx} className="bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function XIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
