import { useState } from "react";
import PropTypes from "prop-types";
import { getLocalDoctorImage } from "../utils/doctorImageMapper";
import doc1 from "../assets/doc1.png"; // Default fallback image

const DoctorImage = ({ doctor, className = "", alt = "" }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Prefer explicit URLs (e.g., Cloudinary) when provided
    const img = doctor?.image;
    const isUrl = typeof img === "string" && /^(https?:)?\/\//.test(img);
    if (isUrl) return img;
    // Otherwise map to local image assets
    const localImage = getLocalDoctorImage(doctor || {});
    return localImage || doc1;
  });
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      // Fallback to a mapped local image first, then default
      const fallback = getLocalDoctorImage(doctor || {}) || doc1;
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    <img
      className={className}
      src={imgSrc}
      alt={alt || doctor.name}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

DoctorImage.propTypes = {
  doctor: PropTypes.shape({
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
  alt: PropTypes.string,
};

export default DoctorImage;
