import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    verifiedByStudent: { type: Boolean, default: false },
    verifierUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastVerifiedAt: { type: Date },
    notes: { type: String }
  },
  { _id: false }
);

const safetyScoreSchema = new mongoose.Schema(
  {
    safetyRating: { type: Number, min: 1, max: 5 },
    convenienceRating: { type: Number, min: 1, max: 5 },
    noiseLevel: { type: Number, min: 1, max: 5 },
    comments: { type: String }
  },
  { _id: false }
);

const costSchema = new mongoose.Schema(
  {
    rent: { type: Number, required: true },
    utilities: { type: Number, default: 0 },
    internet: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    locality: { type: String },
    nearCampus: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    roomType: { type: String, enum: ['private', 'shared', 'pg', 'hostel'], required: true },
    availableBeds: { type: Number, default: 1 },
    totalBeds: { type: Number, default: 1 },
    genderPreference: { type: String, enum: ['any', 'male', 'female'], default: 'any' },
    amenities: [{ type: String }],
    cost: costSchema,
    commuteTimeToCampusMinutes: { type: Number }, // campus-time search
    verification: verificationSchema,
    safety: safetyScoreSchema,
    media: [mediaSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Listing = mongoose.model('Listing', listingSchema);


