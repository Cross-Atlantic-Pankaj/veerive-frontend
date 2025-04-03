// import mongoose from 'mongoose';

// const PostSchema = new mongoose.Schema({
//   postTitle: { type: String, required: true },
//   postType: { type: String, required: true },
//   postImage: { type: String },
//   date: { type: Date, required: true },
//   isTrending: { type: Boolean, default: false },
//   includeInContainer: { type: Boolean, default: false },
//   homePageShow: { type: Boolean, default: false },
//   countries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
//   summary: { type: String, required: true },
//   completeContent: { type: String, default: '' },
//   sentiment: { type: String, required: true },
//   primaryCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
//   secondaryCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
//   source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
//   sourceUrl: { type: String },
//   generalComment: { type: String, default: '' },
//   seoData: {
//     metaDescription: { type: Boolean, default: false }
//   },
//   contexts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Context' }],
// }, {
//   timestamps: true
// });

// export default mongoose.models.Post || mongoose.model('Post', PostSchema);

import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  postTitle: { type: String, required: true },
  postType: { type: String, required: true },
  postImage: { type: String },
  date: { type: Date, required: true },
  isTrending: { type: Boolean, default: false },
  includeInContainer: { type: Boolean, default: false },
  homePageShow: { type: Boolean, default: false },
  countries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
  summary: { type: String, required: true },
  completeContent: { type: String, default: '' },
  sentiment: { type: String, required: true },
  primaryCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  secondaryCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  sourceUrl: { type: String },
  sourceUrls: {
    type: mongoose.Schema.Types.Mixed, // Can accept both string and array
    validate: {
      validator: function(value) {
        // Ensure that sourceUrls is either a string or an array of strings
        return typeof value === 'string' || Array.isArray(value);
      },
      message: 'sourceUrls must be either a string or an array of strings.',
    },
    default: [], // Default to empty array if not provided
  },
  generalComment: { type: String, default: '' },
  seoData: {
    metaDescription: { type: Boolean, default: false }
  },
  contexts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Context' }],
}, {
  timestamps: true
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
