import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import hospitalModel from './models/hospitalModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in backend/.env');

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const cursor = hospitalModel.find({}).cursor();
    let updated = 0;
    for await (const h of cursor) {
      const lat = h.address?.coordinates?.latitude;
      const lng = h.address?.coordinates?.longitude;
      const hasGeo = h.address?.location && Array.isArray(h.address.location.coordinates) && h.address.location.coordinates.length === 2;

      if (lat != null && lng != null && !hasGeo) {
        h.address.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        await h.save();
        updated += 1;
      }
    }
    console.log(`🛠️ Migrated ${updated} hospital(s) to GeoJSON location`);

    // Ensure index exists
    try {
      await hospitalModel.collection.createIndex({ 'address.location': '2dsphere' });
      console.log('✅ 2dsphere index on address.location ensured');
    } catch (idxErr) {
      console.warn('⚠️ Index creation warning:', idxErr.message);
    }

  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected');
  }
};

run();
