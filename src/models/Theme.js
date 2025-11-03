import {Schema, model} from 'mongoose'

const themeSchema = new Schema ({
    themeTitle: { type: String, required: true },
    themeDescription: { type: String, required: true },
    teaser: { type: String, required: false },
    methodology: { type: String, required: false },
    isTrending: {type: Boolean, default: false},
    doNotPublish: {type: Boolean, default: false},
    sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector', required: true}],
    subSectors: [{ type: Schema.Types.ObjectId, ref: 'SubSector', required: false}],
    overallScore: {type: Number, default: 0},
    trendingScore: {type: Number, default: 0},
    impactScore: {type: Number, default: 0},
    predictiveMomentumScore: {type: Number, default: 0},
    trendingScoreImage: {type: String},
    impactScoreImage: {type: String},
    predictiveMomentumScoreImage: {type: String},

    generalComment: { type: String, required: false },
    
    tileTemplateId: { type: Schema.Types.ObjectId, ref: 'TileTemplate', required: false },

    // New structured sections
    overviewSnapshot: {
        trendSnapshot: {
            trendSnapshotIcon: { type: String },
            trendSignificance: {
                content: { type: String }
            },
            potentialChallenges: {
                content: { type: String }
            }
        },
        marketMetrics: [{
            icon: { type: String },
            value: { type: String },
            text: { type: String }
        }]
    },

    trendAnalysis: {
        driversAndSignals: {
            keyDrivers: [{
                icon: { type: String },
                driverType: { type: Schema.Types.ObjectId, ref: 'Driver' },
                driverTitle: { type: String },
                description: { type: String }
            }],
            signalsInAction: [{
                logo: { type: String },
                title: { type: String },
                description: { type: String },
                initiative: {
                    description: { type: String }
                },
                strategicImperative: {
                    description: { type: String }
                }
            }]
        },
        impactAndOpinions: {
            title: {
                content: { type: String },
                explanation: { type: String }
            },
            disruptivePotential: {
                content: { type: String },
                value: { type: String }
            },
            trendMomentum: {
                content: { type: String },
                value: { type: String }
            }
        },
        regionalDynamics: {
            overallIcon: { type: String },
            regionalInsights: {
                overallSummary: { type: String },
                regions: [{
                    regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: false },
                    regionMapIcon: { type: String },
                    regionName: { type: String },
                    regionDescription: { type: String },
                    regionScore: { type: Number, default: 0 }
                }]
            }
        },
        consumerDynamics: {
            overallIcon: { type: String },
            behavioralInsights: [{
                heading: { type: String },
                icon: { type: String },
                text: { type: String }
            }],
            impactAnalyser: [{
                consumerSegmentName: { type: String },
                impactScore: { type: Number } // in percentage
            }]
        }
    },

    seoData: {
        seoURL: { type: String, required: false }, 
        metaTitle: { type: String, required: false },
        metaKeyword: { type: String, required: false },
        metaDescription: { type: Boolean, default: false },
        header: {},
        footer: {},
      },
}, {timestamps: true})

// Check if model is already compiled to prevent overwrite errors
let Theme;
try {
  Theme = model('Theme', themeSchema);
} catch (error) {
  // If model already exists, get it from mongoose
  const mongoose = require('mongoose');
  Theme = mongoose.models.Theme;
}

export default Theme