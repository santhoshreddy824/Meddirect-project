import { useState } from "react";
import PropTypes from "prop-types";
import { getLocalDoctorImage } from "../utils/doctorImageMapper";
import doc1 from "../assets/doc1.png"; // Default fallback image

const DoctorImage = ({ doctor, className = "", alt = "" }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Use the doctor object to get the appropriate local image
    const localImage = getLocalDoctorImage(doctor);
    return localImage || doc1;
  });
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError && imgSrc !== doc1) {
      // Always fallback to default doctor image on error
      setImgSrc(doc1);
      setHasError(true); // Prevent infinite loop
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
