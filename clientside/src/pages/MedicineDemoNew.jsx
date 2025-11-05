import { useState } from "react";
import { toast } from "react-toastify";
import QuickMedicineSearch from "../components/QuickMedicineSearch";
import medicineAPI from "../services/medicineAPI";

const MedicineDemo = () => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineDetails, setMedicineDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMedicineSelect = async (medicine) => {
    setSelectedMedicine(medicine);
    setIsLoading(true);
    setMedicineDetails(null);

    try {
      const details = await medicineAPI.getComprehensiveMedicineInfo(
        medicine.rxcui,
        medicine.name
      );
      if (details.success) {
        setMedicineDetails(details);
      } else {
        toast.error("Failed to fetch medicine details: " + details.message);
      }
    } catch (error) {
      toast.error("Error fetching medicine details: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTextArray = (textArray) => {
    if (!textArray || !Array.isArray(textArray)) return null;
    return textArray.slice(0, 3).map((text, index) => (
      <p key={index} className="text-sm text-gray-700 mb-2">
        {text.length > 200 ? `${text.substring(0, 200)}...` : text}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🩺 MedDirect Medicine Database
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Comprehensive medicine information powered by government APIs
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="bg-white px-3 py-1 rounded-full">
              📋 RxNorm API
            </span>
            <span className="bg-white px-3 py-1 rounded-full">🏛️ OpenFDA</span>
            <span className="bg-white px-3 py-1 rounded-full">
              🔒 Government Data
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Search Section */}
          <div>
            <QuickMedicineSearch onMedicineSelect={handleMedicineSelect} />
          </div>

          {/* Results Section */}
          <div>
            {selectedMedicine && (
              <div className="bg-white rounded-lg shadow-lg border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedMedicine.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedMedicine.name}
                    </h3>
                    <p className="text-gray-500">
                      RxCUI: {selectedMedicine.rxcui}
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <span className="text-gray-600 font-medium">
                      Loading comprehensive data...
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Fetching from multiple databases
                    </span>
                  </div>
                ) : medicineDetails ? (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    {medicineDetails.basicInfo && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                          📋 Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-blue-700">
                              Name:
                            </span>
                            <span className="ml-2 text-gray-700">
                              {medicineDetails.basicInfo.name}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-blue-700">
                              Term Type:
                            </span>
                            <span className="ml-2 text-gray-700">
                              {medicineDetails.basicInfo.tty}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FDA Label Information */}
                    {medicineDetails.fdaLabel && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                          🏛️ FDA Label Information
                        </h4>
                        <div className="space-y-3">
                          {medicineDetails.fdaLabel.brand_name && (
                            <div>
                              <span className="font-semibold text-green-700">
                                Brand Name:
                              </span>
                              <span className="ml-2 text-gray-700">
                                {Array.isArray(
                                  medicineDetails.fdaLabel.brand_name
                                )
                                  ? medicineDetails.fdaLabel.brand_name.join(
                                      ", "
                                    )
                                  : medicineDetails.fdaLabel.brand_name}
                              </span>
                            </div>
                          )}
                          {medicineDetails.fdaLabel.generic_name && (
                            <div>
                              <span className="font-semibold text-green-700">
                                Generic Name:
                              </span>
                              <span className="ml-2 text-gray-700">
                                {Array.isArray(
                                  medicineDetails.fdaLabel.generic_name
                                )
                                  ? medicineDetails.fdaLabel.generic_name.join(
                                      ", "
                                    )
                                  : medicineDetails.fdaLabel.generic_name}
                              </span>
                            </div>
                          )}
                          {medicineDetails.fdaLabel.manufacturer_name && (
                            <div>
                              <span className="font-semibold text-green-700">
                                Manufacturer:
                              </span>
                              <span className="ml-2 text-gray-700">
                                {Array.isArray(
                                  medicineDetails.fdaLabel.manufacturer_name
                                )
                                  ? medicineDetails.fdaLabel
                                      .manufacturer_name[0]
                                  : medicineDetails.fdaLabel.manufacturer_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Usage & Dosage */}
                    {medicineDetails.fdaLabel?.indications_and_usage && (
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                        <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                          💊 Indications & Usage
                        </h4>
                        <div className="max-h-32 overflow-y-auto">
                          {formatTextArray(
                            medicineDetails.fdaLabel.indications_and_usage
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dosage Information */}
                    {medicineDetails.fdaLabel?.dosage_and_administration && (
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                        <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                          📏 Dosage & Administration
                        </h4>
                        <div className="max-h-32 overflow-y-auto">
                          {formatTextArray(
                            medicineDetails.fdaLabel.dosage_and_administration
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warnings & Contraindications */}
                    {(medicineDetails.fdaLabel?.warnings ||
                      medicineDetails.fdaLabel?.contraindications) && (
                      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
                        <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                          ⚠️ Warnings & Contraindications
                        </h4>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {medicineDetails.fdaLabel.warnings && (
                            <div>
                              <span className="font-semibold text-red-700">
                                Warnings:
                              </span>
                              {formatTextArray(
                                medicineDetails.fdaLabel.warnings
                              )}
                            </div>
                          )}
                          {medicineDetails.fdaLabel.contraindications && (
                            <div>
                              <span className="font-semibold text-red-700">
                                Contraindications:
                              </span>
                              {formatTextArray(
                                medicineDetails.fdaLabel.contraindications
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Drug Interactions */}
                    {medicineDetails.interactions &&
                      medicineDetails.interactions.length > 0 && (
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                          <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                            🔄 Drug Interactions
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {medicineDetails.interactions
                              .slice(0, 3)
                              .map((interaction, index) => (
                                <div key={index} className="text-sm">
                                  <p className="font-medium text-yellow-700">
                                    {interaction.description}
                                  </p>
                                  {interaction.severity && (
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                      Severity: {interaction.severity}
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Related Medications */}
                    {medicineDetails.relatedDrugs &&
                      medicineDetails.relatedDrugs.length > 0 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4">
                          <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                            🔗 Related Medications
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {medicineDetails.relatedDrugs
                              .slice(0, 6)
                              .map((drug, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleMedicineSelect(drug)}
                                  className="text-left p-2 bg-white rounded border hover:bg-indigo-50 transition-colors"
                                >
                                  <div className="font-medium text-indigo-700 text-sm">
                                    {drug.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {drug.tty}
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Drug Classes */}
                    {medicineDetails.classes &&
                      medicineDetails.classes.length > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            🏷️ Drug Classes
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {medicineDetails.classes
                              .slice(0, 5)
                              .map((drugClass, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                                >
                                  {drugClass.className}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Medical Disclaimer */}
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border-l-4 border-red-500 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-red-500 text-xl">⚠️</div>
                        <div>
                          <h4 className="font-bold text-red-800 mb-2">
                            Medical Disclaimer
                          </h4>
                          <p className="text-sm text-red-700">
                            This information is for educational purposes only
                            and should not replace professional medical advice.
                            Always consult with healthcare professionals before
                            starting, stopping, or changing any medication.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-500">
                      Search for a medicine to see detailed information
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Real-time data from government medical databases
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-bold text-gray-800 mb-2">Real-time Search</h3>
            <p className="text-sm text-gray-600">
              Search thousands of medications using live government databases
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🏛️</div>
            <h3 className="font-bold text-gray-800 mb-2">FDA Verified</h3>
            <p className="text-sm text-gray-600">
              Official FDA label information and drug details
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-bold text-gray-800 mb-2">Drug Interactions</h3>
            <p className="text-sm text-gray-600">
              Check potential interactions and contraindications
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-bold text-gray-800 mb-2">Comprehensive Data</h3>
            <p className="text-sm text-gray-600">
              Dosage, warnings, side effects, and related medications
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-4">
            <a
              href="/medications"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              Full Medicine Guide
            </a>
            <a
              href="/appointments"
              className="bg-white border-2 border-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Book Consultation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDemo;
