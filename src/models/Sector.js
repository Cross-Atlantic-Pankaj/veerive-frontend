import mongoose from 'mongoose';

const SectorSchema = new mongoose.Schema({
  sectorName: { type: String, required: true },
  generalComment: { type: String, default: '' },
}, {
  timestamps: true
});

const Sector = mongoose.models.Sector || mongoose.model('Sector', SectorSchema);
export default Sector;