import { useState } from "react";
import PropTypes from "prop-types";
import { assets } from "../assets/assets";

// Map doctor image names to actual imported images
const doctorImages = {
  doc1: assets.doc1,
  doc2: assets.doc2,
  doc3: assets.doc3,
  doc4: assets.doc4,
  doc5: assets.doc5,
  doc6: assets.doc6,
  doc7: assets.doc7,
  doc8: assets.doc8,
  doc9: assets.doc9,
  doc10: assets.doc10,
  doc11: assets.doc11,
  doc12: assets.doc12,
  doc13: assets.doc13,
  doc14: assets.doc14,
  doc15: assets.doc15,
};

// Default fallback avatar for doctors
const DEFAULT_DOCTOR_AVATAR = assets.doc1;

const DoctorImage = ({ doctor, className = "", alt = "" }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Use local image if available by image name, otherwise use default
    return doctorImages[doctor.image] || DEFAULT_DOCTOR_AVATAR;
  });
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError && imgSrc !== DEFAULT_DOCTOR_AVATAR) {
      // Always fallback to default doctor avatar on error
      setImgSrc(DEFAULT_DOCTOR_AVATAR);
      setHasError(true); // Prevent infinite loop
    }
  };

  return (
    <img
      className={className}
      src={imgSrc}
      alt={alt || doctor.name}
      onError={handleImageError}
      style={{ objectFit: "cover" }}
      loading="lazy"
    />
  );
};

DoctorImage.propTypes = {
  doctor: PropTypes.object.isRequired,
  className: PropTypes.string,
  alt: PropTypes.string,
};

export default DoctorImage;
