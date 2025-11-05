import mongoose from "mongoose";
import hospitalModel from "./models/hospitalModel.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure we load the .env file located in the backend folder regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const sampleHospitals = [
  {
    name: "Apollo Hospital Delhi",
    description: "Apollo Hospitals Delhi is a leading multi-specialty hospital offering world-class healthcare services with state-of-the-art technology and experienced medical professionals.",
    address: {
      street: "Sarita Vihar, Delhi Mathura Road",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110076",
      coordinates: {
        latitude: 28.5355,
        longitude: 77.2951
      }
    },
    contact: {
      phone: "+91-11-26925858",
      emergencyPhone: "+91-11-26925800",
      email: "info@apollodelhi.com",
      website: "https://www.apollohospitals.com/delhi"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Hospital Main Building",
        isMain: true
      },
      {
        url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Emergency Department",
        isMain: false
      },
      {
        url: "https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "ICU Ward",
        isMain: false
      }
    ],
    specialties: [
      { name: "Cardiology", description: "Advanced cardiac care and surgery" },
      { name: "Oncology", description: "Comprehensive cancer treatment" },
      { name: "Neurology", description: "Neurological disorders treatment" },
      { name: "Orthopedics", description: "Bone and joint treatment" }
    ],
    services: [
      { name: "24x7 Emergency", description: "Round the clock emergency services", available24x7: true },
      { name: "Ambulance Service", description: "Emergency ambulance services", available24x7: true },
      { name: "Blood Bank", description: "Blood donation and storage facility", available24x7: false },
      { name: "Pharmacy", description: "In-house pharmacy services", available24x7: true }
    ],
    facilities: [
      { name: "Free WiFi", description: "Complimentary internet access", icon: "📶" },
      { name: "Cafeteria", description: "Food and beverages", icon: "🍽️" },
      { name: "Parking", description: "Vehicle parking facility", icon: "🚗" },
      { name: "ATM", description: "Banking services", icon: "🏧" }
    ],
    operatingHours: {
      monday: { open: "00:00", close: "23:59", is24Hours: true },
      tuesday: { open: "00:00", close: "23:59", is24Hours: true },
      wednesday: { open: "00:00", close: "23:59", is24Hours: true },
      thursday: { open: "00:00", close: "23:59", is24Hours: true },
      friday: { open: "00:00", close: "23:59", is24Hours: true },
      saturday: { open: "00:00", close: "23:59", is24Hours: true },
      sunday: { open: "00:00", close: "23:59", is24Hours: true }
    },
    bedCapacity: {
      total: 695,
      available: 120,
      icu: 45,
      emergency: 25
    },
    ratings: {
      overall: 4.5,
      cleanliness: 4.7,
      staff: 4.3,
      equipment: 4.8,
      reviewCount: 2450
    },
    emergencyServices: {
      available: true,
      ambulanceService: true,
      traumaCenter: true,
      emergencyDepartments: ["General Emergency", "Cardiac Emergency", "Trauma"]
    },
    insurance: {
      accepted: ["CGHS", "ECHS", "Mediclaim", "Star Health", "HDFC ERGO"],
      cashlessProviders: ["Star Health", "HDFC ERGO", "Care Health"]
    },
    accreditation: {
      nabh: true,
      jci: true,
      iso: true,
      other: ["Green OT Certification"]
    },
    departments: [
      { name: "Cardiology", head: "Dr. Rajesh Kumar", contact: "+91-11-26925861", services: ["Angioplasty", "Bypass Surgery"], equipments: ["Cath Lab", "Echo Machine"] },
      { name: "Emergency", head: "Dr. Priya Sharma", contact: "+91-11-26925800", services: ["Trauma Care", "Emergency Surgery"], equipments: ["CT Scan", "X-Ray"] }
    ],
    establishedYear: 1983,
    type: "private",
    parking: {
      available: true,
      capacity: 500,
      charges: "₹20/hour"
    },
    amenities: [
      { name: "Guest House", description: "Accommodation for patients' families", chargeable: true },
      { name: "Library", description: "Medical books and journals", chargeable: false }
    ]
  },
  {
    name: "Fortis Hospital Gurgaon",
    description: "Fortis Hospital Gurgaon is a state-of-the-art, JCI and NABH-certified multi-super specialty hospital located in the heart of Gurgaon.",
    address: {
      street: "B-22, Sector 62",
      city: "Gurgaon",
      state: "Haryana",
      country: "India",
      zipCode: "122012",
      coordinates: {
        latitude: 28.3949,
        longitude: 77.0893
      }
    },
    contact: {
      phone: "+91-124-4962200",
      emergencyPhone: "+91-124-4962299",
      email: "info@fortishealthcare.com",
      website: "https://www.fortishealthcare.com/gurgaon"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Hospital Exterior",
        isMain: true
      },
      {
        url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Modern OT",
        isMain: false
      }
    ],
    specialties: [
      { name: "Cardiac Surgery", description: "Advanced heart surgery procedures" },
      { name: "Transplant Surgery", description: "Organ transplantation services" },
      { name: "Cancer Care", description: "Comprehensive oncology services" }
    ],
    bedCapacity: {
      total: 355,
      available: 80,
      icu: 30,
      emergency: 15
    },
    ratings: {
      overall: 4.3,
      cleanliness: 4.5,
      staff: 4.1,
      equipment: 4.6,
      reviewCount: 1890
    },
    emergencyServices: {
      available: true,
      ambulanceService: true,
      traumaCenter: true
    },
    establishedYear: 2001,
    type: "private"
  },
  {
    name: "AIIMS New Delhi",
    description: "All India Institute of Medical Sciences (AIIMS) New Delhi is a premier medical institution and hospital in India, known for its excellence in medical education, research, and patient care.",
    address: {
      street: "Sri Aurobindo Marg, Ansari Nagar",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110029",
      coordinates: {
        latitude: 28.5672,
        longitude: 77.2100
      }
    },
    contact: {
      phone: "+91-11-26588500",
      emergencyPhone: "+91-11-26594404",
      email: "director@aiims.ac.in",
      website: "https://www.aiims.edu"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "AIIMS Main Building",
        isMain: true
      },
      {
        url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Research Laboratory",
        isMain: false
      }
    ],
    specialties: [
      { name: "Neurosciences", description: "Advanced neurological treatments" },
      { name: "Cardiothoracic Surgery", description: "Heart and chest surgery" },
      { name: "Pediatrics", description: "Comprehensive child healthcare" },
      { name: "Trauma & Emergency", description: "24x7 trauma care" }
    ],
    bedCapacity: {
      total: 2478,
      available: 300,
      icu: 120,
      emergency: 50
    },
    ratings: {
      overall: 4.6,
      cleanliness: 4.2,
      staff: 4.8,
      equipment: 4.9,
      reviewCount: 15000
    },
    emergencyServices: {
      available: true,
      ambulanceService: true,
      traumaCenter: true
    },
    establishedYear: 1956,
    type: "government",
    accreditation: {
      nabh: true,
      jci: false,
      iso: true
    }
  },
  {
    name: "Max Super Speciality Hospital Saket",
    description: "Max Super Speciality Hospital, Saket is a leading healthcare institution in Delhi NCR, known for its cutting-edge medical technology and patient-centric care.",
    address: {
      street: "1, 2, Press Enclave Road, Saket Institutional Area",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110017",
      coordinates: {
        latitude: 28.5244,
        longitude: 77.2066
      }
    },
    contact: {
      phone: "+91-11-26515050",
      emergencyPhone: "+91-11-26515000",
      email: "info@maxhealthcare.com",
      website: "https://www.maxhealthcare.in/saket"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Max Hospital Saket",
        isMain: true
      }
    ],
    specialties: [
      { name: "Robotic Surgery", description: "Minimally invasive robotic procedures" },
      { name: "Liver Transplant", description: "Advanced liver transplantation" },
      { name: "Spine Surgery", description: "Comprehensive spine care" }
    ],
    bedCapacity: {
      total: 500,
      available: 95,
      icu: 40,
      emergency: 20
    },
    ratings: {
      overall: 4.4,
      cleanliness: 4.6,
      staff: 4.2,
      equipment: 4.7,
      reviewCount: 3200
    },
    emergencyServices: {
      available: true,
      ambulanceService: true,
      traumaCenter: true
    },
    establishedYear: 2006,
    type: "private"
  },
  {
    name: "Medanta - The Medicity Gurgaon",
    description: "Medanta - The Medicity is one of India's largest multi-super specialty institutes located in Gurgaon, known for its world-class infrastructure and medical expertise.",
    address: {
      street: "Sector 38, Delhi - Jaipur Expressway",
      city: "Gurgaon",
      state: "Haryana",
      country: "India",
      zipCode: "122001",
      coordinates: {
        latitude: 28.4211,
        longitude: 76.9986
      }
    },
    contact: {
      phone: "+91-124-4141414",
      emergencyPhone: "+91-124-4141400",
      email: "info@medanta.org",
      website: "https://www.medanta.org"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Medanta Complex",
        isMain: true
      }
    ],
    specialties: [
      { name: "Heart Institute", description: "Comprehensive cardiac care" },
      { name: "Bone & Joint Institute", description: "Orthopedic excellence" },
      { name: "Cancer Institute", description: "Integrated cancer care" }
    ],
    bedCapacity: {
      total: 1250,
      available: 200,
      icu: 80,
      emergency: 35
    },
    ratings: {
      overall: 4.5,
      cleanliness: 4.7,
      staff: 4.3,
      equipment: 4.8,
      reviewCount: 5600
    },
    emergencyServices: {
      available: true,
      ambulanceService: true,
      traumaCenter: true
    },
    establishedYear: 2009,
    type: "private"
  }
];

const addSampleHospitals = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing hospitals
    await hospitalModel.deleteMany({});
    console.log("🗑️ Cleared existing hospitals");

    // Add sample hospitals
    for (const hospitalData of sampleHospitals) {
      const hospital = new hospitalModel(hospitalData);
      await hospital.save();
      console.log(`✅ Added hospital: ${hospital.name}`);
    }

    console.log("🎉 All sample hospitals added successfully!");
    console.log(`📊 Total hospitals: ${sampleHospitals.length}`);
    
  } catch (error) {
    console.error("❌ Error adding sample hospitals:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📤 Disconnected from MongoDB");
  }
};

// Run the script
addSampleHospitals();