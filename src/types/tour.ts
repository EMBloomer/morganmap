export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  durationDays: number;
}

export interface Route {
  from: Venue;
  to: Venue;
  distanceKm: number;
  distanceMiles: number;
}

export interface Tour {
  id: string;
  name: string;
  description?: string;
  venues: Venue[];
  routes: Route[];
  startDate: string;
  endDate: string;
  totalDurationDays: number;
}

export interface AIExtractionResponse {
  success: boolean;
  tour?: Partial<Tour>;
  error?: string;
}

export interface GeocodeResponse {
  success: boolean;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  error?: string;
}
