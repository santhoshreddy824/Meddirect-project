import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "India" },
    zipCode: { type: String },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    // GeoJSON point for fast geospatial queries (added alongside coordinates)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        default: undefined
      }
    }
  },
  contact: {
    phone: { type: String, required: true },
    emergencyPhone: { type: String },
    email: { type: String },
    website: { type: String }
  },
  images: [{
    url: { type: String, required: true },
    description: { type: String },
    isMain: { type: Boolean, default: false }
  }],
  specialties: [{
    name: { type: String, required: true },
    description: { type: String },
    departments: [String]
  }],
  services: [{
    name: { type: String, required: true },
    description: { type: String },
    available24x7: { type: Boolean, default: false }
  }],
  facilities: [{
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String }
  }],
  operatingHours: {
    monday: { open: String, close: String, is24Hours: Boolean },
    tuesday: { open: String, close: String, is24Hours: Boolean },
    wednesday: { open: String, close: String, is24Hours: Boolean },
    thursday: { open: String, close: String, is24Hours: Boolean },
    friday: { open: String, close: String, is24Hours: Boolean },
    saturday: { open: String, close: String, is24Hours: Boolean },
    sunday: { open: String, close: String, is24Hours: Boolean }
  },
  bedCapacity: {
    total: { type: Number },
    available: { type: Number },
    icu: { type: Number },
    emergency: { type: Number }
  },
  ratings: {
    overall: { type: Number, min: 0, max: 5, default: 0 },
    cleanliness: { type: Number, min: 0, max: 5, default: 0 },
    staff: { type: Number, min: 0, max: 5, default: 0 },
    equipment: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  emergencyServices: {
    available: { type: Boolean, default: true },
    ambulanceService: { type: Boolean, default: false },
    traumaCenter: { type: Boolean, default: false },
    emergencyDepartments: [String]
  },
  insurance: {
    accepted: [String], // List of accepted insurance providers
    cashlessProviders: [String]
  },
  accreditation: {
    nabh: { type: Boolean, default: false },
    jci: { type: Boolean, default: false },
    iso: { type: Boolean, default: false },
    other: [String]
  },
  doctors: [{
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
    name: { type: String },
    specialization: { type: String },
    experience: { type: Number },
    available: { type: Boolean, default: true }
  }],
  departments: [{
    name: { type: String, required: true },
    head: { type: String },
    contact: { type: String },
    services: [String],
    equipments: [String]
  }],
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    visitDate: { type: Date },
    department: { type: String },
    reviewDate: { type: Date, default: Date.now },
    helpful: { type: Number, default: 0 }
  }],
  status: {
    type: String,
    enum: ["active", "inactive", "maintenance"],
    default: "active"
  },
  establishedYear: { type: Number },
  type: {
    type: String,
    enum: ["government", "private", "semi-government", "charitable"],
    default: "private"
  },
  networkHospitals: [String], // Related hospital chains
  parking: {
    available: { type: Boolean, default: true },
    capacity: { type: Number },
    charges: { type: String }
  },
  amenities: [{
    name: { type: String },
    description: { type: String },
    chargeable: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes for efficient searching
// 2dsphere index on GeoJSON location; keep text and other indexes
hospitalSchema.index({ "address.location": "2dsphere" });
hospitalSchema.index({ name: "text", description: "text" }); // For text search
hospitalSchema.index({ "specialties.name": 1 });
hospitalSchema.index({ "ratings.overall": -1 });
hospitalSchema.index({ status: 1 });

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode || ''}`.trim();
});

// Method to calculate distance from a point
hospitalSchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.address.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.address.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.address.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to get main image
hospitalSchema.methods.getMainImage = function() {
  const mainImage = this.images.find(img => img.isMain);
  return mainImage ? mainImage.url : (this.images[0] ? this.images[0].url : null);
};

// Method to update ratings
hospitalSchema.methods.updateRatings = function() {
  if (this.reviews.length === 0) return;
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.overall = totalRating / this.reviews.length;
  this.ratings.reviewCount = this.reviews.length;
  
  // Calculate specific ratings if available
  // This could be enhanced to calculate cleanliness, staff, equipment ratings separately
};

const hospitalModel = mongoose.model("Hospital", hospitalSchema);

export default hospitalModel;