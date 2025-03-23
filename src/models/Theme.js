import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema({
  themeTitle: { type: String, required: true },
  themeDescription: { type: String, required: true },
  isTrending: { type: Boolean, default: false },
  sectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }],
  subSectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubSector' }],
  overallScore: { type: Number },
  trendingScore: { type: Number },
  impactScore: { type: Number },
  predictiveMomentumScore: { type: Number },
  trendingScoreImage: { type: String, default: '' },
  impactScoreImage: { type: String, default: '' },
  predictiveMomentumScoreImage: { type: String, default: '' },
  generalComment: { type: String, default: '' },
  seoData: {
    metaDescription: { type: Boolean, default: false }
  },
}, {
  timestamps: true
});

export default mongoose.models.Theme || mongoose.model('Theme', ThemeSchema);