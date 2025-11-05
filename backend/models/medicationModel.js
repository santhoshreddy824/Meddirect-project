import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Antibiotic", "Pain Relief", "Diabetes"
  price: { type: Number, required: true },
  description: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., "500mg", "10ml"
  instructions: { type: String, required: true },
  sideEffects: [{ type: String }],
  contraindications: [{ type: String }],
  manufacturer: { type: String, required: true },
  image: { type: String, default: "" },
  inStock: { type: Boolean, default: true },
  prescriptionRequired: { type: Boolean, default: true },
  dateAdded: { type: Date, default: Date.now }
}, { minimize: false });

const medicationModel = mongoose.model("Medication", medicationSchema);

export default medicationModel;
