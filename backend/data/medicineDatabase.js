// Local medicine database for common symptoms and conditions
// This serves as a fallback when FDA API is unavailable

export const medicineDatabase = {
  // Fever medications
  fever: [
    {
      name: "Acetaminophen (Tylenol)",
      genericName: "Acetaminophen",
      manufacturer: "Johnson & Johnson",
      usage: "Reduces fever and relieves mild to moderate pain",
      dosage: "Adults: 325-650mg every 4-6 hours, not to exceed 3000mg per day",
      warnings: "Do not exceed recommended dose. May cause liver damage if used with alcohol",
      contraindications: "Severe liver disease, allergy to acetaminophen",
      sideEffects: "Rare: skin rash, swelling, difficulty breathing",
      activeIngredient: "Acetaminophen",
      source: "Local Database"
    },
    {
      name: "Ibuprofen (Advil, Motrin)",
      genericName: "Ibuprofen", 
      manufacturer: "Pfizer",
      usage: "Reduces fever, inflammation, and relieves pain",
      dosage: "Adults: 200-400mg every 4-6 hours, not to exceed 1200mg per day",
      warnings: "May increase risk of heart attack or stroke. Take with food",
      contraindications: "History of allergic reaction to NSAIDs, active stomach ulcers",
      sideEffects: "Stomach upset, nausea, dizziness, headache",
      activeIngredient: "Ibuprofen",
      source: "Local Database"
    },
    {
      name: "Aspirin",
      genericName: "Acetylsalicylic Acid",
      manufacturer: "Bayer",
      usage: "Reduces fever, inflammation, and relieves pain",
      dosage: "Adults: 325-650mg every 4 hours, not to exceed 4000mg per day",
      warnings: "Not for children under 16. May cause stomach bleeding",
      contraindications: "Children with viral infections, bleeding disorders",
      sideEffects: "Stomach irritation, nausea, ringing in ears",
      activeIngredient: "Acetylsalicylic Acid",
      source: "Local Database"
    }
  ],

  // Pain medications
  pain: [
    {
      name: "Acetaminophen (Tylenol)",
      genericName: "Acetaminophen",
      manufacturer: "Johnson & Johnson",
      usage: "Relieves mild to moderate pain and reduces fever",
      dosage: "Adults: 325-650mg every 4-6 hours, not to exceed 3000mg per day",
      warnings: "Do not exceed recommended dose. May cause liver damage if used with alcohol",
      contraindications: "Severe liver disease, allergy to acetaminophen",
      sideEffects: "Rare: skin rash, swelling, difficulty breathing",
      activeIngredient: "Acetaminophen",
      source: "Local Database"
    },
    {
      name: "Ibuprofen (Advil, Motrin)",
      genericName: "Ibuprofen",
      manufacturer: "Pfizer", 
      usage: "Relieves pain, reduces inflammation and fever",
      dosage: "Adults: 200-400mg every 4-6 hours, not to exceed 1200mg per day",
      warnings: "May increase risk of heart attack or stroke. Take with food",
      contraindications: "History of allergic reaction to NSAIDs, active stomach ulcers",
      sideEffects: "Stomach upset, nausea, dizziness, headache",
      activeIngredient: "Ibuprofen",
      source: "Local Database"
    }
  ],

  // Headache medications
  headache: [
    {
      name: "Acetaminophen (Tylenol)",
      genericName: "Acetaminophen",
      manufacturer: "Johnson & Johnson",
      usage: "Relieves headache and mild to moderate pain",
      dosage: "Adults: 325-650mg every 4-6 hours, not to exceed 3000mg per day",
      warnings: "Do not exceed recommended dose. May cause liver damage if used with alcohol",
      contraindications: "Severe liver disease, allergy to acetaminophen",
      sideEffects: "Rare: skin rash, swelling, difficulty breathing",
      activeIngredient: "Acetaminophen",
      source: "Local Database"
    },
    {
      name: "Ibuprofen (Advil, Motrin)",
      genericName: "Ibuprofen",
      manufacturer: "Pfizer",
      usage: "Relieves headache, reduces inflammation",
      dosage: "Adults: 200-400mg every 4-6 hours, not to exceed 1200mg per day", 
      warnings: "May increase risk of heart attack or stroke. Take with food",
      contraindications: "History of allergic reaction to NSAIDs, active stomach ulcers",
      sideEffects: "Stomach upset, nausea, dizziness, headache",
      activeIngredient: "Ibuprofen",
      source: "Local Database"
    },
    {
      name: "Excedrin",
      genericName: "Acetaminophen, Aspirin, Caffeine",
      manufacturer: "GSK",
      usage: "Relieves headache, especially tension and migraine headaches",
      dosage: "Adults: 2 tablets every 6 hours, not to exceed 8 tablets per day",
      warnings: "Contains caffeine. Not for children under 12",
      contraindications: "Bleeding disorders, severe liver disease",
      sideEffects: "Nervousness, trouble sleeping, stomach upset",
      activeIngredient: "Acetaminophen 250mg, Aspirin 250mg, Caffeine 65mg",
      source: "Local Database"
    }
  ],

  // Cough medications
  cough: [
    {
      name: "Robitussin DM",
      genericName: "Dextromethorphan",
      manufacturer: "GSK",
      usage: "Suppresses cough and loosens mucus",
      dosage: "Adults: 10-20mg every 4 hours, not to exceed 120mg per day",
      warnings: "Do not use with MAO inhibitors. May cause drowsiness",
      contraindications: "MAO inhibitor use within 14 days, chronic cough",
      sideEffects: "Drowsiness, dizziness, nausea",
      activeIngredient: "Dextromethorphan",
      source: "Local Database"
    },
    {
      name: "Mucinex",
      genericName: "Guaifenesin",
      manufacturer: "Reckitt Benckiser",
      usage: "Loosens mucus and thins bronchial secretions",
      dosage: "Adults: 200-400mg every 4 hours, not to exceed 2400mg per day",
      warnings: "Drink plenty of fluids. Do not crush extended-release tablets",
      contraindications: "Known allergy to guaifenesin",
      sideEffects: "Nausea, vomiting, stomach upset, drowsiness",
      activeIngredient: "Guaifenesin",
      source: "Local Database"
    }
  ],

  // Cold medications
  cold: [
    {
      name: "Sudafed",
      genericName: "Pseudoephedrine",
      manufacturer: "Johnson & Johnson",
      usage: "Relieves nasal congestion due to cold or allergies",
      dosage: "Adults: 30-60mg every 4-6 hours, not to exceed 240mg per day",
      warnings: "May increase blood pressure. Behind-the-counter purchase required",
      contraindications: "High blood pressure, heart disease, MAO inhibitor use",
      sideEffects: "Nervousness, restlessness, trouble sleeping",
      activeIngredient: "Pseudoephedrine",
      source: "Local Database"
    },
    {
      name: "Tylenol Cold & Flu",
      genericName: "Acetaminophen, Dextromethorphan, Phenylephrine",
      manufacturer: "Johnson & Johnson",
      usage: "Relieves cold and flu symptoms including fever, aches, cough",
      dosage: "Adults: 2 capsules every 6 hours, not to exceed 8 capsules per day",
      warnings: "Do not exceed recommended dose. Contains acetaminophen",
      contraindications: "Severe liver disease, MAO inhibitor use",
      sideEffects: "Drowsiness, nervousness, stomach upset",
      activeIngredient: "Acetaminophen 325mg, Dextromethorphan 15mg, Phenylephrine 5mg",
      source: "Local Database"
    }
  ],

  // Allergy medications
  allergy: [
    {
      name: "Benadryl",
      genericName: "Diphenhydramine",
      manufacturer: "Johnson & Johnson",
      usage: "Relieves allergy symptoms, itching, runny nose, sneezing",
      dosage: "Adults: 25-50mg every 4-6 hours, not to exceed 300mg per day",
      warnings: "May cause drowsiness. Do not drive or operate machinery",
      contraindications: "Enlarged prostate, glaucoma, breathing problems",
      sideEffects: "Drowsiness, dry mouth, blurred vision, constipation",
      activeIngredient: "Diphenhydramine",
      source: "Local Database"
    },
    {
      name: "Claritin",
      genericName: "Loratadine",
      manufacturer: "Bayer",
      usage: "Relieves allergy symptoms for 24 hours, non-drowsy formula",
      dosage: "Adults: 10mg once daily",
      warnings: "May interact with certain medications",
      contraindications: "Known allergy to loratadine",
      sideEffects: "Headache, drowsiness, fatigue, dry mouth",
      activeIngredient: "Loratadine",
      source: "Local Database"
    }
  ],

  // Stomach medications
  stomach: [
    {
      name: "Pepto-Bismol",
      genericName: "Bismuth Subsalicylate",
      manufacturer: "Procter & Gamble",
      usage: "Relieves upset stomach, diarrhea, nausea, heartburn",
      dosage: "Adults: 30ml or 2 tablets every 30-60 minutes, not to exceed 8 doses per day",
      warnings: "May temporarily darken tongue or stool. Contains salicylate",
      contraindications: "Allergy to salicylates, children with chickenpox or flu",
      sideEffects: "Darkened tongue or stool, constipation",
      activeIngredient: "Bismuth Subsalicylate",
      source: "Local Database"
    },
    {
      name: "Tums",
      genericName: "Calcium Carbonate",
      manufacturer: "GSK",
      usage: "Relieves heartburn, acid indigestion, sour stomach",
      dosage: "Adults: 2-4 tablets as symptoms occur, not to exceed 15 tablets per day",
      warnings: "Do not use maximum dosage for more than 2 weeks",
      contraindications: "Kidney stones, high calcium levels",
      sideEffects: "Constipation, gas, chalky taste",
      activeIngredient: "Calcium Carbonate",
      source: "Local Database"
    }
  ]
};

// Function to search local database
export function searchLocalDatabase(symptom) {
  const normalizedSymptom = symptom.toLowerCase().trim();
  
  // Direct matches
  if (medicineDatabase[normalizedSymptom]) {
    return {
      success: true,
      medicines: medicineDatabase[normalizedSymptom],
      source: 'Local Database'
    };
  }
  
  // Partial matches
  const partialMatches = [];
  for (const [key, medicines] of Object.entries(medicineDatabase)) {
    if (key.includes(normalizedSymptom) || normalizedSymptom.includes(key)) {
      partialMatches.push(...medicines);
    }
  }
  
  if (partialMatches.length > 0) {
    return {
      success: true,
      medicines: partialMatches,
      source: 'Local Database (Partial Match)'
    };
  }
  
  return {
    success: false,
    error: 'No medicines found in local database'
  };
}

export default { medicineDatabase, searchLocalDatabase };