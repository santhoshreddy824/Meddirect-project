import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const HospitalDetails = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    department: "",
    visitDate: ""
  });

  const fetchHospitalDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/hospital/${hospitalId}`);
      const data = await response.json();
      
      if (data.success) {
        setHospital(data.hospital);
      } else {
        toast.error("Hospital not found");
        navigate("/hospitals");
      }
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      toast.error("Error loading hospital details");
    } finally {
      setLoading(false);
    }
  }, [hospitalId, backendUrl, navigate]);

  useEffect(() => {
    fetchHospitalDetails();
  }, [fetchHospitalDetails]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
  const response = await fetch(`${backendUrl}/api/hospital/${hospitalId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem("token")
        },
        body: JSON.stringify(reviewData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Review added successfully!");
        setShowReviewForm(false);
        setReviewData({ rating: 5, comment: "", department: "", visitDate: "" });
        fetchHospitalDetails(); // Refresh to show new review
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error submitting review");
    }
  };

  const callHospital = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.info("Phone number not available");
    }
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.address.coordinates.latitude},${hospital.address.coordinates.longitude}`;
    window.open(url, "_blank");
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Hospital Not Found</h2>
          <button
            onClick={() => navigate("/hospitals")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
          >
            Back to Hospitals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/hospitals")}
            className="flex items-center text-primary hover:text-primary-dark mb-4"
          >
            ← Back to Hospitals
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{hospital.name}</h1>
          <p className="text-gray-600 mt-2">{hospital.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {hospital.images && hospital.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={(typeof hospital.images[activeImageIndex] === 'string' 
                          ? hospital.images[activeImageIndex]
                          : (hospital.images[activeImageIndex]?.url)) 
                         || (typeof hospital.images[0] === 'string' 
                          ? hospital.images[0] 
                          : hospital.images[0]?.url)}
                    alt={hospital.images[activeImageIndex]?.description || hospital.name}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/800x400/4f46e5/ffffff?text=${encodeURIComponent(hospital.name)}`;
                    }}
                  />
                  
                  {/* Image Navigation */}
                  {hospital.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex(activeImageIndex > 0 ? activeImageIndex - 1 : hospital.images.length - 1)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setActiveImageIndex(activeImageIndex < hospital.images.length - 1 ? activeImageIndex + 1 : 0)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      >
                        ›
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {activeImageIndex + 1} / {hospital.images.length}
                  </div>
                </div>
                
                {/* Thumbnail Strip */}
                {hospital.images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {hospital.images.map((image, index) => (
                      <img
                        key={index}
                        src={typeof image === 'string' ? image : image.url}
                        alt={typeof image === 'object' ? image.description : hospital.name}
                        className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                          index === activeImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Specialties */}
            {hospital.specialties && hospital.specialties.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Specialties</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {hospital.specialties.map((specialty, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-primary mb-2">{specialty.name}</h3>
                      <p className="text-gray-600 text-sm">{specialty.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {hospital.services && hospital.services.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Services</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {hospital.services.map((service, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${service.available24x7 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        {service.available24x7 && (
                          <span className="text-green-600 text-xs font-medium">Available 24x7</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {hospital.facilities && hospital.facilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Facilities</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {hospital.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{facility.icon}</span>
                      <div>
                        <h3 className="font-medium">{facility.name}</h3>
                        <p className="text-gray-600 text-xs">{facility.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  Write Review
                </button>
              </div>

              {hospital.reviews && hospital.reviews.length > 0 ? (
                <div className="space-y-4">
                  {hospital.reviews.slice(0, 5).map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{review.userName}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {review.department && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                            {review.department}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact & Directions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => callHospital(hospital.contact.phone)}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark flex items-center justify-center gap-2"
                >
                  📞 Call Hospital
                </button>
                <button
                  onClick={() => callHospital(hospital.contact.emergencyPhone)}
                  className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  🚨 Emergency
                </button>
                <button
                  onClick={getDirections}
                  className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-primary hover:text-white flex items-center justify-center gap-2"
                >
                  🗺️ Get Directions
                </button>
                {hospital.contact.website && (
                  <a
                    href={hospital.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Hospital Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hospital Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-600 mt-1">
                    {hospital.address.street}, {hospital.address.city}, {hospital.address.state} {hospital.address.zipCode}
                  </p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs capitalize">
                    {hospital.type}
                  </span>
                </div>

                {hospital.establishedYear && (
                  <div>
                    <span className="font-medium text-gray-700">Established:</span>
                    <span className="ml-2">{hospital.establishedYear}</span>
                  </div>
                )}

                {hospital.bedCapacity && (
                  <div>
                    <span className="font-medium text-gray-700">Bed Capacity:</span>
                    <div className="mt-1 text-xs">
                      <div>Total: {hospital.bedCapacity.total}</div>
                      <div>Available: {hospital.bedCapacity.available}</div>
                      <div>ICU: {hospital.bedCapacity.icu}</div>
                    </div>
                  </div>
                )}

                {/* Ratings */}
                <div>
                  <span className="font-medium text-gray-700">Rating:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{renderStars(hospital.ratings.overall)}</div>
                    <span className="text-gray-600">({hospital.ratings.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Accreditations */}
                {hospital.accreditation && (
                  <div>
                    <span className="font-medium text-gray-700">Accreditations:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hospital.accreditation.nabh && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">NABH</span>
                      )}
                      {hospital.accreditation.jci && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">JCI</span>
                      )}
                      {hospital.accreditation.iso && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">ISO</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Services */}
            {hospital.emergencyServices && hospital.emergencyServices.available && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-2">🚨 Emergency Services</h4>
                <div className="text-sm text-red-700 space-y-1">
                  {hospital.emergencyServices.ambulanceService && (
                    <div>✓ Ambulance Service</div>
                  )}
                  {hospital.emergencyServices.traumaCenter && (
                    <div>✓ Trauma Center</div>
                  )}
                  <div className="font-medium text-red-800 mt-2">
                    Emergency: {hospital.contact.emergencyPhone}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Good</option>
                    <option value={2}>2 - Fair</option>
                    <option value={1}>1 - Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department (Optional)</label>
                  <input
                    type="text"
                    value={reviewData.department}
                    onChange={(e) => setReviewData({...reviewData, department: e.target.value})}
                    placeholder="e.g., Cardiology, Emergency"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date (Optional)</label>
                  <input
                    type="date"
                    value={reviewData.visitDate}
                    onChange={(e) => setReviewData({...reviewData, visitDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDetails;