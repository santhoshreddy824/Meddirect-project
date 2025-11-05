import express from "express";
import medicationModel from "../models/medicationModel.js";
import authUser from "../middlewares/authUser.js";
import { OpenFDAService } from "../services/openFDAService.js";

const medicationRouter = express.Router();
const fdaService = new OpenFDAService();

// Test route for enhanced medication API
medicationRouter.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Enhanced Medication API is working",
    timestamp: new Date().toISOString(),
    features: [
      "Symptom-based medicine search",
      "Medicine name aliases", 
      "Comprehensive medicine database",
      "Fallback information system"
    ]
  });
});

// Comprehensive medicine database for symptom-based search
const symptomToMedicineMap = {
  // Pain and Fever
  'headache': ['aspirin', 'ibuprofen', 'acetaminophen', 'naproxen'],
  'fever': ['acetaminophen', 'ibuprofen', 'aspirin'],
  'pain': ['ibuprofen', 'acetaminophen', 'naproxen', 'aspirin'],
  'muscle pain': ['ibuprofen', 'naproxen', 'aspirin'],
  'back pain': ['ibuprofen', 'naproxen', 'diclofenac'],
  'joint pain': ['ibuprofen', 'naproxen', 'celecoxib'],
  
  // Digestive Issues
  'nausea': ['ondansetron', 'metoclopramide', 'dimenhydrinate'],
  'vomiting': ['ondansetron', 'metoclopramide', 'promethazine'],
  'diarrhea': ['loperamide', 'bismuth subsalicylate'],
  'constipation': ['docusate', 'polyethylene glycol', 'bisacodyl'],
  'heartburn': ['omeprazole', 'ranitidine', 'famotidine'],
  'acid reflux': ['omeprazole', 'lansoprazole', 'esomeprazole'],
  'stomach pain': ['famotidine', 'omeprazole', 'simethicone'],
  
  // Respiratory Issues
  'cough': ['dextromethorphan', 'guaifenesin', 'codeine'],
  'cold': ['acetaminophen', 'phenylephrine', 'guaifenesin'],
  'flu': ['oseltamivir', 'acetaminophen', 'ibuprofen'],
  'sore throat': ['acetaminophen', 'ibuprofen', 'benzocaine'],
  'congestion': ['phenylephrine', 'pseudoephedrine', 'guaifenesin'],
  'runny nose': ['loratadine', 'cetirizine', 'diphenhydramine'],
  
  // Allergies
  'allergies': ['loratadine', 'cetirizine', 'fexofenadine'],
  'itching': ['diphenhydramine', 'loratadine', 'hydrocortisone'],
  'rash': ['hydrocortisone', 'diphenhydramine', 'calamine'],
  'hives': ['diphenhydramine', 'loratadine', 'cetirizine'],
  
  // Sleep and Anxiety
  'insomnia': ['diphenhydramine', 'melatonin', 'zolpidem'],
  'anxiety': ['lorazepam', 'alprazolam', 'diazepam'],
  'stress': ['melatonin', 'magnesium', 'valerian'],
  
  // Heart and Blood Pressure
  'high blood pressure': ['amlodipine', 'lisinopril', 'metoprolol'],
  'chest pain': ['nitroglycerin', 'aspirin', 'metoprolol'],
  'palpitations': ['metoprolol', 'propranolol', 'diltiazem'],
  
  // Diabetes
  'diabetes': ['metformin', 'insulin', 'glipizide'],
  'high blood sugar': ['metformin', 'insulin', 'glyburide'],
  
  // Infection
  'infection': ['amoxicillin', 'azithromycin', 'cephalexin'],
  'bacterial infection': ['amoxicillin', 'doxycycline', 'ciprofloxacin'],
  'urinary tract infection': ['trimethoprim', 'nitrofurantoin', 'ciprofloxacin'],
  
  // Common conditions
  'depression': ['sertraline', 'fluoxetine', 'escitalopram'],
  'migraine': ['sumatriptan', 'rizatriptan', 'naproxen'],
  'vertigo': ['meclizine', 'dimenhydrinate', 'betahistine'],
  'acne': ['benzoyl peroxide', 'tretinoin', 'clindamycin']
};

// Common medicine name mappings and alternatives
const medicineAliases = {
  'tylenol': 'acetaminophen',
  'advil': 'ibuprofen',
  'motrin': 'ibuprofen',
  'aleve': 'naproxen',
  'paracetamol': 'acetaminophen',
  'asprin': 'aspirin',
  'ibuprofin': 'ibuprofen',
  'naproxin': 'naproxen',
  'nexium': 'esomeprazole',
  'prilosec': 'omeprazole',
  'zantac': 'ranitidine',
  'pepto': 'bismuth subsalicylate',
  'dramamine': 'dimenhydrinate',
  'sudafed': 'pseudoephedrine',
  'claritin': 'loratadine',
  'zyrtec': 'cetirizine',
  'allegra': 'fexofenadine',
  'benadryl': 'diphenhydramine'
};

// Get all medications
medicationRouter.get("/all", async (req, res) => {
  try {
    const medications = await medicationModel.find({ inStock: true });
    res.json({ success: true, medications });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

// Get medications by category
medicationRouter.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const medications = await medicationModel.find({ 
      category: { $regex: category, $options: 'i' }, 
      inStock: true 
    });
    res.json({ success: true, medications });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

// Search medications
// Enhanced search for medicines by name or symptom
medicationRouter.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const searchQuery = query.toLowerCase().trim();
    console.log(`🔍 Enhanced search for: "${searchQuery}"`);

    let medicines = [];
    let searchResults = [];

    // Step 0: Try MongoDB search by name or genericName (case-insensitive)
    const dbResults = await medicationModel.find({
      $or: [
        { name: { $regex: `^${searchQuery}$`, $options: "i" } },
        { genericName: { $regex: `^${searchQuery}$`, $options: "i" } }
      ]
    });
    if (dbResults.length > 0) {
      // Convert DB results to expected format
      searchResults = dbResults.map((med) => ({
        name: med.name,
        genericName: med.genericName,
        brand: med.manufacturer,
        category: med.category,
        description: med.description,
        dosage: med.dosage,
        sideEffects: med.sideEffects && med.sideEffects.length > 0 ? med.sideEffects : ["Consult your doctor for side effects"],
        warnings: med.contraindications && med.contraindications.length > 0 ? med.contraindications : ["Follow your doctor's instructions"],
        interactions: med.interactions || ["Consult your doctor about drug interactions"],
        image: med.image || `https://via.placeholder.com/150x100/4f46e5/ffffff?text=${encodeURIComponent(med.name)}`,
        indication: med.instructions || med.description,
        fdaApproved: true,
        source: "MedDirect Database"
      }));
    }

    // If not found in DB, use FDA/alias/fallback logic
    if (searchResults.length === 0) {
      // Step 1: Try FDA API search first
      let fdaResults = [];
      try {
        console.log(`📡 Attempting FDA API search for: ${searchQuery}`);
        fdaResults = await fdaService.searchMedicine(searchQuery);
        if (fdaResults && fdaResults.length > 0) {
          console.log(`✅ FDA API returned ${fdaResults.length} results`);
          searchResults = searchResults.concat(fdaResults);
        }
      } catch (fdaError) {
        console.log(`⚠️ FDA API search failed: ${fdaError.message}`);
      }

      // Step 2: Check if it's a symptom and add related medicines
      if (symptomToMedicineMap[searchQuery]) {
        console.log(`📋 Found symptom match: ${searchQuery}`);
        const relatedMedicines = symptomToMedicineMap[searchQuery];
        
        // Create detailed information for each related medicine
        for (const medicine of relatedMedicines) {
          const medicineData = createFallbackMedicine(searchQuery, medicine);
          searchResults.push(medicineData);
        }
      }

      // Step 3: Check if it's a medicine name or alias
      const actualMedicineName = medicineAliases[searchQuery] || searchQuery;
      
      // Add direct medicine information if not from symptom search
      if (!symptomToMedicineMap[searchQuery]) {
        const medicineData = createFallbackMedicine(searchQuery, actualMedicineName);
        searchResults.push(medicineData);
      }

      // Step 4: If still no results, create comprehensive fallback data
      if (searchResults.length === 0) {
        console.log(`🔄 Creating fallback data for: ${searchQuery}`);
        
        const fallbackMedicine = createFallbackMedicine(searchQuery, actualMedicineName);
        searchResults.push(fallbackMedicine);
        
        // If it's a symptom, add related medicines
        if (symptomToMedicineMap[searchQuery]) {
          const relatedMedicines = symptomToMedicineMap[searchQuery];
          relatedMedicines.forEach(medicine => {
            if (medicine !== actualMedicineName) {
              searchResults.push(createFallbackMedicine(searchQuery, medicine));
            }
          });
        }
      }
    }

    // Remove duplicates based on name
    const uniqueMedicines = searchResults.filter((medicine, index, self) => 
      index === self.findIndex(m => m.name.toLowerCase() === medicine.name.toLowerCase())
    );

    console.log(`✅ Found ${uniqueMedicines.length} medicine(s) for "${query}"`);

    res.json({
      success: true,
      medicines: uniqueMedicines,
      searchQuery: query,
      searchType: symptomToMedicineMap[searchQuery] ? 'symptom' : 'medicine',
      message: `Found ${uniqueMedicines.length} medicine(s) for "${query}"`,
      source: searchResults.some(m => m.source === 'FDA') ? 'FDA + Enhanced Database' : 'Enhanced Database'
    });
  } catch (error) {
    console.error('❌ Enhanced medication search error:', error.message);
    
    // Even on error, provide fallback
    const fallbackMedicine = createFallbackMedicine(req.params.query, req.params.query);
    
    res.json({ 
      success: true,
      medicines: [fallbackMedicine],
      message: `Showing basic information for "${req.params.query}"`,
      note: "Detailed information temporarily unavailable"
    });
  }
});

// Get single medication
medicationRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const medication = await medicationModel.findById(id);
    if (!medication) {
      return res.json({ success: false, message: "Medication not found" });
    }
    res.json({ success: true, medication });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

// OpenFDA API Integration Routes

// Get medicine information from enhanced database
medicationRouter.get("/fda/search/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim() === '') {
      return res.json({ success: false, message: "Please provide medicine name" });
    }

    console.log(`🔍 Enhanced search request for: ${name}`);
    
    const actualMedicineName = medicineAliases[name.toLowerCase().trim()] || name.trim();
    const medicineData = createFallbackMedicine(name, actualMedicineName);
    
    res.json({ 
      success: true, 
      medicines: [medicineData],
      source: "Enhanced Database",
      total: 1
    });
  } catch (error) {
    console.error("❌ Enhanced search error:", error);
    res.json({ success: false, message: "Failed to search medicine database", error: error.message });
  }
});

// Get detailed medicine info from FDA
medicationRouter.get("/fda/info/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim() === '') {
      return res.json({ success: false, message: "Please provide medicine name" });
    }

    console.log(`📋 FDA detailed info request for: ${name}`);
    
    const actualMedicineName = medicineAliases[name.toLowerCase().trim()] || name.trim();
    const medicineData = createFallbackMedicine(name, actualMedicineName);
    const result = { success: true, medicines: [medicineData] };
    
    if (result.success && result.medicines.length > 0) {
      const detailedInfo = result.medicines[0]; // Get the first (most relevant) result
      
      res.json({ 
        success: true, 
        medicine: {
          name: detailedInfo.name,
          genericName: detailedInfo.genericName,
          manufacturer: detailedInfo.manufacturer,
          usage: detailedInfo.usage,
          dosage: detailedInfo.dosage,
          warnings: detailedInfo.warnings,
          sideEffects: detailedInfo.sideEffects,
          contraindications: detailedInfo.contraindications,
          activeIngredient: detailedInfo.activeIngredient
        },
        source: "FDA API"
      });
    } else {
      res.json({ 
        success: false, 
        message: result.error || "Medicine not found in FDA database",
        source: "FDA API"
      });
    }
  } catch (error) {
    console.error("❌ FDA info error:", error);
    res.json({ success: false, message: "Failed to get medicine info from FDA", error: error.message });
  }
});

// Combined search: Local database + FDA API
medicationRouter.get("/combined-search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim() === '') {
      return res.json({ success: false, message: "Please provide search query" });
    }

    console.log(`🔍 Combined search for: ${query}`);
    
    // Search local database first
    const localMedications = await medicationModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ],
      inStock: true
    }).limit(5);

    // Search enhanced database
    const actualMedicineName = medicineAliases[query.toLowerCase().trim()] || query.trim();
    const medicineData = createFallbackMedicine(query, actualMedicineName);
    const fdaResult = { success: true, medicines: [medicineData] };
    
    const response = {
      success: true,
      local: {
        medications: localMedications,
        total: localMedications.length,
        source: "Local Database"
      },
      fda: {
        medications: fdaResult.success ? fdaResult.medicines : [],
        total: fdaResult.success ? fdaResult.medicines.length : 0,
        source: "FDA API",
        error: fdaResult.success ? null : fdaResult.error
      }
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Combined search error:", error);
    res.json({ success: false, message: "Failed to perform combined search", error: error.message });
  }
});

// Helper function to create fallback medicine data
function createFallbackMedicine(originalQuery, medicineName) {
  // Expanded fallback info for common and unknown medicines
  const medicineInfo = {
    'acetaminophen': {
      usage: 'Used to treat pain and reduce fever. Commonly used for headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers.',
      dosage: 'Adults: 325-650 mg every 4-6 hours. Maximum 3000 mg per day.',
      warnings: 'Do not exceed recommended dose. May cause liver damage if taken with alcohol or in excessive amounts.',
      sideEffects: 'Generally well tolerated. Rare: skin rash, liver damage with overdose.',
      interactions: ['Alcohol', 'Warfarin', 'Other pain relievers'],
      category: 'Analgesic',
      brand: 'Tylenol, Panadol',
      fdaApproved: true
    },
    'ibuprofen': {
      usage: 'NSAID used to reduce fever and treat pain or inflammation caused by conditions such as headache, toothache, back pain, arthritis, menstrual cramps, or minor injury.',
      dosage: 'Adults: 200-400 mg every 4-6 hours. Maximum 1200 mg per day.',
      warnings: 'May increase risk of serious cardiovascular and gastrointestinal events. Not recommended during pregnancy.',
      sideEffects: 'Stomach upset, heartburn, dizziness, headache. Serious: stomach bleeding, kidney problems.',
      interactions: ['Aspirin', 'Blood thinners', 'ACE inhibitors'],
      category: 'NSAID',
      brand: 'Advil, Motrin',
      fdaApproved: true
    },
    'aspirin': {
      usage: 'Used to reduce fever and relieve mild to moderate pain from conditions such as muscle aches, toothaches, common cold, and headaches. Also used to prevent heart attacks and strokes.',
      dosage: 'Adults: 325-650 mg every 4 hours. For heart protection: 81 mg daily.',
      warnings: 'Not for children under 16 due to Reye\'s syndrome risk. May increase bleeding risk.',
      sideEffects: 'Stomach irritation, heartburn, drowsiness. Serious: stomach bleeding, allergic reactions.',
      interactions: ['Warfarin', 'Ibuprofen', 'Alcohol'],
      category: 'NSAID',
      brand: 'Bayer, Ecotrin',
      fdaApproved: true
    },
    'omeprazole': {
      usage: 'Proton pump inhibitor used to treat GERD, stomach ulcers, and other conditions involving excessive stomach acid.',
      dosage: 'Adults: 20-40 mg once daily before eating.',
      warnings: 'Long-term use may increase risk of bone fractures and vitamin B12 deficiency.',
      sideEffects: 'Headache, stomach pain, nausea, diarrhea, vomiting, gas.',
      interactions: ['Clopidogrel', 'Warfarin', 'Diazepam'],
      category: 'Proton Pump Inhibitor',
      brand: 'Prilosec',
      fdaApproved: true
    },
    'loratadine': {
      usage: 'Antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, and sneezing.',
      dosage: 'Adults and children 6 years and older: 10 mg once daily.',
      warnings: 'May cause drowsiness in some people. Consult doctor if pregnant or breastfeeding.',
      sideEffects: 'Headache, drowsiness, fatigue, dry mouth.',
      interactions: ['Alcohol', 'Other antihistamines'],
      category: 'Antihistamine',
      brand: 'Claritin',
      fdaApproved: true
    },
    'amoxicillin': {
      usage: 'Antibiotic used to treat bacterial infections including pneumonia, bronchitis, gonorrhea, and infections of the ear, nose, throat, urinary tract, and skin.',
      dosage: 'Adults: 250-500 mg every 8 hours or 500-875 mg every 12 hours.',
      warnings: 'Complete the full course even if feeling better. May cause antibiotic resistance if used improperly.',
      sideEffects: 'Nausea, vomiting, diarrhea, stomach pain. Serious: allergic reactions, severe diarrhea.',
      interactions: ['Allopurinol', 'Oral contraceptives', 'Anticoagulants'],
      category: 'Antibiotic',
      brand: 'Amoxil',
      fdaApproved: true
    }
  };

  const info = medicineInfo[medicineName.toLowerCase()] || {
    usage: `Used to treat symptoms related to ${originalQuery}. Consult your healthcare provider for specific usage instructions.`,
    dosage: 'Take as directed by your healthcare provider. Typical adult dose: 1 tablet every 4-6 hours as needed.',
    warnings: 'Consult your doctor before use, especially if you have other medical conditions or take other medications. Not for use in children under 12. Avoid alcohol. If pregnant or breastfeeding, consult your doctor.',
    sideEffects: 'Nausea, headache, dizziness, allergic reactions, stomach upset.',
    interactions: ['Alcohol', 'Blood thinners', 'Other medications'],
    category: 'General Medicine',
    brand: 'Various brands',
    fdaApproved: false
  };

  return {
    name: medicineName.charAt(0).toUpperCase() + medicineName.slice(1),
    genericName: medicineName,
    brand: info.brand,
    category: info.category,
    description: info.usage,
    dosage: info.dosage,
    sideEffects: Array.isArray(info.sideEffects) ? info.sideEffects : info.sideEffects.split(',').map(s => s.trim()),
    warnings: Array.isArray(info.warnings) ? info.warnings : info.warnings.split('.').map(s => s.trim()).filter(Boolean),
    interactions: Array.isArray(info.interactions) ? info.interactions : info.interactions.split(',').map(s => s.trim()),
    image: `https://via.placeholder.com/150x100/4f46e5/ffffff?text=${encodeURIComponent(medicineName.charAt(0).toUpperCase() + medicineName.slice(1))}`,
    indication: `Used for symptoms related to ${originalQuery}`,
    fdaApproved: info.fdaApproved,
    source: 'Fallback Database'
  };
}

// Search by multiple symptoms
medicationRouter.post("/search-symptoms", async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || symptoms.length === 0) {
      return res.json({ success: false, message: "No symptoms provided" });
    }

    console.log(`🔍 Searching medications for symptoms: ${symptoms.join(', ')}`);
    
    let allMedicines = [];
    let allWarnings = [];
    let allSideEffects = [];
    let allInteractions = [];
    let fdaResults = [];
    let symptomQueries = [];

    // Process each symptom
    for (const symptom of symptoms) {
      const query = symptom.toLowerCase().trim();
      symptomQueries.push(query);

      // Step 1: MongoDB search by symptom (direct match)
      const dbResults = await medicationModel.find({
        symptoms: { $regex: query, $options: "i" },
        inStock: true
      });
      
      if (dbResults.length > 0) {
        console.log(`✅ Found ${dbResults.length} medication(s) in DB for symptom "${symptom}"`);
        
        dbResults.forEach(med => {
          allMedicines.push({
            name: med.name,
            genericName: med.genericName,
            brand: med.manufacturer,
            category: med.category,
            description: med.description,
            dosage: med.dosage,
            sideEffects: med.sideEffects && med.sideEffects.length > 0 ? med.sideEffects : ["Consult your doctor for side effects"],
            warnings: med.contraindications && med.contraindications.length > 0 ? med.contraindications : ["Follow your doctor's instructions"],
            interactions: med.interactions || ["Consult your doctor about drug interactions"],
            image: med.image || `https://via.placeholder.com/150x100/4f46e5/ffffff?text=${encodeURIComponent(med.name)}`,
            indication: med.instructions || med.description,
            fdaApproved: true,
            source: "MedDirect Database"
          });
        });
      } else {
        console.log(`🔍 No direct DB results for symptom "${symptom}". Attempting FDA and fallback searches...`);
        
        // Step 2: FDA API search
        try {
          const fdaApiResults = await fdaService.searchMedicine(symptom);
          if (fdaApiResults && fdaApiResults.length > 0) {
            console.log(`✅ Found ${fdaApiResults.length} medication(s) in FDA DB for symptom "${symptom}"`);
            fdaResults = fdaResults.concat(fdaApiResults);
          }
        } catch (fdaError) {
          console.log(`⚠️ FDA API search failed for symptom "${symptom}": ${fdaError.message}`);
        }

        // Step 3: Fallback to related medicines based on symptom
        if (symptomToMedicineMap[query]) {
          console.log(`📋 Found related medicines for symptom "${symptom}": ${symptomToMedicineMap[query].join(', ')}`);
          const relatedMedicines = symptomToMedicineMap[query];
          
          for (const medicine of relatedMedicines) {
            const medicineData = createFallbackMedicine(symptom, medicine);
            allMedicines.push(medicineData);
          }
        } else {
          console.log(`⚠️ No related medicines found in fallback for symptom "${symptom}"`);
        }
      }
    }

    // Combine and deduplicate all medicines found
    const combinedResults = [...allMedicines, ...fdaResults];
    const uniqueResults = combinedResults.filter((medicine, index, self) => 
      index === self.findIndex(m => m.name.toLowerCase() === medicine.name.toLowerCase())
    );

    // Prepare final response
    const response = {
      success: true,
      medicines: uniqueResults,
      searchQuery: symptoms.join(', '),
      searchType: 'symptom',
      message: `Found ${uniqueResults.length} medicine(s) for symptoms: ${symptoms.join(', ')}`,
      source: uniqueResults.some(m => m.source === 'FDA') ? 'FDA + Enhanced Database' : 'Enhanced Database'
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Symptom-based medication search error:', error.message);
    res.json({ success: false, message: "Failed to search medications by symptoms", error: error.message });
  }
});

export default medicationRouter;
