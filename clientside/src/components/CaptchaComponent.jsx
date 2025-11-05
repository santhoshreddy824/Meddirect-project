import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const CaptchaComponent = ({ onVerify, onExpired, onError }) => {
  const [isVerified, setIsVerified] = useState(false);
  const recaptchaRef = useRef(null);

  // Use a test site key for development - replace with your actual site key
  const SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key

  const handleCaptchaChange = (token) => {
    if (token) {
      setIsVerified(true);
      onVerify && onVerify(token);
    } else {
      setIsVerified(false);
      onExpired && onExpired();
    }
  };

  const handleCaptchaError = () => {
    setIsVerified(false);
    onError && onError();
  };

  const resetCaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setIsVerified(false);
  };

  return (
    <div className="captcha-container">
      <div className="mb-4">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={SITE_KEY}
          onChange={handleCaptchaChange}
          onExpired={handleCaptchaError}
          onError={handleCaptchaError}
          theme="light"
          size="normal"
        />
      </div>

      {isVerified && (
        <div className="flex items-center text-green-600 text-sm mb-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          CAPTCHA verified successfully
        </div>
      )}
    </div>
  );
};

export default CaptchaComponent;
