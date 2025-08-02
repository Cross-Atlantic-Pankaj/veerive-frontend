import mongoose from 'mongoose';

const ContextSchema = new mongoose.Schema({
  contextTitle: { type: String, required: true },
  date: { type: Date, required: true },
  isTrending: { type: Boolean, default: false },
  sectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }],
  subSectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubSector' }],
  signalCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signal' }],
  signalSubCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubSignal' }],
  themes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Theme' }],
  posts: [{
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    includeInContainer: { type: Boolean, default: false }
  }],
  tileTemplates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TileTemplate' }],
  containerType: { type: String, required: true },
  bannerShow: { type: Boolean, default: false },
  homePageShow: { type: Boolean, default: false },
  bannerImage: { type: String, default: '' },
  otherImage: { type: String, default: '' },
  dataForTypeNum: { type: String, default: '' },
  summary: { type: String, default: '' },
  hasSlider: { type: Boolean, default: false },
  slide1: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide2: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide3: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide4: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide5: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide6: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide7: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide8: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide9: { title: { type: String, default: '' }, description: { type: String, default: '' } },
  slide10: { title: { type: String, default: '' } },
  generalComment: { type: String, default: '' },
  seoData: {
    metaDescription: { type: Boolean, default: false }
  },
  displayOrder: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Context = mongoose.models.Context || mongoose.model('Context', ContextSchema);
export default Context;