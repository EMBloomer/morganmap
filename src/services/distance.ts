import { Venue, Route } from '../types/tour';

export class DistanceService {
  /**
   * Calculate the distance between two coordinates using the Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert kilometers to miles
   */
  static kmToMiles(km: number): number {
    return Math.round(km * 0.621371 * 10) / 10;
  }

  /**
   * Calculate routes between consecutive venues
   */
  static calculateRoutes(venues: Venue[]): Route[] {
    const routes: Route[] = [];

    for (let i = 0; i < venues.length - 1; i++) {
      const from = venues[i];
      const to = venues[i + 1];

      const distanceKm = this.calculateDistance(
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude
      );

      routes.push({
        from,
        to,
        distanceKm,
        distanceMiles: this.kmToMiles(distanceKm),
      });
    }

    return routes;
  }

  /**
   * Calculate total distance of the tour
   */
  static calculateTotalDistance(routes: Route[]): { km: number; miles: number } {
    const totalKm = routes.reduce((sum, route) => sum + route.distanceKm, 0);
    return {
      km: Math.round(totalKm * 10) / 10,
      miles: Math.round(this.kmToMiles(totalKm) * 10) / 10,
    };
  }
}
