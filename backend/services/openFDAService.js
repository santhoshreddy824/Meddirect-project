import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { searchLocalDatabase } from '../data/medicineDatabase.js';

dotenv.config();

// OpenFDA API service for getting medicine information
class OpenFDAService {
  constructor() {
    this.apiKey = process.env.OPENFDA_API_KEY;
    this.baseUrl = 'https://api.fda.gov';
  }

  // Clean text by removing excessive whitespace and HTML-like content
  cleanText(text) {
    if (!text) return null;
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
      .substring(0, 500); // Limit length
  }

  // Search medicine with improved patterns and error handling
  async searchMedicine(query) {
    try {
      console.log(`🔍 OpenFDA search for: ${query}`);
      
      // Common medicine name mappings
      const commonMedicines = {
        'aspirin': 'acetylsalicylic acid',
        'tylenol': 'acetaminophen',
        'advil': 'ibuprofen',
        'motrin': 'ibuprofen',
        'aleve': 'naproxen',
        'paracetamol': 'acetaminophen',
        'fever': 'acetaminophen OR ibuprofen',
        'pain': 'acetaminophen OR ibuprofen',
        'headache': 'acetaminophen OR ibuprofen'
      };
      
      const searchTerm = commonMedicines[query.toLowerCase()] || query;
      
      // Improved search patterns with better API key handling
      const searchPatterns = [
        // Brand name searches
        `openfda.brand_name:"${searchTerm}"`,
        `openfda.brand_name:${searchTerm}*`,
        
        // Generic name searches  
        `openfda.generic_name:"${searchTerm}"`,
        `openfda.generic_name:${searchTerm}*`,
        
        // Active ingredient searches
        `openfda.substance_name:"${searchTerm}"`,
        
        // Simple searches
        searchTerm.replace(/\s+/g, '+') // Replace spaces with +
      ];
      
      for (const pattern of searchPatterns) {
        try {
          // Build URL with proper API key parameter
          const url = `${this.baseUrl}/drug/label.json?search=${encodeURIComponent(pattern)}&limit=5${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
          console.log(`🔍 Trying pattern: ${pattern}`);
          
          const response = await fetch(url, { 
            timeout: 15000,
            headers: {
              'User-Agent': 'MedDirect-App/1.0'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const medicines = data.results.map(drug => ({
                name: drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || searchTerm,
                genericName: drug.openfda?.generic_name?.[0] || 'Not available',
                manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Not available',
                usage: this.cleanText(drug.indications_and_usage?.[0]) || 'No usage information available',
                dosage: this.cleanText(drug.dosage_and_administration?.[0]) || 'No dosage information available',
                warnings: this.cleanText(drug.warnings?.[0]) || 'No warnings data',
                contraindications: this.cleanText(drug.contraindications?.[0]) || 'No contraindications data',
                sideEffects: this.cleanText(drug.adverse_reactions?.[0]) || 'No side effects data',
                activeIngredient: drug.openfda?.substance_name?.[0] || drug.active_ingredient?.[0] || 'Not available',
                source: 'FDA'
              }));

              console.log(`✅ Found ${medicines.length} medicines with pattern: ${pattern}`);
              return { success: true, medicines };
            }
          } else if (response.status === 403) {
            console.log(`⚠️ API Key issue (403) for pattern: ${pattern}`);
            // Try without API key for public data
            if (this.apiKey) {
              const publicUrl = `${this.baseUrl}/drug/label.json?search=${encodeURIComponent(pattern)}&limit=5`;
              const publicResponse = await fetch(publicUrl, { 
                timeout: 15000,
                headers: {
                  'User-Agent': 'MedDirect-App/1.0'
                }
              });
              
              if (publicResponse.ok) {
                const data = await publicResponse.json();
                if (data.results && data.results.length > 0) {
                  const medicines = data.results.map(drug => ({
                    name: drug.openfda?.brand_name?.[0] || drug.openfda?.generic_name?.[0] || searchTerm,
                    genericName: drug.openfda?.generic_name?.[0] || 'Not available',
                    manufacturer: drug.openfda?.manufacturer_name?.[0] || 'Not available',
                    usage: this.cleanText(drug.indications_and_usage?.[0]) || 'No usage information available',
                    dosage: this.cleanText(drug.dosage_and_administration?.[0]) || 'No dosage information available',
                    warnings: this.cleanText(drug.warnings?.[0]) || 'No warnings data',
                    contraindications: this.cleanText(drug.contraindications?.[0]) || 'No contraindications data',
                    sideEffects: this.cleanText(drug.adverse_reactions?.[0]) || 'No side effects data',
                    activeIngredient: drug.openfda?.substance_name?.[0] || drug.active_ingredient?.[0] || 'Not available',
                    source: 'FDA'
                  }));
                  console.log(`✅ Found ${medicines.length} medicines without API key for pattern: ${pattern}`);
                  return { success: true, medicines };
                }
              }
            }
          } else {
            console.log(`⚠️ Pattern failed (${response.status}): ${pattern}`);
          }
        } catch (patternError) {
          console.log(`⚠️ Pattern error: ${patternError.message}`);
          continue;
        }
      }
      
      console.log(`❌ No medicines found in FDA API for: ${query}`);
      
      // Fallback to local database
      console.log(`🔍 Searching local database for: ${query}`);
      const localResults = searchLocalDatabase(query);
      
      if (localResults.success) {
        console.log(`✅ Found ${localResults.medicines.length} medicines in local database`);
        return { success: true, medicines: localResults.medicines };
      }
      
      return { success: false, error: 'Medicine not found in FDA database or local database' };
      
    } catch (error) {
      console.error('❌ OpenFDA service error:', error.message);
      return { success: false, error: 'Failed to fetch from FDA API' };
    }
  }

  // Test API connection
  async testConnection() {
    try {
      // Test with API key first
      let url = `${this.baseUrl}/drug/label.json?search=aspirin&limit=1`;
      if (this.apiKey) {
        url += `&api_key=${this.apiKey}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MedDirect-App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: 'OpenFDA API connection successful',
          resultCount: data.results?.length || 0,
          apiKeyUsed: !!this.apiKey
        };
      } else if (response.status === 403 && this.apiKey) {
        // Try without API key
        const publicResponse = await fetch(`${this.baseUrl}/drug/label.json?search=aspirin&limit=1`, {
          headers: {
            'User-Agent': 'MedDirect-App/1.0'
          }
        });
        
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          return { 
            success: true, 
            message: 'OpenFDA API connection successful (public access)',
            resultCount: data.results?.length || 0,
            apiKeyUsed: false,
            warning: 'API key may be invalid, using public access'
          };
        }
      }
      
      return { 
        success: false, 
        error: `API responded with status: ${response.status}`,
        fallbackAvailable: true,
        message: 'Local medicine database will be used as fallback'
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Connection failed: ${error.message}`,
        fallbackAvailable: true,
        message: 'Local medicine database will be used as fallback'
      };
    }
  }
}

export { OpenFDAService };