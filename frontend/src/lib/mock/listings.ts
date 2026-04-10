import type { Listing } from '@/types';

const nowIso = new Date().toISOString();

export const demoListings: Listing[] = [
  {
    id: 'demo-listing-1',
    title: 'Sunny 2BR Apartment Near Downtown',
    description:
      'Bright apartment with large windows, renovated kitchen, and quick access to transit, cafes, and grocery stores.',
    propertyType: 'Apartment',
    address: '123 Market Street',
    city: 'Frankfurt',
    state: 'HE',
    zipCode: '60311',
    bedrooms: 2,
    bathrooms: 1.5,
    squareFootage: 920,
    monthlyRent: 1850,
    deposit: 1850,
    amenities: ['Wi-Fi', 'Elevator', 'Washer/Dryer', 'Pet Friendly'],
    status: 'active',
    isFeatured: true,
    virtualTourUrl: '',
    viewsCount: 320,
    createdAt: nowIso,
    updatedAt: nowIso,
    landlord: {
      id: 'demo-landlord-1',
      firstName: 'Elena',
      lastName: 'Hartmann',
      avatarUrl: '',
    },
    images: [
      {
        id: 'demo-image-1',
        url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1280&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=640&q=80',
        position: 0,
        isVirtualTour: false,
      },
    ],
  },
  {
    id: 'demo-listing-2',
    title: 'Modern Studio for Young Professionals',
    description:
      'Compact, modern studio with smart storage and a work-from-home nook. Ideal for commuters.',
    propertyType: 'Studio',
    address: '8 River Lane',
    city: 'Frankfurt',
    state: 'HE',
    zipCode: '60314',
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 480,
    monthlyRent: 1150,
    deposit: 1150,
    amenities: ['Gym', 'Bike Storage', 'Security Entry'],
    status: 'active',
    isFeatured: false,
    virtualTourUrl: '',
    viewsCount: 174,
    createdAt: nowIso,
    updatedAt: nowIso,
    landlord: {
      id: 'demo-landlord-2',
      firstName: 'Jonas',
      lastName: 'Weber',
      avatarUrl: '',
    },
    images: [
      {
        id: 'demo-image-2',
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1280&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=640&q=80',
        position: 0,
        isVirtualTour: false,
      },
    ],
  },
  {
    id: 'demo-listing-3',
    title: 'Family-Friendly 3BR Townhouse',
    description:
      'Quiet neighborhood townhouse with a small backyard, two parking spots, and nearby schools.',
    propertyType: 'Townhouse',
    address: '45 Oak Residences',
    city: 'Offenbach',
    state: 'HE',
    zipCode: '63065',
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1360,
    monthlyRent: 2250,
    deposit: 3000,
    amenities: ['Parking', 'Backyard', 'Dishwasher', 'Storage Room'],
    status: 'active',
    isFeatured: true,
    virtualTourUrl: '',
    viewsCount: 407,
    createdAt: nowIso,
    updatedAt: nowIso,
    landlord: {
      id: 'demo-landlord-3',
      firstName: 'Maya',
      lastName: 'Klein',
      avatarUrl: '',
    },
    images: [
      {
        id: 'demo-image-3',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1280&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=640&q=80',
        position: 0,
        isVirtualTour: false,
      },
    ],
  },
];

