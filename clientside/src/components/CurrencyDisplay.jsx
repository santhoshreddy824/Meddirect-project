import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getLocalizedPricing, formatCurrency } from "../utils/currencyUtils";

const CurrencyDisplay = ({
  amount,
  tier = "standard",
  country = "IN",
  showConversion = true,
  showTierInfo = false,
  className = "",
}) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculatePricing = () => {
      try {
        setLoading(true);

        // Use tier if provided, otherwise use amount
        const pricingData = getLocalizedPricing(tier || amount, country);
        setPricing(pricingData);

        console.log("💰 Currency Display - Pricing calculated:", pricingData);
      } catch (error) {
        console.error("❌ Error calculating pricing:", error);
        // Fallback to basic INR pricing
        setPricing({
          amount: amount || 650,
          currency: "INR",
          symbol: "₹",
          formatted: `₹${amount || 650}`,
          inrEquivalent: amount || 650,
          inrFormatted: `₹${amount || 650}`,
          countryCode: "IN",
        });
      } finally {
        setLoading(false);
      }
    };

    calculatePricing();
  }, [amount, tier, country]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!pricing) {
    return <div className={`text-red-500 ${className}`}>Price unavailable</div>;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Main price display */}
      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold text-primary">
          {pricing.formatted}
        </span>

        {/* Indian market badge */}
        {country === "IN" && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            🇮🇳 India
          </span>
        )}
      </div>

      {/* Tier information */}
      {showTierInfo && pricing.tier && (
        <div className="text-sm text-gray-600">
          <div className="font-medium">{pricing.tier.name}</div>
          <div className="text-xs">{pricing.tier.description}</div>
        </div>
      )}

      {/* Conversion info for non-INR currencies */}
      {showConversion && country !== "IN" && pricing.inrEquivalent && (
        <div className="text-sm text-gray-500">
          Equivalent to {pricing.inrFormatted} in India
        </div>
      )}

      {/* Price range indicator for India */}
      {country === "IN" && (
        <div className="text-xs text-green-600">
          ✓ Within ₹500-1000 consultation range
        </div>
      )}
    </div>
  );
};

CurrencyDisplay.propTypes = {
  amount: PropTypes.number,
  tier: PropTypes.string,
  country: PropTypes.string,
  showConversion: PropTypes.bool,
  showTierInfo: PropTypes.bool,
  className: PropTypes.string,
};

export default CurrencyDisplay;
