// Hospital location service for finding nearby hospitals
class HospitalLocationService {
  constructor() {
    this.apiKeys = {
      google: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      mapbox: import.meta.env.VITE_MAPBOX_API_KEY
    };
    this.defaultTimeoutMs = 8000;
  }

  // Get user's current location with high accuracy
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  // Geocode address to coordinates
  async geocodeAddress(address) {
    try {
      // Try Google Geocoding API first
      const fetchWithTimeout = this._fetchWithTimeout.bind(this);

      if (this.apiKeys.google) {
        const response = await fetchWithTimeout(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKeys.google}`,
          6000
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          return {
            latitude: location.lat,
            longitude: location.lng,
            formatted_address: data.results[0].formatted_address
          };
        }
      }

      // Fallback to OpenStreetMap Nominatim (free)
      const response = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        6000
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          formatted_address: data[0].display_name
        };
      }

      throw new Error('Address not found');
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  // Search for nearby hospitals using multiple APIs
  async searchNearbyHospitals(latitude, longitude, radius = 5000, options = {}) {
    const hospitals = [];
    
    try {
      // Method 1: Google Places API (if available)
      if (this.apiKeys.google) {
        const googleHospitals = await this.searchGooglePlaces(latitude, longitude, radius);
        hospitals.push(...googleHospitals);
      }

      // Method 2: Overpass API (OpenStreetMap)
  const osmHospitals = await this.searchOverpassAPI(latitude, longitude, radius);
      hospitals.push(...osmHospitals);

      // Method 3: Healthcare.gov API (US only)
      if (options.includeGovernmentData) {
        const govHospitals = await this.searchHealthcareGov(latitude, longitude, radius);
        hospitals.push(...govHospitals);
      }

      // Remove duplicates and sort by distance
      const uniqueHospitals = this.removeDuplicateHospitals(hospitals);
      return this.sortHospitalsByDistance(uniqueHospitals, latitude, longitude);

    } catch (error) {
      console.error('Hospital search error:', error);
      // Return mock data as fallback
      return this.getMockHospitals(latitude, longitude, radius);
    }
  }

  // Google Places API search
  async searchGooglePlaces(latitude, longitude, radius) {
    try {
      const response = await this._fetchWithTimeout(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${this.apiKeys.google}`,
        this.defaultTimeoutMs
      );
      const data = await response.json();

      if (data.status === 'OK') {
        const mapped = await Promise.all(
          data.results.map(async (place) => {
            let photos = [];
            if (Array.isArray(place.photos) && place.photos.length > 0) {
              photos = place.photos.map((photo) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.apiKeys.google}`
              );
            } else {
              // Fallback: fetch details to try to get photos if Nearby Search had none
              const detailsPhotos = await this._fetchPlacePhotosByDetails(place.place_id);
              photos = detailsPhotos;
            }

            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              location: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng
              },
              rating: place.rating || 0,
              phone: place.formatted_phone_number,
              website: place.website,
              photos,
              openingHours: place.opening_hours?.weekday_text || [],
              priceLevel: place.price_level,
              source: 'Google Places'
            };
          })
        );
        return mapped;
      }
      return [];
    } catch (error) {
      console.error('Google Places API error:', error);
      return [];
    }
  }

  // Overpass API search (OpenStreetMap)
  async searchOverpassAPI(latitude, longitude, radius) {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${latitude},${longitude});
          way["amenity"="hospital"](around:${radius},${latitude},${longitude});
          relation["amenity"="hospital"](around:${radius},${latitude},${longitude});
        );
        out geom;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      const data = await response.json();

      return data.elements.map(element => ({
        id: `osm_${element.type}_${element.id}`,
        name: element.tags?.name || 'Hospital',
        address: this.formatOSMAddress(element.tags),
        location: {
          latitude: element.lat || (element.center ? element.center.lat : element.bounds.minlat),
          longitude: element.lon || (element.center ? element.center.lon : element.bounds.minlon)
        },
        phone: element.tags?.phone,
        website: element.tags?.website,
        photos: element.tags?.image ? [element.tags.image] : [],
        specialties: this.extractSpecialties(element.tags),
        operatingTimes: element.tags?.opening_hours,
        emergencyServices: element.tags?.emergency === 'yes',
        source: 'OpenStreetMap'
      }));
    } catch (error) {
      console.error('Overpass API error:', error);
      return [];
    }
  }

  // Healthcare.gov API search (US government data)
  async searchHealthcareGov(latitude, longitude, radius) {
    try {
      // This is a placeholder for healthcare.gov API integration
      // The actual API may require different endpoints and authentication
      const response = await fetch(
        `https://data.healthcare.gov/api/hospitals?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.hospitals.map(hospital => ({
          id: hospital.provider_id,
          name: hospital.hospital_name,
          address: `${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zip_code}`,
          location: {
            latitude: hospital.latitude,
            longitude: hospital.longitude
          },
          phone: hospital.phone_number,
          website: hospital.website,
          rating: hospital.overall_rating,
          ownership: hospital.hospital_ownership,
          hospitalType: hospital.hospital_type,
          emergencyServices: hospital.emergency_services === 'Yes',
          source: 'Healthcare.gov'
        }));
      }
      return [];
    } catch (error) {
      console.error('Healthcare.gov API error:', error);
      return [];
    }
  }

  // Remove duplicate hospitals based on name and location similarity
  removeDuplicateHospitals(hospitals) {
    const unique = [];
    const seen = new Set();

    for (const hospital of hospitals) {
      const key = `${hospital.name.toLowerCase()}_${hospital.location.latitude.toFixed(3)}_${hospital.location.longitude.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(hospital);
      }
    }

    return unique;
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Sort hospitals by distance from user location
  sortHospitalsByDistance(hospitals, userLat, userLng) {
    return hospitals.map(hospital => ({
      ...hospital,
      distance: this.calculateDistance(
        userLat, userLng,
        hospital.location.latitude, hospital.location.longitude
      )
    })).sort((a, b) => a.distance - b.distance);
  }

  // Format OpenStreetMap address
  formatOSMAddress(tags) {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }

  // Extract specialties from OSM tags
  extractSpecialties(tags) {
    const specialties = [];
    if (tags.emergency === 'yes') specialties.push('Emergency');
    if (tags['healthcare:speciality']) {
      specialties.push(...tags['healthcare:speciality'].split(';'));
    }
    return specialties;
  }

  // Fallback mock hospitals with realistic data
  getMockHospitals(latitude, longitude, radius) {
    const mockHospitals = [
      {
        id: 'mock_1',
        name: 'City General Hospital',
        address: '123 Main Street, Downtown',
        location: {
          latitude: latitude + 0.01,
          longitude: longitude + 0.01
        },
        phone: '+1 (555) 123-4567',
        rating: 4.5,
        specialties: ['Emergency', 'Cardiology', 'Neurology'],
        emergencyServices: true,
        source: 'Mock Data'
      },
      {
        id: 'mock_2',
        name: 'Regional Medical Center',
        address: '456 Health Avenue, Medical District',
        location: {
          latitude: latitude - 0.015,
          longitude: longitude + 0.02
        },
        phone: '+1 (555) 987-6543',
        rating: 4.2,
        specialties: ['Surgery', 'Oncology', 'Radiology'],
        emergencyServices: true,
        source: 'Mock Data'
      },
      {
        id: 'mock_3',
        name: 'Community Health Center',
        address: '789 Care Boulevard, Uptown',
        location: {
          latitude: latitude + 0.02,
          longitude: longitude - 0.01
        },
        phone: '+1 (555) 456-7890',
        rating: 4.0,
        specialties: ['Family Medicine', 'Urgent Care'],
        emergencyServices: false,
        source: 'Mock Data'
      }
    ];

    return this.sortHospitalsByDistance(mockHospitals, latitude, longitude)
      .filter(hospital => hospital.distance <= radius / 1000); // Convert meters to km
  }

  // Get directions URL
  getDirectionsUrl(destinationLat, destinationLng, userLat, userLng) {
    if (userLat && userLng) {
      return `https://www.google.com/maps/dir/${userLat},${userLng}/${destinationLat},${destinationLng}`;
    }
    return `https://www.google.com/maps/search/${destinationLat},${destinationLng}`;
  }

  // Internal: fetch with timeout helper
  async _fetchWithTimeout(url, ms = 8000, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal, ...options });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  // Internal: get photos by Place Details if Nearby Search didn't include any
  async _fetchPlacePhotosByDetails(placeId) {
    try {
      if (!this.apiKeys.google || !placeId) return [];
      const detailsRes = await this._fetchWithTimeout(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photo,website,formatted_phone_number,opening_hours&key=${this.apiKeys.google}`,
        this.defaultTimeoutMs
      );
      const details = await detailsRes.json();
      if (details.status === 'OK' && details.result && Array.isArray(details.result.photos)) {
        return details.result.photos.slice(0, 3).map((p) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${this.apiKeys.google}`
        );
      }
      return [];
    } catch {
      return [];
    }
  }
}

export default HospitalLocationService;