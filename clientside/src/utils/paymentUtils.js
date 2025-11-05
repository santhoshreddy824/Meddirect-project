// paymentUtils.js

// Function to detect user's country based on browser language settings
export function detectUserCountry() {
  if (typeof navigator !== "undefined" && navigator.language) {
    // Example: 'en-US' -> returns 'US'
    const localeParts = navigator.language.split("-");
    return localeParts.length > 1 ? localeParts[1] : "US"; // default to 'US' if no country part found
  }
  return "US"; // fallback default country code
}
