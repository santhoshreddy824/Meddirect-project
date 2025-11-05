// Medicine API Service using RxNorm and OpenFDA APIs
const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';
const OPENFDA_BASE_URL = 'https://api.fda.gov/drug';

class MedicineAPI {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 30; // 30 minutes
  }

  // Get cached data or fetch new data
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }

  // Search for medicines using RxNorm
  async searchMedicines(searchTerm) {
    const cacheKey = `search_${searchTerm.toLowerCase()}`;
    
    return this.getCachedData(cacheKey, async () => {
      const response = await fetch(
        `${RXNORM_BASE_URL}/drugs.json?name=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      if (!data.drugGroup?.conceptGroup) {
        return [];
      }

      const results = [];
      for (const group of data.drugGroup.conceptGroup) {
        if (group.conceptProperties) {
          for (const concept of group.conceptProperties) {
            results.push({
              rxcui: concept.rxcui,
              name: concept.name,
              synonym: concept.synonym,
              tty: concept.tty,
              language: concept.language
            });
          }
        }
      }

      return results.slice(0, 10); // Limit to 10 results
    });
  }

  // Get detailed medicine information
  async getMedicineDetails(rxcui) {
    const cacheKey = `details_${rxcui}`;
    
    return this.getCachedData(cacheKey, async () => {
      const [basicInfo, properties, relatedDrugs, fdaLabel] = await Promise.all([
        this.getRxNormBasicInfo(rxcui),
        this.getRxNormProperties(rxcui),
        this.getRelatedDrugs(rxcui),
        this.getFDALabel(rxcui)
      ]);

      return {
        success: true,
        basicInfo,
        properties,
        relatedDrugs,
        fdaLabel,
        interactions: await this.getDrugInteractions(rxcui),
        classes: await this.getDrugClasses(rxcui)
      };
    });
  }

  // Get comprehensive medicine information (main function)
  async getComprehensiveMedicineInfo(rxcui, medicineName = null) {
    try {
      let targetRxcui = rxcui;
      
      // If no rxcui provided, search by name
      if (!rxcui && medicineName) {
        const searchResults = await this.searchMedicines(medicineName);
        if (searchResults.length > 0) {
          targetRxcui = searchResults[0].rxcui;
        } else {
          return { success: false, message: 'Medicine not found' };
        }
      }

      const details = await this.getMedicineDetails(targetRxcui);
      return details;
    } catch (error) {
      console.error('Error getting comprehensive medicine info:', error);
      return { success: false, message: error.message };
    }
  }

  // Get basic RxNorm information
  async getRxNormBasicInfo(rxcui) {
    try {
      const response = await fetch(`${RXNORM_BASE_URL}/rxcui/${rxcui}.json`);
      const data = await response.json();
      
      return {
        rxcui: rxcui,
        name: data.idGroup?.name || 'Unknown',
        tty: data.idGroup?.tty || 'Unknown'
      };
    } catch {
      return null;
    }
  }

  // Get RxNorm properties
  async getRxNormProperties(rxcui) {
    try {
      const response = await fetch(`${RXNORM_BASE_URL}/rxcui/${rxcui}/allProperties.json?prop=all`);
      const data = await response.json();
      
      if (data.propConceptGroup?.propConcept) {
        return data.propConceptGroup.propConcept.map(prop => ({
          propName: prop.propName,
          propValue: prop.propValue
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  // Get related drugs
  async getRelatedDrugs(rxcui) {
    try {
      const response = await fetch(`${RXNORM_BASE_URL}/rxcui/${rxcui}/related.json?tty=IN+PIN+BN+SBD+SCD`);
      const data = await response.json();
      
      const related = [];
      if (data.relatedGroup?.conceptGroup) {
        for (const group of data.relatedGroup.conceptGroup) {
          if (group.conceptProperties) {
            for (const concept of group.conceptProperties) {
              related.push({
                rxcui: concept.rxcui,
                name: concept.name,
                tty: concept.tty
              });
            }
          }
        }
      }
      return related.slice(0, 10);
    } catch {
      return [];
    }
  }

  // Get FDA label information
  async getFDALabel(rxcui) {
    try {
      // First get NDCs for the RxCUI
      const ndcResponse = await fetch(`${RXNORM_BASE_URL}/rxcui/${rxcui}/ndcs.json`);
      const ndcData = await ndcResponse.json();
      
      if (!ndcData.ndcGroup?.ndcList?.ndc || ndcData.ndcGroup.ndcList.ndc.length === 0) {
        return null;
      }

      // Get first NDC and query FDA
      const ndc = ndcData.ndcGroup.ndcList.ndc[0];
      const fdaResponse = await fetch(
        `${OPENFDA_BASE_URL}/label.json?search=openfda.package_ndc:"${ndc}"&limit=1`
      );
      
      if (!fdaResponse.ok) return null;
      
      const fdaData = await fdaResponse.json();
      
      if (fdaData.results && fdaData.results.length > 0) {
        const label = fdaData.results[0];
        return {
          brand_name: label.openfda?.brand_name,
          generic_name: label.openfda?.generic_name,
          manufacturer_name: label.openfda?.manufacturer_name,
          product_type: label.openfda?.product_type,
          route: label.openfda?.route,
          substance_name: label.openfda?.substance_name,
          dosage_form: label.openfda?.dosage_form,
          indications_and_usage: label.indications_and_usage,
          dosage_and_administration: label.dosage_and_administration,
          contraindications: label.contraindications,
          warnings: label.warnings,
          adverse_reactions: label.adverse_reactions,
          drug_interactions: label.drug_interactions
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Get drug interactions
  async getDrugInteractions(rxcui) {
    try {
      const response = await fetch(`${RXNORM_BASE_URL}/interaction/interaction.json?rxcui=${rxcui}`);
      const data = await response.json();
      
      if (data.interactionTypeGroup) {
        const interactions = [];
        for (const group of data.interactionTypeGroup) {
          if (group.interactionType) {
            for (const interaction of group.interactionType) {
              if (interaction.interactionPair) {
                for (const pair of interaction.interactionPair) {
                  interactions.push({
                    description: pair.description,
                    severity: pair.severity,
                    interactionConcept: pair.interactionConcept?.map(concept => ({
                      name: concept.minConceptItem?.name,
                      rxcui: concept.minConceptItem?.rxcui
                    }))
                  });
                }
              }
            }
          }
        }
        return interactions.slice(0, 5);
      }
      return [];
    } catch {
      return [];
    }
  }

  // Get drug classes
  async getDrugClasses(rxcui) {
    try {
      const response = await fetch(`${RXNORM_BASE_URL}/rxclass/class/byRxcui.json?rxcui=${rxcui}&relaSource=ATC`);
      const data = await response.json();
      
      if (data.rxclassDrugInfoList?.rxclassDrugInfo) {
        return data.rxclassDrugInfoList.rxclassDrugInfo.map(info => ({
          className: info.rxclassMinConceptItem?.className,
          classId: info.rxclassMinConceptItem?.classId
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  // Get popular medicines for quick access
  async getPopularMedicines() {
    const popularDrugs = [
      'aspirin', 'ibuprofen', 'acetaminophen', 'metformin', 'lisinopril',
      'atorvastatin', 'omeprazole', 'amoxicillin', 'levothyroxine', 'prednisone'
    ];

    const results = [];
    for (const drug of popularDrugs) {
      try {
        const searchResults = await this.searchMedicines(drug);
        if (searchResults.length > 0) {
          results.push(searchResults[0]);
        }
      } catch (error) {
        console.error(`Error fetching ${drug}:`, error);
      }
    }
    return results;
  }

  // Format dosage information
  formatDosage(medicineInfo) {
    if (medicineInfo.fdaLabel?.dosage_and_administration) {
      return medicineInfo.fdaLabel.dosage_and_administration[0];
    }
    return 'Consult healthcare provider for dosage information';
  }

  // Format warnings
  formatWarnings(medicineInfo) {
    const warnings = [];
    
    if (medicineInfo.fdaLabel?.warnings) {
      warnings.push(...medicineInfo.fdaLabel.warnings);
    }
    
    if (medicineInfo.fdaLabel?.contraindications) {
      warnings.push(...medicineInfo.fdaLabel.contraindications);
    }

    return warnings.length > 0 ? warnings : ['Consult healthcare provider'];
  }

  // Format side effects
  formatSideEffects(medicineInfo) {
    if (medicineInfo.fdaLabel?.adverse_reactions) {
      return medicineInfo.fdaLabel.adverse_reactions;
    }
    return ['Consult healthcare provider for side effect information'];
  }
}

const medicineAPI = new MedicineAPI();
export default medicineAPI;
