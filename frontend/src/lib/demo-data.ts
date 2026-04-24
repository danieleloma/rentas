/**
 * Demo / placeholder data shown when the landlord account has no real data yet.
 * All IDs are fixed strings so React Query keys stay stable.
 */

// ── Shared listing stubs ───────────────────────────────────────────────────────

export const DEMO_LISTING_IDS = {
  lekki:    'demo-listing-lekki-01',
  ikeja:    'demo-listing-ikeja-02',
  surulere: 'demo-listing-surulere-03',
};

// ── Dashboard stat counts ──────────────────────────────────────────────────────

export const DEMO_STATS = {
  activeListings:  3,
  pendingVisits:   2,
  newInquiries:    5,
  unreadMessages:  3,
};

// ── Inquiries ──────────────────────────────────────────────────────────────────

export const DEMO_INQUIRIES = [
  {
    id: 'demo-inq-01',
    listingId: DEMO_LISTING_IDS.lekki,
    landlordId: 'demo-landlord',
    name: 'Chukwuemeka Obi',
    email: 'emeka.obi@gmail.com',
    phone: '+2348031234567',
    message:
      'Good day. I am interested in the 3 bedroom flat. Is it still available? I can do an inspection any weekday. Please confirm the rent and if there is service charge.',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5h ago
    listing: { id: DEMO_LISTING_IDS.lekki, title: '3 Bedroom Flat, Lekki Phase 1' },
  },
  {
    id: 'demo-inq-02',
    listingId: DEMO_LISTING_IDS.ikeja,
    landlordId: 'demo-landlord',
    name: 'Aisha Bello',
    email: 'aisha.bello@yahoo.com',
    phone: '+2348097654321',
    message:
      'Hello, I saw your 2 bedroom apartment in Ikeja GRA. Is water supply reliable? Does it have borehole? I am relocating from Abuja and need something ready by end of month.',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    listing: { id: DEMO_LISTING_IDS.ikeja, title: '2 Bedroom Apartment, Ikeja GRA' },
  },
  {
    id: 'demo-inq-03',
    listingId: DEMO_LISTING_IDS.lekki,
    landlordId: 'demo-landlord',
    name: 'Taiwo Adeyemi',
    email: 'taiwo.adeyemi@outlook.com',
    phone: undefined,
    message:
      'Please is the Lekki flat still available? I am a professional with good references. When can I come for inspection? I am very interested and ready to pay immediately.',
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14h ago
    listing: { id: DEMO_LISTING_IDS.lekki, title: '3 Bedroom Flat, Lekki Phase 1' },
  },
  {
    id: 'demo-inq-04',
    listingId: DEMO_LISTING_IDS.surulere,
    landlordId: 'demo-landlord',
    name: 'Ngozi Eze',
    email: 'ngozi.eze@gmail.com',
    phone: '+2348155678900',
    message:
      'Hi, is the self-contained room in Surulere still vacant? I work at the Lagos Island General Hospital and need somewhere close. Does it have a prepaid meter?',
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // 28h ago
    listing: { id: DEMO_LISTING_IDS.surulere, title: 'Self-Contained Room, Surulere' },
  },
  {
    id: 'demo-inq-05',
    listingId: DEMO_LISTING_IDS.ikeja,
    landlordId: 'demo-landlord',
    name: 'Babatunde Olatunji',
    email: 'babs.olatunji@gmail.com',
    phone: '+2347065432109',
    message:
      'Good morning. I am interested in the Ikeja GRA apartment. Can you tell me if the estate has 24-hour security and CCTV? Also is generator included in the rent or separate? Thank you.',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36h ago
    listing: { id: DEMO_LISTING_IDS.ikeja, title: '2 Bedroom Apartment, Ikeja GRA' },
  },
];

// ── Conversations / Messages ────────────────────────────────────────────────────

const LANDLORD_ID = 'demo-landlord';

export const DEMO_CONVERSATIONS = [
  {
    id: 'demo-conv-01',
    listing: {
      id: DEMO_LISTING_IDS.lekki,
      title: '3 Bedroom Flat, Lekki Phase 1',
      images: [],
    },
    participantOne: {
      id: LANDLORD_ID,
      firstName: 'You',
      lastName: '',
      avatarUrl: undefined,
    },
    participantTwo: {
      id: 'demo-renter-01',
      firstName: 'Chukwuemeka',
      lastName: 'Obi',
      avatarUrl: undefined,
    },
    lastMessageAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    messages: [
      {
        content: 'Good day. I am very interested in the 3 bedroom flat. Is it still available?',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        senderId: 'demo-renter-01',
        isRead: true,
      },
      {
        content: 'Yes it is still available! When would you like to come for inspection?',
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        senderId: LANDLORD_ID,
        isRead: true,
      },
      {
        content: 'I can do Thursday or Friday afternoon. Also, is the rent negotiable at all?',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        senderId: 'demo-renter-01',
        isRead: false,
      },
    ],
  },
  {
    id: 'demo-conv-02',
    listing: {
      id: DEMO_LISTING_IDS.ikeja,
      title: '2 Bedroom Apartment, Ikeja GRA',
      images: [],
    },
    participantOne: {
      id: LANDLORD_ID,
      firstName: 'You',
      lastName: '',
      avatarUrl: undefined,
    },
    participantTwo: {
      id: 'demo-renter-02',
      firstName: 'Aisha',
      lastName: 'Bello',
      avatarUrl: undefined,
    },
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        content: 'Hello, I am relocating from Abuja. Is water supply reliable in the estate?',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        senderId: 'demo-renter-02',
        isRead: true,
      },
      {
        content: 'Yes, we have a borehole plus overhead tank so water is 24/7. Light is also fairly stable — estate has shared generator backup.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        senderId: LANDLORD_ID,
        isRead: true,
      },
      {
        content: 'That is great to hear. Can I come see it this Saturday morning?',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        senderId: 'demo-renter-02',
        isRead: false,
      },
    ],
  },
  {
    id: 'demo-conv-03',
    listing: {
      id: DEMO_LISTING_IDS.surulere,
      title: 'Self-Contained Room, Surulere',
      images: [],
    },
    participantOne: {
      id: LANDLORD_ID,
      firstName: 'You',
      lastName: '',
      avatarUrl: undefined,
    },
    participantTwo: {
      id: 'demo-renter-03',
      firstName: 'Ngozi',
      lastName: 'Eze',
      avatarUrl: undefined,
    },
    lastMessageAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        content: 'Hi! Is the self-con in Surulere still available? I work at Lagos Island General Hospital.',
        createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        senderId: 'demo-renter-03',
        isRead: true,
      },
      {
        content: 'Yes still available. It has prepaid meter and the room is newly painted. Landlord is very easy going.',
        createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        senderId: LANDLORD_ID,
        isRead: true,
      },
      {
        content: 'Perfect. Please what documents do you need from me to secure it?',
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        senderId: 'demo-renter-03',
        isRead: true,
      },
    ],
  },
];

// ── Visits ──────────────────────────────────────────────────────────────────────

export const DEMO_VISITS = [
  {
    id: 'demo-visit-01',
    listingId: DEMO_LISTING_IDS.lekki,
    listingTitle: '3 Bedroom Flat, Lekki Phase 1',
    renterName: 'Chukwuemeka Obi',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // in 2 days
    status: 'pending',
    note: 'Will come with wife and brother. Can we do 3pm?',
  },
  {
    id: 'demo-visit-02',
    listingId: DEMO_LISTING_IDS.ikeja,
    listingTitle: '2 Bedroom Apartment, Ikeja GRA',
    renterName: 'Aisha Bello',
    scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // in 4 days
    status: 'pending',
    note: 'Saturday morning preferred — around 10am.',
  },
];
