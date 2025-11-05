import { useState, useEffect } from "react";
import medicineAPI from "../services/medicineAPI";

const QuickMedicineSearch = ({ onMedicineSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularMedicines, setPopularMedicines] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Load popular medicines on component mount
  useEffect(() => {
    const loadPopularMedicines = async () => {
      try {
        const popular = await medicineAPI.getPopularMedicines();
        setPopularMedicines(popular);
      } catch (error) {
        console.error("Error loading popular medicines:", error);
      }
    };

    loadPopularMedicines();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const results = await medicineAPI.searchMedicines(searchTerm);
      setSearchResults(results || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMedicineClick = (medicine) => {
    setSearchTerm(medicine.name);
    setShowResults(false);
    onMedicineSelect(medicine);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        🔍 Medicine Search
      </h2>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for any medicine (e.g., Aspirin, Metformin, Ibuprofen)"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Search Results:
          </h3>
          <div className="max-h-48 overflow-y-auto border rounded-lg">
            {searchResults.map((medicine, index) => (
              <button
                key={`${medicine.rxcui}-${index}`}
                onClick={() => handleMedicineClick(medicine)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 focus:bg-blue-50 focus:outline-none"
              >
                <div className="font-medium text-gray-900">{medicine.name}</div>
                <div className="text-sm text-gray-500">
                  RxCUI: {medicine.rxcui} | Type: {medicine.tty}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showResults && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-4 text-gray-500">
          <div className="text-2xl mb-2">🔍</div>
          <p>No medicines found for "{searchTerm}"</p>
          <p className="text-sm mt-1">
            Try searching with generic or brand names
          </p>
        </div>
      )}

      {/* Popular Medicines */}
      {!showResults && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            💊 Popular Medicines (Click to explore):
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {popularMedicines.map((medicine, index) => (
              <button
                key={`popular-${medicine.rxcui}-${index}`}
                onClick={() => handleMedicineClick(medicine)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-primary hover:text-white transition-colors text-left"
              >
                {medicine.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-1">
          💡 Search Tips:
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Search by brand name (e.g., "Tylenol")</li>
          <li>• Search by generic name (e.g., "Acetaminophen")</li>
          <li>• Search by common name (e.g., "Paracetamol")</li>
          <li>• Use at least 3 characters for better results</li>
        </ul>
      </div>

      {/* Data Source Attribution */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
        <p>Powered by RxNorm API (National Library of Medicine) & OpenFDA</p>
        <p>Real-time data from government medical databases</p>
      </div>
    </div>
  );
};

export default QuickMedicineSearch;
