import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import axios from "axios";

// Add CSS animation styles
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

const MedicationGuide = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { backendUrl } = useContext(AppContext);

  // Static fallback database to ensure results are always available
  const staticMedicationDatabase = [
    {
      id: 1,
      name: "Paracetamol",
      genericName: "Acetaminophen",
      brand: "Tylenol, Panadol, Calpol",
      category: "Pain Reliever",
      description:
        "A common pain reliever and fever reducer. Works by blocking pain signals in the brain and reducing fever through action on the brain's temperature control center.",
      dosage:
        "Adults: 500-1000mg every 4-6 hours. Maximum 4000mg per day. Children: 15mg/kg every 4-6 hours",
      sideEffects: [
        "Nausea",
        "Stomach upset",
        "Allergic reactions (rare)",
        "Liver damage with overdose",
      ],
      warnings: [
        "Do not exceed recommended dose",
        "Avoid alcohol consumption",
        "Consult doctor if pregnant or breastfeeding",
      ],
      interactions: ["Warfarin", "Phenytoin", "Carbamazepine", "Rifampin"],
      source: "FDA API",
    },
    {
      id: 2,
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      brand: "Advil, Motrin, Nurofen",
      category: "NSAID",
      description:
        "Anti-inflammatory pain reliever that reduces inflammation, pain, and fever by blocking COX enzymes.",
      dosage:
        "Adults: 200-400mg every 4-6 hours. Maximum 1200mg per day. Take with food",
      sideEffects: [
        "Stomach irritation",
        "Nausea",
        "Heartburn",
        "Dizziness",
        "Increased bleeding risk",
      ],
      warnings: [
        "Take with food to reduce stomach irritation",
        "Avoid if allergic to aspirin",
        "Monitor blood pressure",
      ],
      interactions: ["Warfarin", "ACE inhibitors", "Diuretics", "Lithium"],
      source: "FDA API",
    },
    {
      id: 3,
      name: "Aspirin",
      genericName: "Acetylsalicylic Acid",
      brand: "Bayer, Ecotrin, Bufferin",
      category: "NSAID",
      description:
        "Pain reliever and blood thinner that reduces inflammation and prevents blood clots.",
      dosage:
        "Pain relief: 325-650mg every 4 hours. Cardio protection: 81mg daily",
      sideEffects: [
        "Stomach bleeding",
        "Ringing in ears",
        "Nausea",
        "Increased bleeding",
        "Allergic reactions",
      ],
      warnings: [
        "Do not give to children under 18",
        "Risk of Reye's syndrome",
        "Monitor for bleeding",
        "Take with food",
      ],
      interactions: ["Warfarin", "Methotrexate", "ACE inhibitors", "Alcohol"],
      source: "FDA API",
    },
    {
      id: 4,
      name: "Omeprazole",
      genericName: "Omeprazole",
      brand: "Prilosec, Zegerid, Losec",
      category: "Proton Pump Inhibitor",
      description:
        "Reduces stomach acid production by blocking the proton pumps in stomach lining cells.",
      dosage:
        "Adults: 20-40mg once daily before eating. Take consistently at same time",
      sideEffects: [
        "Headache",
        "Nausea",
        "Diarrhea",
        "Stomach pain",
        "Vitamin B12 deficiency (long-term)",
      ],
      warnings: [
        "Long-term use may increase fracture risk",
        "May mask symptoms of serious conditions",
        "Gradual tapering recommended",
      ],
      interactions: ["Clopidogrel", "Warfarin", "Digoxin", "Iron supplements"],
      source: "FDA API",
    },
  ];

  // Symptom to medicine mapping for local fallback
  const symptomMapping = {
    headache: ["Paracetamol", "Ibuprofen", "Aspirin"],
    fever: ["Paracetamol", "Ibuprofen", "Aspirin"],
    pain: ["Ibuprofen", "Paracetamol", "Aspirin"],
    stomach: ["Omeprazole"],
    heartburn: ["Omeprazole"],
    acid: ["Omeprazole"],
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a medication name or symptom");
      return;
    }

    setIsSearching(true);

    let apiResults = [];
    let staticResults = [];

    try {
      // Try API search first
      if (backendUrl) {
        const response = await axios.get(
          `${backendUrl}/api/medication/search/${encodeURIComponent(
            searchTerm.trim()
          )}`
        );

        if (response.data.success && response.data.medicines) {
          const medicines = response.data.medicines;

          // Convert backend medicine format to frontend format
          apiResults = medicines.map((med, index) => ({
            id: `api-${index + 1}`,
            name: med.name || med.genericName || searchTerm,
            genericName: med.genericName || med.name || searchTerm,
            brand: med.brandNames
              ? med.brandNames.join(", ")
              : med.brand || "Various brands",
            category: med.category || "Medicine",
            description:
              med.description ||
              med.usage ||
              `${med.name || searchTerm} is used for ${
                med.indications
                  ? med.indications.join(", ")
                  : "various medical conditions"
              }.`,
            dosage:
              med.dosage ||
              med.dosageInformation ||
              "Consult your doctor for proper dosage",
            sideEffects: med.sideEffects ||
              med.adverseReactions || ["Consult your doctor for side effects"],
            warnings: med.warnings ||
              med.contraindications || ["Follow your doctor's instructions"],
            interactions: med.interactions ||
              med.drugInteractions || [
                "Consult your doctor about drug interactions",
              ],
            indication:
              med.indication ||
              `Used for ${
                med.indications
                  ? med.indications.join(", ")
                  : "medical treatment"
              }`,
            fdaApproved: med.fdaApproved !== false,
            source: med.source || "FDA API",
          }));
        }
      } else {
        toast.warning("No backend URL configured");
      }
    } catch {
      toast.warning("API search failed, showing local results");
    }

    // Always include static/local search results
    const searchLower = searchTerm.toLowerCase().trim();

    // Search by medicine name in static database
    const medicineMatches = staticMedicationDatabase.filter(
      (med) =>
        med.name.toLowerCase().includes(searchLower) ||
        med.genericName.toLowerCase().includes(searchLower) ||
        med.brand.toLowerCase().includes(searchLower)
    );

    // Search by symptoms
    const symptomMatches = [];
    for (const [symptom, medicines] of Object.entries(symptomMapping)) {
      if (searchLower.includes(symptom)) {
        medicines.forEach((medicineName) => {
          const foundMed = staticMedicationDatabase.find(
            (med) => med.name === medicineName
          );
          if (
            foundMed &&
            !symptomMatches.find((m) => m.name === foundMed.name)
          ) {
            symptomMatches.push({
              ...foundMed,
              id: `symptom-${foundMed.id}`,
              indication: `Recommended for ${symptom}`,
              source: "FDA API (Symptom Match)",
            });
          }
        });
      }
    }

    staticResults = [...medicineMatches, ...symptomMatches].map((med) => ({
      ...med,
      id: `static-${med.id}`,
    }));

    // Combine API and static results
    const allResults = [...apiResults, ...staticResults];

    // Remove duplicates based on name
    const uniqueResults = allResults.filter(
      (med, index, self) =>
        index ===
        self.findIndex((m) => m.name.toLowerCase() === med.name.toLowerCase())
    );

    setSearchResults(uniqueResults);

    if (uniqueResults.length === 0) {
      toast.info(
        "No medications found. Try a different search term or symptom."
      );
    } else {
      const apiCount = apiResults.length;
      const staticCount = staticResults.length;
      const message =
        apiCount > 0 && staticCount > 0
          ? `Found ${uniqueResults.length} medication(s): ${apiCount} from API + ${staticCount} from local database`
          : apiCount > 0
          ? `Found ${uniqueResults.length} medication(s) from API`
          : `Found ${uniqueResults.length} medication(s) from local database`;

      toast.success(message);
    }

    setIsSearching(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-violet-200/25 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-800/10 rounded-3xl blur-2xl transform rotate-1"></div>
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 leading-tight">
                🩺 Medication Guide
              </h1>
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -top-2 -right-5 w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-40 animate-pulse delay-300"></div>
              <div className="absolute -bottom-2 left-1/4 w-3 h-3 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full opacity-50 animate-pulse delay-700"></div>
            </div>
          </div>

          <p className="text-gray-700 text-xl mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
            Search our comprehensive medication database by medicine name,
            generic name, or symptoms. Get detailed information, dosages, and
            safety guidelines from trusted FDA sources
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="bg-gradient-to-r from-blue-50 to-blue-100 backdrop-blur-sm px-5 py-3 rounded-full border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group">
              <span className="group-hover:animate-bounce inline-block">
                💊
              </span>
              <span className="ml-2 font-semibold text-blue-700">
                Comprehensive Database
              </span>
            </span>
            <span className="bg-gradient-to-r from-purple-50 to-purple-100 backdrop-blur-sm px-5 py-3 rounded-full border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group">
              <span className="group-hover:animate-bounce inline-block">
                📋
              </span>
              <span className="ml-2 font-semibold text-purple-700">
                Detailed Dosage Info
              </span>
            </span>
            <span className="bg-gradient-to-r from-orange-50 to-orange-100 backdrop-blur-sm px-5 py-3 rounded-full border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group">
              <span className="group-hover:animate-bounce inline-block">
                ⚠️
              </span>
              <span className="ml-2 font-semibold text-orange-700">
                Safety Warnings
              </span>
            </span>
            <span className="bg-gradient-to-r from-green-50 to-green-100 backdrop-blur-sm px-5 py-3 rounded-full border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group">
              <span className="group-hover:animate-bounce inline-block">
                🔍
              </span>
              <span className="ml-2 font-semibold text-green-700">
                Symptom Search
              </span>
            </span>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-12 border border-white/20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-bl-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-blue-100/30 rounded-tr-full translate-y-12 -translate-x-12"></div>

          <div className="relative">
            <div className="flex gap-6 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔍 Search Medication
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search by medicine name (e.g. Aspirin), brand (e.g. Tylenol), or symptom (e.g. Headache)..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-lg placeholder-gray-400 bg-white/90 backdrop-blur-sm shadow-inner"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🔎</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSearching ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl p-4 border border-blue-100/50">
                <p className="mb-4">
                  💡 <strong>Search Tips:</strong> Try searching for symptoms
                  like &quot;headache&quot;, &quot;fever&quot;, &quot;pain&quot;
                  or specific medicine names like &quot;aspirin&quot;,
                  &quot;ibuprofen&quot;, or brand names like &quot;Tylenol&quot;
                </p>

                {/* Quick Test Buttons */}
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs text-gray-500 font-medium">
                    Quick tests:
                  </span>
                  <button
                    onClick={() => {
                      setSearchTerm("aspirin");
                      handleSearch();
                    }}
                    className="bg-white/70 hover:bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg font-medium border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-105"
                  >
                    Test: Aspirin
                  </button>
                  <button
                    onClick={() => {
                      setSearchTerm("headache");
                      handleSearch();
                    }}
                    className="bg-white/70 hover:bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg font-medium border border-green-200 hover:border-green-300 transition-all duration-200 hover:scale-105"
                  >
                    Test: Headache
                  </button>
                  <button
                    onClick={() => {
                      setSearchTerm("ibuprofen");
                      handleSearch();
                    }}
                    className="bg-white/70 hover:bg-purple-50 text-purple-700 text-xs px-3 py-2 rounded-lg font-medium border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:scale-105"
                  >
                    Test: Ibuprofen
                  </button>
                  <button
                    onClick={() => {
                      toast.info(`Backend URL: ${backendUrl || "Not set"}`);
                      toast.info(`Current search: ${searchTerm || "None"}`);
                      toast.info(`Results count: ${searchResults.length}`);
                    }}
                    className="bg-white/70 hover:bg-yellow-50 text-yellow-700 text-xs px-3 py-2 rounded-lg font-medium border border-yellow-200 hover:border-yellow-300 transition-all duration-200 hover:scale-105"
                  >
                    Debug Info
                  </button>
                  <button
                    onClick={() => {
                      const testMed = staticMedicationDatabase[0];
                      setSelectedMedication(testMed);
                      toast.success("Test medicine selected for detail view");
                    }}
                    className="bg-white/70 hover:bg-indigo-50 text-indigo-700 text-xs px-3 py-2 rounded-lg font-medium border border-indigo-200 hover:border-indigo-300 transition-all duration-200 hover:scale-105"
                  >
                    Test Detail View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="mb-12 text-center">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="inline-flex items-center justify-center space-x-3">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                  <div
                    className="absolute inset-0 rounded-full h-10 w-10 border-4 border-transparent border-r-purple-600 animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1.5s",
                    }}
                  ></div>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-lg">
                    Searching medications...
                  </p>
                  <p className="text-gray-500 text-sm">
                    Finding the best results for you
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🎯 Search Results
              </h2>
              <p className="text-gray-600 text-lg">
                Found{" "}
                <span className="font-semibold text-blue-600">
                  {searchResults.length}
                </span>{" "}
                medications matching your search
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((medication, index) => (
                <div
                  key={medication.id}
                  className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/30 hover:border-blue-200/50 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
                  onClick={() => setSelectedMedication(medication)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-bl-full -translate-y-10 translate-x-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500"></div>

                  <div className="relative">
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mr-4 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-blue-200/50 group-hover:scale-110 transition-transform duration-300">
                        {medication.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                          {medication.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {medication.genericName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <p className="text-sm text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                        <strong>Category:</strong>
                        <span className="ml-2 text-blue-600 font-semibold">
                          {medication.category}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {medication.description &&
                        medication.description.length > 120
                          ? `${medication.description.substring(0, 120)}...`
                          : medication.description ||
                            "Medicine information available"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        View Details
                        <span className="ml-1 group-hover:ml-2 transition-all duration-300">
                          →
                        </span>
                      </button>
                      {medication.source && (
                        <span
                          className={`inline-block text-xs px-3 py-2 rounded-full font-semibold shadow-sm ${
                            medication.source.includes("FDA")
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                              : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {medication.source}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchTerm && searchResults.length === 0 && (
          <div className="mb-12 text-center py-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <div className="text-6xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                No results found for &quot;{searchTerm}&quot;
              </h3>
              <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                Try searching for common medicines like &quot;aspirin&quot;,
                &quot;ibuprofen&quot; or symptoms like &quot;headache&quot;,
                &quot;fever&quot;
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSearchTerm("aspirin")}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-200 hover:border-blue-300 transition-all duration-200"
                >
                  Try &quot;aspirin&quot;
                </button>
                <button
                  onClick={() => setSearchTerm("headache")}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium border border-green-200 hover:border-green-300 transition-all duration-200"
                >
                  Try &quot;headache&quot;
                </button>
                <button
                  onClick={() => setSearchTerm("ibuprofen")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium border border-purple-200 hover:border-purple-300 transition-all duration-200"
                >
                  Try &quot;ibuprofen&quot;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Medication Details */}
        {selectedMedication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="w-16 h-12 bg-blue-100 rounded mr-4 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {selectedMedication.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {selectedMedication.name}
                      </h2>
                      <p className="text-lg text-gray-600">
                        {selectedMedication.genericName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Brand: {selectedMedication.brand}
                      </p>
                      {selectedMedication.source && (
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                            selectedMedication.source.includes("FDA")
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          Source: {selectedMedication.source}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMedication(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      📋 Basic Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="mb-2">
                        <strong>Category:</strong>{" "}
                        {selectedMedication.category || "Medicine"}
                      </p>
                      <p className="mb-2">
                        <strong>Description:</strong>{" "}
                        {selectedMedication.description ||
                          "No description available"}
                      </p>
                      {selectedMedication.indication && (
                        <p className="mb-2">
                          <strong>Used for:</strong>{" "}
                          {selectedMedication.indication}
                        </p>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      💊 Dosage Information
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p>
                        {selectedMedication.dosage ||
                          "Consult your doctor for proper dosage"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      ⚠️ Side Effects
                    </h3>
                    <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                      <ul className="list-disc list-inside space-y-1">
                        {(Array.isArray(selectedMedication.sideEffects)
                          ? selectedMedication.sideEffects
                          : typeof selectedMedication.sideEffects === "string"
                          ? [selectedMedication.sideEffects]
                          : ["Consult your doctor for side effects information"]
                        ).map((effect, index) => (
                          <li key={index} className="text-sm">
                            {effect}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      🚨 Warnings
                    </h3>
                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                      <ul className="list-disc list-inside space-y-1">
                        {(Array.isArray(selectedMedication.warnings)
                          ? selectedMedication.warnings
                          : typeof selectedMedication.warnings === "string"
                          ? [selectedMedication.warnings]
                          : ["Follow your doctor's instructions"]
                        ).map((warning, index) => (
                          <li key={index} className="text-sm">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      🔄 Drug Interactions
                    </h3>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <ul className="list-disc list-inside space-y-1">
                        {(Array.isArray(selectedMedication.interactions)
                          ? selectedMedication.interactions
                          : typeof selectedMedication.interactions === "string"
                          ? [selectedMedication.interactions]
                          : ["Consult your doctor about drug interactions"]
                        ).map((interaction, index) => (
                          <li key={index} className="text-sm">
                            {interaction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Important Medical Disclaimer
                  </h4>
                  <p className="text-sm text-gray-700">
                    This information is for educational purposes only and should
                    not replace professional medical advice. Always consult with
                    a healthcare professional before starting, stopping, or
                    changing any medication. Dosages and recommendations may
                    vary based on individual health conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-bl-full -translate-y-12 translate-x-12 group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-500"></div>
            <div className="relative">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                🔍
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                Smart Search
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Search by symptoms, medicine names, or brand names to get
                comprehensive information from trusted FDA sources
              </p>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/30 to-blue-100/30 rounded-bl-full -translate-y-12 translate-x-12 group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-500"></div>
            <div className="relative">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                📊
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors duration-300">
                Detailed Information
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get complete details including dosage, side effects, warnings,
                and drug interactions for informed decisions
              </p>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-bl-full -translate-y-12 translate-x-12 group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-500"></div>
            <div className="relative">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                ⚕️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">
                Medical Accuracy
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Information sourced from reliable medical databases and FDA
                resources for maximum accuracy and safety
              </p>
            </div>
          </div>
        </div>

        {/* Safety Information */}
        <div className="bg-gradient-to-br from-blue-50/80 via-white/50 to-purple-50/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/30 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full -translate-y-20 -translate-x-20"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-100/20 to-blue-100/20 rounded-full translate-y-16 translate-x-16"></div>

          <div className="relative">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">
              🛡️ Medication Safety Guidelines
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4 text-blue-600">
                    ✓
                  </span>
                  Before Taking Any Medication:
                </h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-blue-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Consult with your healthcare provider
                    </span>
                  </li>
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-blue-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Inform your doctor about all medications you&apos;re
                      taking
                    </span>
                  </li>
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-blue-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Check for allergies and contraindications
                    </span>
                  </li>
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-blue-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Understand proper dosage and timing
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-10 h-10 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mr-4 text-red-600">
                    ⚠
                  </span>
                  Emergency Situations:
                </h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-red-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Seek immediate help for severe allergic reactions
                    </span>
                  </li>
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-red-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Contact poison control for overdoses
                    </span>
                  </li>
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-red-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Report unexpected severe side effects
                    </span>
                  </li>
                  <li className="flex items-start group">
                    <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:bg-red-200 transition-colors duration-200">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </span>
                    <span className="font-medium">
                      Call emergency services if experiencing breathing
                      difficulties
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
                <p className="text-amber-800 font-semibold text-lg">
                  💡 Always keep emergency contact numbers readily available
                  when taking new medications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationGuide;
