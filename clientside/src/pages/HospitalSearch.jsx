import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useRef,
} from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import HospitalLocationService from "../services/hospitalLocationService";

const HospitalSearch = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [location, setLocation] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // kilometers
  const searchDebounceRef = useRef(null);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [hasSearched, setHasSearched] = useState(false);
  const locationInputRef = useRef(null);

  const hospitalService = useMemo(() => new HospitalLocationService(), []);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const position = await hospitalService.getCurrentLocation();
      setUserLocation(position);
      // Don't overwrite the location input - let user edit it freely
      if (!location || location.trim() === "") {
        setLocation(
          `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`
        );
      }

      // Search in database first, then external APIs if needed
      await searchDatabaseHospitals(position.latitude, position.longitude);
      console.log("Location found and hospitals loaded!");
    } catch (error) {
      toast.error(error.message);
      console.error("Error getting location:", error);
    } finally {
      setLoading(false);
    }
  };
  const triggerManualSearch = (immediate = false) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    if (immediate) {
      handleManualSearch();
    } else {
      searchDebounceRef.current = setTimeout(() => {
        handleManualSearch();
        searchDebounceRef.current = null;
      }, 400);
    }
  };

  const searchExternalHospitals = useCallback(
    async (lat, lng) => {
      try {
        setLoading(true);
        const results = await hospitalService.searchNearbyHospitals(
          lat,
          lng,
          searchRadius * 1000, // Convert km to meters for external service
          {
            includeGovernmentData: true,
          }
        );

        let filteredResults = results;

        // Apply filters
        if (filterType === "emergency") {
          filteredResults = results.filter((h) => h.emergencyServices);
        } else if (filterType === "specialty") {
          filteredResults = results.filter(
            (h) => h.specialties && h.specialties.length > 0
          );
        }

        // Apply sorting
        if (sortBy === "rating") {
          filteredResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === "name") {
          filteredResults.sort((a, b) => a.name.localeCompare(b.name));
        }
        // Default is already sorted by distance

        setHospitals(filteredResults);
        setHasSearched(true);

        if (filteredResults.length === 0) {
          // Avoid noisy popups
          console.warn("No hospitals found in the specified area");
        } else {
          console.log(
            `Found ${filteredResults.length} hospitals from external sources`
          );
        }
      } catch (error) {
        // Only log errors; UI already shows empty state
        console.error("Error searching for hospitals: " + error.message);
        console.error("External hospital search error:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchRadius, filterType, sortBy, hospitalService]
  );

  const searchDatabaseHospitals = useCallback(
    async (lat, lng) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          lat: lat.toString(),
          lng: lng.toString(),
          radius: searchRadius.toString(),
          sortBy: sortBy,
        });

        if (filterType !== "all") {
          if (filterType === "emergency") {
            params.append("emergency", "true");
          }
        }

        const response = await fetch(
          `${backendUrl}/api/hospital/nearby?${params}`,
          { timeout: 5000 } // 5 second timeout
        );
        const data = await response.json();

        if (data.success) {
          let results = data.hospitals;

          // Apply client-side filtering if needed
          if (filterType === "government") {
            results = results.filter((h) => h.type === "government");
          } else if (filterType === "private") {
            results = results.filter((h) => h.type === "private");
          }

          setHospitals(results);
          setHasSearched(true);

          if (results.length === 0) {
            // Quickly fallback to external without blocking
            console.log("No DB results, trying external sources...");
            searchExternalHospitals(lat, lng).catch((err) => {
              console.warn("External search failed:", err);
            });
          } else {
            console.log(`Found ${results.length} hospitals in our database`);
          }
        } else {
          throw new Error(data.message || "Failed to fetch hospitals");
        }
      } catch (error) {
        console.error("Database search error:", error);
        // Quick fallback without blocking
        searchExternalHospitals(lat, lng).catch((err) => {
          console.warn("External search fallback failed:", err);
        });
      } finally {
        setLoading(false);
      }
    },
    [searchRadius, filterType, sortBy, backendUrl, searchExternalHospitals]
  );

  const handleManualSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter a location or use current location");
      return;
    }

    setLoading(true);
    try {
      // If user entered coordinates like "lat, lng" or "lat lng", parse directly
      const coordMatch = location
        .trim()
        .match(/^\s*(-?\d{1,3}\.\d+)\s*[,\s]+\s*(-?\d{1,3}\.\d+)\s*$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        const coordinates = { latitude: lat, longitude: lng };
        setUserLocation(coordinates);
        setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        await searchDatabaseHospitals(lat, lng);
      } else {
        // Try to geocode the address
        const coordinates = await hospitalService.geocodeAddress(location);
        setUserLocation(coordinates);
        await searchDatabaseHospitals(
          coordinates.latitude,
          coordinates.longitude
        );
      }
    } catch (error) {
      toast.error("Error finding location: " + error.message);
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback(() => {
    if (userLocation && hasSearched) {
      searchDatabaseHospitals(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation, hasSearched, searchDatabaseHospitals]);

  // Re-search when filters change
  useEffect(() => {
    handleFilterChange();
  }, [filterType, sortBy, searchRadius, handleFilterChange]);

  // Simplified: Don't enrich images automatically - rely on what comes from API
  // This speeds up rendering significantly

  const getHospitalImageUrl = (hospital) => {
    try {
      // 1) DB images: array of objects or strings
      if (
        hospital.images &&
        Array.isArray(hospital.images) &&
        hospital.images.length > 0
      ) {
        const imgs = hospital.images
          .map((img) => (typeof img === "string" ? { url: img } : img))
          .filter((img) => img && (img.url || img.secure_url));

        if (imgs.length > 0) {
          const main = imgs.find((i) => i.isMain) || imgs[0];
          return main.url || main.secure_url;
        }
      }

      // 2) External photos: prefer first valid photo
      if (
        hospital.photos &&
        Array.isArray(hospital.photos) &&
        hospital.photos.length > 0
      ) {
        const p = hospital.photos[0];
        if (typeof p === "string" && p.startsWith("http")) return p;
        if (p && typeof p === "object") {
          const url =
            p.url || p.secure_url || p.photo_url || p.image_url || p.link;
          if (url && url.startsWith("http")) return url;
        }
      }

      // 3) Single image field fallback
      if (
        typeof hospital.image === "string" &&
        hospital.image.startsWith("http")
      )
        return hospital.image;
      if (
        typeof hospital.mainImage === "string" &&
        hospital.mainImage.startsWith("http")
      )
        return hospital.mainImage;

      // 4) Placeholder with hospital name
      return `https://via.placeholder.com/400x250/4f46e5/ffffff?text=${encodeURIComponent(
        (hospital.name || "Hospital").substring(0, 20)
      )}`;
    } catch {
      return `https://via.placeholder.com/400x250/4f46e5/ffffff?text=Hospital`;
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars.push(
        <span key={i} className="text-gray-300">
          ☆
        </span>
      );
    }
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  const getDirections = (hospital) => {
    const lat =
      hospital?.location?.latitude ?? hospital?.address?.coordinates?.latitude;
    const lng =
      hospital?.location?.longitude ??
      hospital?.address?.coordinates?.longitude;
    const url = hospitalService.getDirectionsUrl(
      lat,
      lng,
      userLocation?.latitude,
      userLocation?.longitude
    );
    window.open(url, "_blank");
  };

  const callHospital = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.info("Phone number not available");
    }
  };

  // Load featured hospitals (sample) to show below search before user searches
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const resp = await fetch(
          `${backendUrl}/api/hospital/list?limit=6&sortBy=rating`
        );
        const data = await resp.json();
        if (data?.success && Array.isArray(data.hospitals)) {
          setFeaturedHospitals(data.hospitals);
        }
      } catch {
        // ignore silently
      }
    };
    if (backendUrl) loadFeatured();
  }, [backendUrl]);

  // Google Places Autocomplete for the location input
  useEffect(() => {
    if (!googleApiKey || !locationInputRef.current) return;

    const initAutocomplete = () => {
      if (!window.google?.maps?.places) return;
      const input = locationInputRef.current;
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["geocode"],
        fields: ["formatted_address", "geometry", "name"],
      });
      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setUserLocation({ latitude: lat, longitude: lng });
          setLocation(place.formatted_address || place.name || "");
          await searchDatabaseHospitals(lat, lng);
          setHasSearched(true);
        } else if (place?.name) {
          setLocation(place.name);
        }
      });
    };

    // If the script is already present, initialize immediately
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // Inject the Google Maps JS script
    const cbName = "initPlacesAutocomplete";
    window[cbName] = () => initAutocomplete();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // cleanup callback reference
      try {
        delete window[cbName];
      } catch {
        /* no-op */
      }
    };
  }, [googleApiKey, searchDatabaseHospitals]);

  // Render a single hospital card (used for both results and featured)
  const renderHospitalCard = (hospital) => (
    <div
      key={hospital._id || hospital.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        if (hospital._id) {
          navigate(`/hospital/${hospital._id}`);
        } else {
          toast.info(
            "This hospital's detailed information is not available in our system"
          );
        }
      }}
    >
      <div className="relative">
        <img
          loading="lazy"
          src={getHospitalImageUrl(hospital)}
          alt={hospital.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://via.placeholder.com/300x200/4f46e5/ffffff?text=Hospital`;
          }}
        />
        {hospital?.emergencyServices?.available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            🚑 Emergency
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {hospital.distance
            ? `${hospital.distance.toFixed(1)} km away`
            : "Distance unknown"}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {hospital.name}
        </h3>
        <p className="text-gray-600 mb-2 text-sm">
          {hospital?.fullAddress ||
            [
              hospital?.address?.street,
              hospital?.address?.city,
              hospital?.address?.state,
              hospital?.address?.zipCode,
            ]
              .filter(Boolean)
              .join(", ") ||
            hospital?.address}
        </p>

        {hospital.phone && (
          <p className="text-gray-600 mb-3 text-sm">📞 {hospital.phone}</p>
        )}

        <div className="mb-3">
          {renderStars(hospital.ratings?.overall ?? hospital.rating)}
        </div>

        {hospital.specialties && hospital.specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-1">
              Specialties:
            </p>
            <div className="flex flex-wrap gap-1">
              {hospital.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {typeof specialty === "string"
                    ? specialty
                    : specialty.name || specialty}
                </span>
              ))}
              {hospital.specialties.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{hospital.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {hospital.source && (
          <div className="mb-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Source: {hospital.source}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              callHospital(hospital.phone);
            }}
            disabled={!hospital.phone}
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            📞 Call
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              getDirections(hospital);
            }}
            className="flex-1 border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors text-sm"
          >
            🗺️ Directions
          </button>
        </div>

        {hospital.website && (
          <div className="mt-2">
            <a
              href={hospital.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              🌐 Visit Website
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Find Hospitals Near You
          </h1>
          <p className="text-gray-600 text-lg">
            Discover the best healthcare facilities in your area
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                ref={locationInputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    triggerManualSearch(true);
                  }
                }}
                placeholder="Enter city, address, or coordinates"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius
              </label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Hospitals</option>
                <option value="emergency">Emergency Only</option>
                <option value="specialty">With Specialties</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Use my current location"
              >
                📍 Current
              </button>
              <button
                onClick={() => triggerManualSearch(true)}
                disabled={loading}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "🔍" : "Search"}
              </button>
            </div>
          </div>

          {/* Additional Filters */}
          {hospitals.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""}{" "}
                  found
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for hospitals...</p>
          </div>
        ) : hospitals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => renderHospitalCard(hospital))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <img
              src={assets.appointment_img}
              alt="No results"
              className="w-64 h-64 mx-auto mb-4 opacity-50"
            />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hospitals found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search location or increasing the search
              radius.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-primary/10 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🏥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Find Hospitals Near You
            </h3>
            <p className="text-gray-500 mb-4">
              Click &quot;Current&quot; to use your location or enter an address
              to search for nearby hospitals.
            </p>
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              📍 Use My Location
            </button>

            {/* Featured hospitals section */}
            {featuredHospitals.length > 0 && (
              <div className="mt-10 text-left">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Featured hospitals
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredHospitals.map((h) => renderHospitalCard(h))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalSearch;
