import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import HospitalLocationService from "../services/hospitalLocationService";

const HospitalSearch = () => {
  const [location, setLocation] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000); // meters
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [hasSearched, setHasSearched] = useState(false);

  const hospitalService = new HospitalLocationService();

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const position = await hospitalService.getCurrentLocation();
      setUserLocation(position);
      setLocation(
        `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`
      );

      // Automatically search for hospitals after getting location
      await searchNearbyHospitals(position.latitude, position.longitude);
      toast.success("Location found and hospitals loaded!");
    } catch (error) {
      toast.error(error.message);
      console.error("Error getting location:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyHospitals = async (lat, lng) => {
    try {
      setLoading(true);
      const results = await hospitalService.searchNearbyHospitals(
        lat,
        lng,
        searchRadius,
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
        toast.info(
          "No hospitals found in the specified area. Try increasing the search radius."
        );
      } else {
        toast.success(`Found ${filteredResults.length} hospitals near you!`);
      }
    } catch (error) {
      toast.error("Error searching for hospitals: " + error.message);
      console.error("Hospital search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter a location or use current location");
      return;
    }

    setLoading(true);
    try {
      // Try to geocode the address
      const coordinates = await hospitalService.geocodeAddress(location);
      setUserLocation(coordinates);
      await searchNearbyHospitals(coordinates.latitude, coordinates.longitude);
    } catch (error) {
      toast.error("Error finding location: " + error.message);
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    if (userLocation && hasSearched) {
      searchNearbyHospitals(userLocation.latitude, userLocation.longitude);
    }
  };

  // Re-search when filters change
  useEffect(() => {
    handleFilterChange();
  }, [filterType, sortBy, searchRadius]);

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
    const url = hospitalService.getDirectionsUrl(
      hospital.location.latitude,
      hospital.location.longitude,
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
                <option value={1000}>1 km</option>
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={20000}>20 km</option>
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
                onClick={handleManualSearch}
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
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Hospital Image */}
                <div className="relative">
                  <img
                    src={
                      hospital.photos && hospital.photos[0]
                        ? hospital.photos[0]
                        : `https://via.placeholder.com/300x200/4f46e5/ffffff?text=${encodeURIComponent(
                            hospital.name.split(" ")[0]
                          )}`
                    }
                    alt={hospital.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200/4f46e5/ffffff?text=Hospital`;
                    }}
                  />
                  {hospital.emergencyServices && (
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
                    {hospital.address}
                  </p>

                  {hospital.phone && (
                    <p className="text-gray-600 mb-3 text-sm">
                      📞 {hospital.phone}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="mb-3">{renderStars(hospital.rating)}</div>

                  {/* Specialties */}
                  {hospital.specialties && hospital.specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        Specialties:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {hospital.specialties
                          .slice(0, 3)
                          .map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {specialty}
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

                  {/* Data Source */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Source: {hospital.source}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => callHospital(hospital.phone)}
                      disabled={!hospital.phone}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      📞 Call
                    </button>
                    <button
                      onClick={() => getDirections(hospital)}
                      className="flex-1 border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-colors text-sm"
                    >
                      🗺️ Directions
                    </button>
                  </div>

                  {/* Website Link */}
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

                  {/* Operating Hours */}
                  {hospital.openingHours &&
                    hospital.openingHours.length > 0 && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="text-gray-700 cursor-pointer hover:text-primary">
                            Operating Hours
                          </summary>
                          <div className="mt-1 text-xs text-gray-600">
                            {hospital.openingHours
                              .slice(0, 3)
                              .map((hours, index) => (
                                <div key={index}>{hours}</div>
                              ))}
                          </div>
                        </details>
                      </div>
                    )}
                </div>
              </div>
            ))}
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
              Click "Current" to use your location or enter an address to search
              for nearby hospitals.
            </p>
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              📍 Use My Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalSearch;
