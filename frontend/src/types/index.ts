export type UserRole = 'renter' | 'landlord' | 'mover' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  propertyType: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms?: number;
  squareFootage?: number;
  monthlyRent: number;
  deposit?: number;
  availableFrom?: string;
  amenities: string[];
  status: string;
  isFeatured: boolean;
  virtualTourUrl?: string;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  images: ListingImage[];
}

export interface ListingImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  position: number;
  isVirtualTour: boolean;
}

export interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    images: ListingImage[];
  };
  participantOne: UserSummary;
  participantTwo: UserSummary;
  lastMessageAt?: string;
  messages: {
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  }[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender: UserSummary;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Visit {
  id: string;
  listing: {
    id: string;
    title: string;
    address: string;
    city: string;
  };
  renter: UserSummary;
  landlord: UserSummary;
  scheduledAt: string;
  endAt?: string;
  viewingType: string;
  status: string;
  note?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  renterId: string;
  overallRating: number;
  neighborhoodRating?: number;
  noiseRating?: number;
  maintenanceRating?: number;
  amenitiesRating?: number;
  comment: string;
  pros: string[];
  cons: string[];
  landlordResponse?: string;
  responseAt?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Mover {
  id: string;
  userId: string;
  companyName: string;
  logoUrl?: string;
  description?: string;
  serviceArea: Record<string, unknown>;
  services: Record<string, unknown>;
  hourlyRate?: number;
  fixedPrice?: number;
  insuranceCoverage?: number;
  isVerified: boolean;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
