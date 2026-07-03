import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Upload, 
  DollarSign, 
  ArrowRight, 
  ClipboardList, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Heart, 
  Share2, 
  MessageSquare, 
  Send,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  category: string;
  reward: number;
  description: string;
  instructions: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  location: string;
  image: string;
  images?: string[];
  sellerName: string;
  sellerRating: number;
  datePosted: string;
}

interface GigsProps {
  onAddEarnings: (amount: number) => void;
  onAddTransaction: (type: 'deposit' | 'earning' | 'withdrawal', amount: number, desc: string) => void;
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

export default function Gigs({ onAddEarnings, onAddTransaction }: GigsProps) {
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedGigs, setCompletedGigs] = useState<Record<string, boolean>>({});
  
  // Facebook Marketplace inspired filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentLocation, setCurrentLocation] = useState('Johannesburg, GP');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState<number>(30); // in km
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Custom message state in the detail view
  const [chatMessage, setChatMessage] = useState('Hi, is this gig still available for submission?');
  const [hasSentChat, setHasSentChat] = useState(false);
  const [savedGigs, setSavedGigs] = useState<Record<string, boolean>>({});
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Dynamic South African cities for the location filter
  const saCities = Object.keys(CITY_COORDS);

  const categories = [
    'All', 
    'Video Creation', 
    'Social Share', 
    'App Feedback', 
    'Micro-Task',
    'Flyers & Promos',
    'Surveys',
    'Deliveries',
    'Helper & Handyman',
    'Mystery Shopping',
    'Translation'
  ];

  const [gigsList, setGigsList] = useState<Gig[]>([
    {
      id: 'gig-1',
      title: 'TikTok App Review Video',
      category: 'Video Creation',
      reward: 150,
      description: 'Create a short 15-second TikTok video explaining how you earn rewards using our bubble app.',
      instructions: [
        'Record a dynamic video showcasing the 4 reward bubbles.',
        'Explain how to top up R10 and get 20 referrals.',
        'Include your referral link in your bio or video description.',
        'Upload a screenshot of your published video as proof.'
      ],
      difficulty: 'Medium',
      location: 'Sandton, GP',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
      sellerName: 'Media Agency SA',
      sellerRating: 4.8,
      datePosted: '2 hours ago'
    },
    {
      id: 'gig-2',
      title: 'WhatsApp Status Promotion',
      category: 'Social Share',
      reward: 50,
      description: 'Share our official reward banner on your WhatsApp status and keep it active for 24 hours.',
      instructions: [
        'Download the official promo banner from our assets page.',
        'Post it on your status with text: "Earn R100 to R400 daily. Ask me how!"',
        'Leave it active for at least 20 hours.',
        'Take a screenshot showing at least 15 views and upload it here.'
      ],
      difficulty: 'Easy',
      location: 'Johannesburg, GP',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
      sellerName: 'Bubble Promos Ltd',
      sellerRating: 4.9,
      datePosted: '5 hours ago'
    },
    {
      id: 'gig-3',
      title: 'Trustpilot & PlayStore Review',
      category: 'App Feedback',
      reward: 30,
      description: 'Provide an honest 5-star rating and written review on our app listing.',
      instructions: [
        'Search for our app listing on the store or Trustpilot.',
        'Leave a positive review of at least 2 sentences detailing your experience.',
        'Take a clear screenshot showing your username and review.',
        'Upload the screenshot here for automatic confirmation.'
      ],
      difficulty: 'Easy',
      location: 'Pretoria, GP',
      image: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=500&auto=format&fit=crop&q=60',
      sellerName: 'Tech Verifications',
      sellerRating: 4.7,
      datePosted: '1 day ago'
    },
    {
      id: 'gig-4',
      title: 'Facebook Group Recommendation',
      category: 'Social Share',
      reward: 40,
      description: 'Recommend our app in any active South African side-hustle or earnings group.',
      instructions: [
        'Find a local group with 5000+ members about earning extra cash.',
        'Write an engaging post: "Just found this reward app where you can unlock R100-R400 easily by topping up R10 & sharing with friends!"',
        'Paste your unique referral link.',
        'Submit the direct link or a screenshot of your post.'
      ],
      difficulty: 'Easy',
      location: 'Soweto, GP',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60',
      sellerName: 'SA Side-Hustlers',
      sellerRating: 4.6,
      datePosted: '2 days ago'
    },
    {
      id: 'gig-5',
      title: 'Full YouTube Shorts Tutorial',
      category: 'Video Creation',
      reward: 200,
      description: 'Record a high-quality vertical video tutorial showcasing your Cwallet cashout.',
      instructions: [
        'Open the Cwallet screen and demonstrate a withdrawal or top-up.',
        'Explain step-by-step how user payments are verified instantly.',
        'Post as YouTube Shorts with tags: #SideHustleSA #Cwallet #BubbleRewards',
        'Upload proof of the short with at least 50 views.'
      ],
      difficulty: 'Hard',
      location: 'Cape Town, WC',
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&auto=format&fit=crop&q=60',
      sellerName: 'Video Pioneers',
      sellerRating: 5.0,
      datePosted: 'Just now'
    },
    {
      id: 'gig-6',
      title: 'Distribute Flyers at Sandton City',
      category: 'Flyers & Promos',
      reward: 250,
      description: 'Distribute local brand promotional fliers to pedestrians outside Sandton City Mall entrance.',
      instructions: [
        'Pick up 200 fliers from our Sandton agency office.',
        'Hand them out politely to passersby over a 2-hour shift.',
        'Upload a selfie at the Sandton City entrance holding the fliers as proof.',
        'A short video of distribution is highly recommended.'
      ],
      difficulty: 'Medium',
      location: 'Sandton, GP',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60',
      sellerName: 'BrandVibe South Africa',
      sellerRating: 4.8,
      datePosted: '3 hours ago'
    },
    {
      id: 'gig-7',
      title: 'Youth Employment Opinion Survey',
      category: 'Surveys',
      reward: 30,
      description: 'Complete our comprehensive academic research survey on youth employment challenges in Gauteng.',
      instructions: [
        'Click the external survey portal link.',
        'Provide detailed, honest answers to all 25 multiple-choice questions.',
        'Take a screenshot of the "Survey Completed Successfully" page.',
        'Submit the screenshot here to receive immediate Cwallet credit.'
      ],
      difficulty: 'Easy',
      location: 'Johannesburg, GP',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60',
      sellerName: 'Wits Research Hub',
      sellerRating: 4.9,
      datePosted: '4 hours ago'
    },
    {
      id: 'gig-8',
      title: 'Courier Small Document to Rosebank',
      category: 'Deliveries',
      reward: 120,
      description: 'Safely transport a small sealed envelope with business contracts from Soweto to Rosebank.',
      instructions: [
        'Collect envelope from address provided in chat.',
        'Deliver immediately via public transit or private scooter to Rosebank office.',
        'Get the receiver to sign the delivery receipt.',
        'Take a photo of the signed receipt and upload it.'
      ],
      difficulty: 'Medium',
      location: 'Soweto, GP',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
      sellerName: 'Lindiwe Law Chambers',
      sellerRating: 5.0,
      datePosted: '1 day ago'
    },
    {
      id: 'gig-9',
      title: 'Help Assemble Office Desks',
      category: 'Helper & Handyman',
      reward: 250,
      description: 'Need a handy helper to assist with assembling 3 IKEA-style office desks in Umhlanga.',
      instructions: [
        'Report to the office park in Umhlanga at 9:00 AM.',
        'Help unbox and assemble the desks using provided tools.',
        'Dispose of cardboard boxes in the recycling bin.',
        'Upload a picture of the fully assembled desks as proof.'
      ],
      difficulty: 'Medium',
      location: 'Umhlanga, KZN',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60',
      sellerName: 'TechSpace Durban',
      sellerRating: 4.7,
      datePosted: '2 days ago'
    },
    {
      id: 'gig-10',
      title: 'Supermarket Service Quality Audit',
      category: 'Mystery Shopping',
      reward: 180,
      description: 'Visit the designated grocery store in Cape Town to audit cashier friendliness and checkout cleanliness.',
      instructions: [
        'Enter the grocery store pretending to buy a simple item.',
        'Observe checkout queue times and customer service quality.',
        'Fill out the brief 5-question mystery shopper evaluation form.',
        'Upload your store purchase receipt and completed form.'
      ],
      difficulty: 'Medium',
      location: 'Cape Town, WC',
      image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&auto=format&fit=crop&q=60',
      sellerName: 'Market Insights SA',
      sellerRating: 4.9,
      datePosted: 'Just now'
    },
    {
      id: 'gig-11',
      title: 'Translate Marketing Flier to isiZulu',
      category: 'Translation',
      reward: 150,
      description: 'Accurately translate a 200-word promotional flyer script from English into native isiZulu.',
      instructions: [
        'Download the English text file from our link.',
        'Translate it with correct local grammatical syntax and natural phrasing.',
        'Submit a clean text or word file with your Zulu translation.',
        'Wait for our quick linguistic verification.'
      ],
      difficulty: 'Easy',
      location: 'Durban, KZN',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60',
      sellerName: 'KZN Media Group',
      sellerRating: 5.0,
      datePosted: '5 hours ago'
    }
  ]);

  // Form states for creating a new Gig listing
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Video Creation');
  const [newReward, setNewReward] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('Johannesburg, GP');
  const [newInstruction1, setNewInstruction1] = useState('');
  const [newInstruction2, setNewInstruction2] = useState('');

  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newReward || !newDesc) return;

    // Map a random default image based on category
    let categoryImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60';
    if (newCategory === 'Video Creation') {
      categoryImage = 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'Social Share') {
      categoryImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'App Feedback') {
      categoryImage = 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'Flyers & Promos') {
      categoryImage = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'Surveys') {
      categoryImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'Deliveries') {
      categoryImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'Helper & Handyman') {
      categoryImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'Mystery Shopping') {
      categoryImage = 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&auto=format&fit=crop&q=60';
    } else if (newCategory === 'Translation') {
      categoryImage = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60';
    }

    const finalImage = newImages.length > 0 ? newImages[0] : categoryImage;
    const finalImagesList = newImages.length > 0 ? newImages : [categoryImage];

    const createdGig: Gig = {
      id: `gig-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      reward: Number(newReward),
      description: newDesc,
      instructions: [
        newInstruction1 || 'Follow the basic instructions provided in the description.',
        newInstruction2 || 'Submit proof using screenshots of finished tasks.'
      ],
      difficulty: Number(newReward) > 100 ? 'Hard' : Number(newReward) > 50 ? 'Medium' : 'Easy',
      location: newLocation,
      image: finalImage,
      images: finalImagesList,
      sellerName: 'Independent Seeker',
      sellerRating: 5.0,
      datePosted: 'Just now'
    };

    setGigsList([createdGig, ...gigsList]);
    setShowPostModal(false);

    // Reset fields
    setNewTitle('');
    setNewReward('');
    setNewDesc('');
    setNewInstruction1('');
    setNewInstruction2('');
    setNewImages([]);

    alert(`🎉 Success! Your gig listing "${createdGig.title}" has been published to the Marketplace feed.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file: any) => {
        if (file.type && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setNewImages(prev => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      filesArray.forEach((file: any) => {
        if (file.type && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setNewImages(prev => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeNewImage = (idxToRemove: number) => {
    setNewImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile || !selectedGig) return;

    setIsSubmitted(true);
    setTimeout(() => {
      // Complete gig and credit user wallet
      setCompletedGigs(prev => ({ ...prev, [selectedGig.id]: true }));
      onAddEarnings(selectedGig.reward);
      onAddTransaction('earning', selectedGig.reward, `Completed: ${selectedGig.title}`);
      
      // Reset state
      setIsSubmitted(false);
      setProofFile(null);
      setSelectedGig(null);
      
      alert(`🎉 Congratulations! Your proof submission has been verified. R${selectedGig.reward} has been successfully added to your Cwallet!`);
    }, 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage) return;
    setHasSentChat(true);
    setTimeout(() => {
      setHasSentChat(false);
      setChatMessage('Hi, is this gig still available for submission?');
      alert(`📩 Message sent to "${selectedGig?.sellerName}"! You'll receive updates in your notifications.`);
    }, 1200);
  };

  const toggleSaveGig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedGigs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter listings based on search query, category, and location selection
  const filteredGigs = gigsList.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          gig.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
    
    // Facebook Marketplace Location + Radius + Province matching
    let matchesLocation = true;
    
    if (selectedProvince !== 'All') {
      const gigProv = gig.location.split(',')[1]?.trim() || '';
      if (gigProv !== selectedProvince) {
        matchesLocation = false;
      }
    }
    
    if (matchesLocation && currentLocation !== 'All South Africa') {
      const originCoords = CITY_COORDS[currentLocation];
      const destCoords = CITY_COORDS[gig.location] || CITY_COORDS[`${gig.location.split(',')[0].trim()}, ${selectedProvince !== 'All' ? selectedProvince : 'GP'}`];
      
      if (originCoords && destCoords) {
        const dist = getDistanceInKm(originCoords.lat, originCoords.lon, destCoords.lat, destCoords.lon);
        if (dist > selectedRadius) {
          matchesLocation = false;
        }
      } else {
        const cityOnly = currentLocation.split(',')[0].trim();
        if (!gig.location.toLowerCase().includes(cityOnly.toLowerCase())) {
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
              <span>Marketplace Gigs</span>
              <span className="text-blue-600 bg-blue-50 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">LOCAL FEED</span>
            </h2>
            
            {/* Clickable Location Selector */}
            <button 
              onClick={() => setShowLocationModal(true)}
              className="text-xs text-stone-500 hover:text-blue-600 font-semibold flex items-center gap-1 mt-1 transition-colors"
            >
              <MapPin size={13} className="text-red-500 fill-red-100" />
              <span>
                {currentLocation === 'All South Africa' 
                  ? 'All South Africa' 
                  : `${currentLocation}${selectedProvince !== 'All' ? ` (${selectedProvince})` : ''} • Within ${selectedRadius} km`}
              </span>
              <span className="text-[10px] text-blue-600 underline ml-1 font-bold">Change</span>
            </button>
          </div>

          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} /> Sell / Post Gig
          </button>
        </div>

        {/* Unified Search Input */}
        <div className="relative mb-3">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-stone-400">
            <Search size={16} />
          </span>
          <input 
            type="text"
            placeholder="Search gigs, tasks, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
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
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Marketplace Grid */}
      {filteredGigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-150 p-6 flex flex-col items-center">
          <AlertCircle className="text-stone-300 w-12 h-12 mb-2" />
          <p className="text-sm font-bold text-stone-600">No matching gigs found nearby.</p>
          <p className="text-xs text-stone-400 mt-1 mb-4">Try widening your search radius or selection area.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setCurrentLocation('Johannesburg, GP'); }} 
            className="text-xs text-blue-600 font-extrabold hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-6">
          {filteredGigs.map((gig) => {
            const isDone = completedGigs[gig.id];
            const isSaved = savedGigs[gig.id];
            return (
              <div 
                key={gig.id} 
                onClick={() => { setSelectedGig(gig); setActiveImageIdx(0); }}
                className="bg-white rounded-xl border border-stone-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer relative"
              >
                {/* Save Heart Button Overlay */}
                <button
                  onClick={(e) => toggleSaveGig(gig.id, e)}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors shadow-sm"
                >
                  <Heart size={15} className={isSaved ? 'fill-red-500 text-red-500' : ''} />
                </button>

                {/* Listing Image */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 relative">
                  <img 
                    src={gig.image} 
                    alt={gig.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {isDone && (
                    <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex items-center justify-center p-2 text-center">
                      <span className="flex items-center gap-1.5 text-[11px] text-white font-extrabold bg-emerald-600/90 px-3 py-1.5 rounded-full border border-emerald-400">
                        <CheckCircle size={13} /> Payout Done
                      </span>
                    </div>
                  )}

                  <span className={`absolute bottom-2 left-2 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide text-white ${
                    gig.difficulty === 'Easy' ? 'bg-emerald-600' :
                    gig.difficulty === 'Medium' ? 'bg-amber-600' :
                    'bg-rose-600'
                  }`}>
                    {gig.difficulty}
                  </span>
                </div>

                {/* Content Block */}
                <div className="p-3 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Price Payout */}
                    <div className="text-[15px] font-black text-stone-900 flex items-center leading-none">
                      <span>R{gig.reward}</span>
                      <span className="text-[9px] text-stone-400 font-bold ml-1.5 uppercase tracking-wide">Reward</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-semibold text-stone-800 text-[13px] leading-snug mt-1.5 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {gig.title}
                    </h3>
                  </div>

                  {/* Metadata */}
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                    <span>{gig.location}</span>
                    <span>{gig.datePosted}</span>
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
              <X size={16} />
            </button>

            <h3 className="text-base font-black text-stone-900 mb-1 flex items-center gap-1.5">
              <MapPin className="text-red-500 fill-red-100" size={18} />
              <span>Location & Proximity</span>
            </h3>
            <p className="text-xs text-stone-400 mb-4">Set your province and search radius to find local gig opportunities nearby.</p>
            
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
                          ? 'bg-blue-600 text-white shadow-sm'
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
                    <span className="font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-[11px]">
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
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
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
                              ? 'bg-blue-50 text-blue-700' 
                              : 'hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className={currentLocation === city ? 'text-blue-600' : 'text-stone-400'} />
                            {city}
                          </span>
                          {currentLocation === city && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.5 rounded-full">Selected</span>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-black shadow-lg transition-colors"
                >
                  Apply Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LISTING MODAL (Sell / Post Gig feature) */}
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
              <Sparkles className="text-blue-600 w-5 h-5" />
              <h3 className="text-lg font-black text-stone-900">List a New Gig</h3>
            </div>

            <form onSubmit={handleCreateGig} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">GIG TITLE *</label>
                <input 
                  type="text" 
                  required 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Rate our local App on Play Store"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">CATEGORY</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs text-stone-800"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">PAYOUT REWARD (ZAR R) *</label>
                  <input 
                    type="number" 
                    required 
                    min="10"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">LOCATION HUB</label>
                  <select 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs text-stone-800"
                  >
                    {saCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold">DIFFICULTY</label>
                  <input 
                    type="text" 
                    disabled 
                    value={Number(newReward) > 100 ? 'Hard (Auto)' : Number(newReward) > 50 ? 'Medium (Auto)' : 'Easy (Auto)'}
                    className="w-full p-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 text-xs font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-700 font-bold block uppercase tracking-wide">Gig Images (Multiple)</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50/40' 
                      : 'border-stone-300 bg-stone-50/50 hover:border-blue-400'
                  }`}
                >
                  <ImageIcon className="w-8 h-8 text-stone-400 mb-1.5" />
                  <p className="text-xs text-stone-600 font-bold text-center">
                    Drag & drop images here or{' '}
                    <label className="text-blue-600 hover:text-blue-700 underline cursor-pointer">
                      browse device
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleMultipleImagesChange}
                        className="hidden" 
                      />
                    </label>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1">Upload multiple device photos (PNG, JPG, WebP)</p>
                </div>

                {newImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2 pt-1">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 group bg-stone-100">
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
                          title="Remove image"
                        >
                          <Trash2 size={11} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-white text-[8px] font-black text-center py-0.5 uppercase tracking-wider">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">BRIEF DESCRIPTION *</label>
                <textarea 
                  required 
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe what the worker must accomplish in simple terms..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs text-stone-800 resize-none"
                />
              </div>

              <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-150">
                <span className="text-[10px] uppercase font-extrabold text-stone-500 block">Task Instructions Steps</span>
                
                <input 
                  type="text" 
                  value={newInstruction1}
                  onChange={(e) => setNewInstruction1(e.target.value)}
                  placeholder="Step 1: e.g. Open our app link and review"
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500 text-xs text-stone-800 mb-2"
                />
                <input 
                  type="text" 
                  value={newInstruction2}
                  onChange={(e) => setNewInstruction2(e.target.value)}
                  placeholder="Step 2: e.g. Take a screenshot of the review and upload here"
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500 text-xs text-stone-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Publish Gig Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FACEBOOK MARKETPLACE STYLE DETAIL / MESSAGE OVERLAY */}
      {selectedGig && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-150 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" />
                <span className="text-xs font-black text-stone-700 uppercase tracking-wide">Marketplace Gig Details</span>
              </div>
              <button 
                onClick={() => { setSelectedGig(null); setProofFile(null); setHasSentChat(false); }}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full bg-stone-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-4 space-y-5 overflow-y-auto">
              
              {/* Product Layout style Split Column or Stack */}
              <div>
                <div className="rounded-xl overflow-hidden border border-stone-150 bg-stone-100 aspect-[16/10] relative">
                  <img 
                    src={selectedGig.images && selectedGig.images.length > 0 ? selectedGig.images[activeImageIdx] : selectedGig.image} 
                    alt={`${selectedGig.title} - Image ${activeImageIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  
                  {/* Carousel navigation buttons */}
                  {selectedGig.images && selectedGig.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIdx(prev => (prev === 0 ? selectedGig.images!.length - 1 : prev - 1));
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-stone-700 hover:text-blue-600 shadow-md active:scale-95 transition-all cursor-pointer z-10"
                        type="button"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIdx(prev => (prev === selectedGig.images!.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-stone-700 hover:text-blue-600 shadow-md active:scale-95 transition-all cursor-pointer z-10"
                        type="button"
                      >
                        <ChevronRight size={16} />
                      </button>
                      
                      {/* Dot Indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
                        {selectedGig.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIdx(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              activeImageIdx === idx ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                            type="button"
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Visual Actions overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button 
                      onClick={(e) => toggleSaveGig(selectedGig.id, e)}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:text-red-500 shadow-sm"
                    >
                      <Heart size={14} className={savedGigs[selectedGig.id] ? 'fill-red-500 text-red-500' : ''} />
                    </button>
                    <button 
                      onClick={() => alert('🔗 Referral link copied! Share with your friends.')}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:text-blue-500 shadow-sm"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Horizontal Thumbnail strip */}
                {selectedGig.images && selectedGig.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 mt-2.5">
                    {selectedGig.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-14 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activeImageIdx === idx ? 'border-blue-600 scale-105' : 'border-stone-200 opacity-75 hover:opacity-100'
                        }`}
                        type="button"
                      >
                        <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Listing Info */}
              <div>
                <h3 className="text-lg font-black text-stone-900 leading-snug">{selectedGig.title}</h3>
                <div className="text-2xl font-black text-blue-600 mt-1 flex items-center gap-1">
                  <span>R{selectedGig.reward}</span>
                  <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Estimated Payout</span>
                </div>
                
                {/* Location + Time */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2 font-semibold">
                  <span>Listed in <span className="text-stone-800 font-bold">{selectedGig.location}</span></span>
                  <span>•</span>
                  <span>Posted {selectedGig.datePosted}</span>
                </div>
              </div>

              <hr className="border-stone-150" />

              {/* Seller / Requester Info Card */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-150 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-inner uppercase">
                    {selectedGig.sellerName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">{selectedGig.sellerName}</h4>
                    <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-0.5 mt-0.5">
                      ★ {selectedGig.sellerRating} Seller Rating
                    </span>
                  </div>
                </div>
                
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-1 rounded-full">
                  Verified Buyer
                </span>
              </div>

              {/* Facebook Quick Message Template Block */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/60">
                <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5 mb-2.5">
                  <MessageSquare size={13} className="text-blue-600" />
                  <span>Send Seeker a Quick Message</span>
                </h4>
                
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input 
                    type="text"
                    required
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-grow p-2.5 bg-white border border-blue-200 focus:border-blue-500 focus:outline-none rounded-lg text-xs font-semibold text-stone-700 shadow-xs"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg active:scale-95 transition-all flex items-center justify-center shadow-md shadow-blue-100"
                  >
                    <Send size={14} />
                  </button>
                </form>
                {hasSentChat && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1.5">✓ Message sent! They typically reply in a few hours.</p>
                )}
              </div>

              {/* Job Description & Core info */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-stone-800 uppercase tracking-wide">Gig Details</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                  {selectedGig.description}
                </p>
              </div>

              {/* Task steps instructions */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-150">
                <h4 className="text-xs font-black text-stone-800 mb-2.5 uppercase tracking-wide flex items-center gap-1.5">
                  <ClipboardList size={14} className="text-stone-500" />
                  <span>Submission Steps:</span>
                </h4>
                
                <ul className="space-y-3">
                  {selectedGig.instructions.map((inst, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-stone-600 leading-relaxed font-semibold">
                      <span className="flex-shrink-0 w-5 h-5 bg-stone-200 text-stone-700 font-extrabold flex items-center justify-center rounded-full text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Proof Submission Portal */}
              <div className="border-t border-stone-150 pt-4">
                {completedGigs[selectedGig.id] ? (
                  <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 text-center">
                    <CheckCircle className="text-emerald-600 mx-auto w-8 h-8 mb-2" />
                    <h5 className="text-xs font-black text-emerald-800">Reward Credited</h5>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">
                      You have successfully submitted proof and been credited R{selectedGig.reward}!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProof} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-700 block uppercase tracking-wide">
                        Submit Completed Work Proof
                      </label>
                      
                      <div className="border border-dashed border-stone-300 hover:border-blue-500 rounded-xl p-3 bg-stone-50/50 transition-all">
                        <label className="flex flex-col items-center justify-center cursor-pointer gap-1.5">
                          <Upload className="w-6 h-6 text-stone-400" />
                          <span className="text-xs font-bold text-stone-600">
                            {proofFile ? proofFile.name : 'Click to select screenshot proof'}
                          </span>
                          <span className="text-[9px] text-stone-400">JPG, PNG or PDF</span>
                          <input 
                            type="file" 
                            accept="image/*,application/pdf" 
                            className="hidden" 
                            required
                            onChange={handleFileChange} 
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitted || !proofFile}
                      className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                        proofFile && !isSubmitted
                          ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isSubmitted ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin"></span>
                          Verifying Proof...
                        </span>
                      ) : (
                        'Submit Verification Proof'
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
