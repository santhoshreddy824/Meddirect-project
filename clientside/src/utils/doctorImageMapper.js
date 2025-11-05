import doc1 from '../assets/doc1.png'
import doc2 from '../assets/doc2.png'
import doc3 from '../assets/doc3.png'
import doc4 from '../assets/doc4.png'
import doc5 from '../assets/doc5.png'
import doc6 from '../assets/doc6.png'
import doc7 from '../assets/doc7.png'
import doc8 from '../assets/doc8.png'
import doc9 from '../assets/doc9.png'
import doc10 from '../assets/doc10.png'
import doc11 from '../assets/doc11.png'
import doc12 from '../assets/doc12.png'
import doc13 from '../assets/doc13.png'
import doc14 from '../assets/doc14.png'
import doc15 from '../assets/doc15.png'

// Default fallback image for all doctors
export const DEFAULT_DOCTOR_IMAGE = doc1;

// Array of all available doctor images for random assignment
const doctorImages = [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15];

// Map doctor image names to their corresponding local images
const doctorImageMap = {
  doc1: doc1,
  doc2: doc2,
  doc3: doc3,
  doc4: doc4,
  doc5: doc5,
  doc6: doc6,
  doc7: doc7,
  doc8: doc8,
  doc9: doc9,
  doc10: doc10,
  doc11: doc11,
  doc12: doc12,
  doc13: doc13,
  doc14: doc14,
  doc15: doc15,
};

// Map doctor names to their corresponding local images (for backward compatibility)
const doctorNameImageMap = {
  "Dr. Richard James": doc1,
  "Dr. Emily Larson": doc2,
  "Dr. Sarah Patel": doc3,
  "Dr. Michael Brown": doc4,
  "Dr. Jennifer Wilson": doc5,
  "Dr. David Chen": doc6,
  "Dr. Lisa Thompson": doc7,
  "Dr. Robert Kumar": doc8,
  "Dr. Maria Garcia": doc9,
  "Dr. James Lee": doc10,
  "Dr. Amanda White": doc11,
  "Dr. Kevin O'Connor": doc12,
  "Dr. Rachel Green": doc13,
  "Dr. Thomas Anderson": doc14,
  "Dr. Sophie Martin": doc15,
};

// Function to get local image for a doctor
export const getLocalDoctorImage = (doctor) => {
  // First try image reference (doc1, doc2, etc.)
  if (doctor.image && doctorImageMap[doctor.image]) {
    return doctorImageMap[doctor.image];
  }
  
  // Then try name match
  if (doctor.name && doctorNameImageMap[doctor.name]) {
    return doctorNameImageMap[doctor.name];
  }
  
  // If no match, assign a consistent image based on name hash
  // This ensures the same doctor always gets the same image
  const doctorName = doctor.name || 'Unknown Doctor';
  let hash = 0;
  for (let i = 0; i < doctorName.length; i++) {
    const char = doctorName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get consistent index
  const imageIndex = Math.abs(hash) % doctorImages.length;
  return doctorImages[imageIndex];
};

// Function to enhance doctors data with local images
export const enhanceDoctorsWithLocalImages = (doctors) => {
  return doctors.map(doctor => {
    // Keep the original image reference, don't override it
    // The actual image resolution will happen in the component
    return {
      ...doctor,
      // Only set default if no image is provided
      image: doctor.image || 'doc1'
    };
  });
};

export default doctorImageMap;
