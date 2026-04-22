export type UserRole = 'renter' | 'landlord' | 'mover' | 'admin';

export type ListingStatus = 'active' | 'inactive' | 'suspended';

export type VisitStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export type ViewingType = 'in_person' | 'video_call';

export type MessageType = 'text' | 'image' | 'document' | 'voice';

export type ReportCategory =
  | 'scam_fraud'
  | 'not_available'
  | 'inaccurate_info'
  | 'inappropriate_content'
  | 'landlord_unresponsive'
  | 'other';

export type ReportStatus = 'new' | 'under_review' | 'action_taken' | 'resolved';

export type BookingStatus = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'reviewed';

export type PropertyType = 'apartment' | 'house' | 'condo' | 'townhouse';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
