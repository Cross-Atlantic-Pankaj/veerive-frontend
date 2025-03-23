import mongoose from 'mongoose';

const RegionSchema = new mongoose.Schema({
  regionName: { type: String, required: true },
});

export default mongoose.models.Region || mongoose.model('Region', RegionSchema);