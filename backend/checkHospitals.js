import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Hospital from './models/hospitalModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in backend/.env');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const hospitals = await Hospital.find({}).limit(50).lean();
    console.log(`Found ${hospitals.length} hospitals:`);
    hospitals.forEach(h => console.log(`- ${h._id}  ${h.name}`));
  } catch (err) {
    console.error('Error checking hospitals:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
