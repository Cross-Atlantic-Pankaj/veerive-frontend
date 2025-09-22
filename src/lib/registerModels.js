import mongoose, { Schema } from 'mongoose';

/**
 * Centralized model registration utility
 * Call this function in your API routes to ensure all models are properly registered
 */
export function registerModels() {
  // Register all models if not already registered
  if (!mongoose.models.Context) {
    const contextSchema = new Schema({
      contextTitle: { type: String, required: true },
      date: { type: Date, required: true },       
      isTrending: {type: Boolean, default: false},
      displayOrder: {type: Number, default: 0},
      sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector', required: true}],
      subSectors: [{ type: Schema.Types.ObjectId, ref: 'SubSector', required: false}],
      signalCategories: [{type: Schema.Types.ObjectId, ref: 'Signal', required: true}],
      signalSubCategories: [{type: Schema.Types.ObjectId, ref: 'SubSignal', required: false}],
      themes: [{ type: Schema.Types.ObjectId, ref: 'Theme', required: false }], 
      tileTemplates: [{ type: Schema.Types.ObjectId, ref: 'TileTemplate', required: false }],
      posts: [
        {
          postId: { type: Schema.Types.ObjectId, ref: 'Post', required: false },
          includeInContainer: { type: Boolean, default: true }
        }
      ],
      containerType: { 
        type: String, 
        enum: ['Type-Five', 'Type-Four', 'Type-Three', 'Type-Two', 'Type-One', 'Type-Num'], 
        default: 'Type-One', 
        required: [true, "containerType is required"] 
      },
      bannerShow: {type: Boolean, default: false},
      homePageShow: {type: Boolean, default: false},
      doNotPublish: {type: Boolean, default: false},
      bannerImage: {type: String, required: false},
      otherImage: {type: String, required: false},
      dataForTypeNum: { type: String, required: false },
      summary: { type: String, required: false },
      hasSlider: { type: Boolean, default: false },
      slide1: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide2: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide3: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide4: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide5: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide6: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide7: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide8: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide9: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide10: { title: { type: String, required: false }, description: { type: String, required: false } },   
      generalComment: { type: String, required: false },
      imageUrl: { type: String, required: false },
      pdfUrl: { type: String, required: false },
      pdfFile: {
        data: { type: Buffer, required: false },
        contentType: { type: String, required: false },
        fileName: { type: String, required: false },
        fileSize: { type: Number, required: false }
      },
      seoData: {
        seoURL: { type: String, required: false }, 
        metaTitle: { type: String, required: false },
        metaKeyword: { type: String, required: false },
        metaDescription: { type: Boolean, default: false },
        header: {},
        footer: {},
      },
    }, {timestamps: true});
    
    mongoose.model('Context', contextSchema);
  }
  
  // Register the lowercase 'contexts' model separately
  if (!mongoose.models.contexts) {
    const contextSchema = new Schema({
      contextTitle: { type: String, required: true },
      date: { type: Date, required: true },       
      isTrending: {type: Boolean, default: false},
      displayOrder: {type: Number, default: 0},
      sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector', required: true}],
      subSectors: [{ type: Schema.Types.ObjectId, ref: 'SubSector', required: false}],
      signalCategories: [{type: Schema.Types.ObjectId, ref: 'Signal', required: true}],
      signalSubCategories: [{type: Schema.Types.ObjectId, ref: 'SubSignal', required: false}],
      themes: [{ type: Schema.Types.ObjectId, ref: 'Theme', required: false }], 
      tileTemplates: [{ type: Schema.Types.ObjectId, ref: 'TileTemplate', required: false }],
      posts: [
        {
          postId: { type: Schema.Types.ObjectId, ref: 'Post', required: false },
          includeInContainer: { type: Boolean, default: true }
        }
      ],
      containerType: { 
        type: String, 
        enum: ['Type-Five', 'Type-Four', 'Type-Three', 'Type-Two', 'Type-One', 'Type-Num'], 
        default: 'Type-One', 
        required: [true, "containerType is required"] 
      },
      bannerShow: {type: Boolean, default: false},
      homePageShow: {type: Boolean, default: false},
      doNotPublish: {type: Boolean, default: false},
      bannerImage: {type: String, required: false},
      otherImage: {type: String, required: false},
      dataForTypeNum: { type: String, required: false },
      summary: { type: String, required: false },
      hasSlider: { type: Boolean, default: false },
      slide1: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide2: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide3: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide4: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide5: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide6: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide7: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide8: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide9: { title: { type: String, required: false }, description: { type: String, required: false } },
      slide10: { title: { type: String, required: false }, description: { type: String, required: false } },   
      generalComment: { type: String, required: false },
      imageUrl: { type: String, required: false },
      pdfUrl: { type: String, required: false },
      pdfFile: {
        data: { type: Buffer, required: false },
        contentType: { type: String, required: false },
        fileName: { type: String, required: false },
        fileSize: { type: Number, required: false }
      },
      seoData: {
        seoURL: { type: String, required: false }, 
        metaTitle: { type: String, required: false },
        metaKeyword: { type: String, required: false },
        metaDescription: { type: Boolean, default: false },
        header: {},
        footer: {},
      },
    }, {timestamps: true});
    
    mongoose.model('contexts', contextSchema);
  }
  
  if (!mongoose.models.Post) {
    const postSchema = new Schema({
      postTitle: { type: String, required: true },
      postType: { type: String, required: true },
      date: { type: Date, required: true },
      isTrending: { type: Boolean, default: false },
      summary: { type: String, required: false },
      sourceUrl: { type: String, required: false },
      sourceUrls: [{ type: String }],
      doNotPublish: { type: Boolean, default: false },
      contexts: [{ type: Schema.Types.ObjectId, ref: 'Context' }],
      source: { type: Schema.Types.ObjectId, ref: 'Source' },
      tileTemplateId: { type: Schema.Types.ObjectId, ref: 'TileTemplate' }
    }, {timestamps: true});
    
    mongoose.model('Post', postSchema);
  }
  
  if (!mongoose.models.Sector) {
    const sectorSchema = new Schema({
      sectorName: { type: String, required: true, unique: true }
    }, {timestamps: true});
    
    mongoose.model('Sector', sectorSchema);
  }
  
  if (!mongoose.models.SubSector) {
    const subSectorSchema = new Schema({
      subSectorName: { type: String, required: true },
      sectorId: { type: Schema.Types.ObjectId, ref: 'Sector', required: true }
    }, {timestamps: true});
    
    mongoose.model('SubSector', subSectorSchema);
  }
  
  if (!mongoose.models.Theme) {
    const themeSchema = new Schema({
      themeTitle: { type: String, required: true },
      themeDescription: { type: String, required: false },
      isTrending: { type: Boolean, default: false },
      overallScore: { type: Number, default: 0 },
      trendingScore: { type: Number, default: 0 },
      impactScore: { type: Number, default: 0 },
      predictiveMomentumScore: { type: Number, default: 0 },
      sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector' }],
      subSectors: [{ type: Schema.Types.ObjectId, ref: 'SubSector' }],
      doNotPublish: { type: Boolean, default: false },
      imageUrl: { type: String, required: false }
    }, {timestamps: true});
    
    mongoose.model('Theme', themeSchema);
  }
  
  if (!mongoose.models.Signal) {
    const signalSchema = new Schema({
      signalName: { type: String, required: true, unique: true }
    }, {timestamps: true});
    
    mongoose.model('Signal', signalSchema);
  }
  
  if (!mongoose.models.SubSignal) {
    const subSignalSchema = new Schema({
      subSignalName: { type: String, required: true },
      signalId: { type: Schema.Types.ObjectId, ref: 'Signal', required: true }
    }, {timestamps: true});
    
    mongoose.model('SubSignal', subSignalSchema);
  }
  
  if (!mongoose.models.Source) {
    const sourceSchema = new Schema({
      sourceName: { type: String, required: true, unique: true }
    }, {timestamps: true});
    
    mongoose.model('Source', sourceSchema);
  }
  
  if (!mongoose.models.SidebarMessage) {
    const sidebarMessageSchema = new Schema({
      title: { type: String, required: true },
      content: { type: String, required: true },
      isActive: { type: Boolean, default: true },
      acknowledgment: { type: String, required: false }
    }, {timestamps: true});
    
    mongoose.model('SidebarMessage', sidebarMessageSchema);
  }
  
  if (!mongoose.models.TileTemplate) {
    const tileTemplateSchema = new Schema({
      name: { type: String, required: true },
      type: { type: String, required: true },
      jsxCode: { type: String, required: false },
      backgroundColor: { type: String, required: false },
      previewBackgroundColor: { type: String, required: false },
      iconName: { type: String, required: false },
      iconColor: { type: String, required: false },
      iconSize: { type: Number, required: false }
    }, {timestamps: true});
    
    mongoose.model('TileTemplate', tileTemplateSchema);
  }
  
  if (!mongoose.models.Drivers) {
    const driversSchema = new Schema({
      driverName: { type: String, required: true }
    }, {timestamps: true});
    
    mongoose.model('Drivers', driversSchema);
  }
  
  if (!mongoose.models.Region) {
    const regionSchema = new Schema({
      regionName: { type: String, required: true }
    }, {timestamps: true});
    
    mongoose.model('Region', regionSchema);
  }
}
