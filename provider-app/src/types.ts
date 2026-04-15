export interface ProviderProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  basicPayment?: number;
  city?: string;
  address?: string;
  pincode?: string;
  role: string;
  profile_completed?: boolean;
  isServiceProvider?: boolean;
  serviceProviderStatus?: string;
}

export interface ProviderApplication {
  id: string | null;
  status: string;
  serviceType: string;
  experienceYears: number;
  aadhaarSubmitted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  displayName: string;
  city: string;
  providerId: string | null;
  canResubmit: boolean;
}

export interface ProviderAvailability {
  providerId: string | null;
  isOnline: boolean;
  lastUpdated: string | null;
  location: {
    type: 'Point';
    coordinates: [number, number];
    lat: number;
    lng: number;
  } | null;
}

export interface ProviderClient {
  id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface ProviderBooking {
  id: string;
  clientId: string | null;
  providerId: string | null;
  serviceType: string;
  status: string;
  quotationId: string | null;
  completionVerified: boolean;
  completionVerifiedAt: string | null;
  bookedAt: string | null;
  scheduledFor: string | null;
  notes: string;
  client: ProviderClient | null;
}

export interface ProviderQuotation {
  id: string | null;
  bookingId: string | null;
  providerId: string | null;
  amount: number;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
