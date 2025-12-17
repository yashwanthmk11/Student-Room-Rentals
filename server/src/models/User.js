import mongoose from 'mongoose';

const lifestyleSchema = new mongoose.Schema(
  {
    sleepSchedule: { type: String, enum: ['early', 'normal', 'late'], default: 'normal' },
    studyHabits: { type: String, enum: ['quiet', 'flexible', 'group'], default: 'flexible' },
    cleanliness: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    foodPreference: { type: String, enum: ['veg', 'non-veg', 'mixed'], default: 'mixed' },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    introvertExtrovert: { type: String, enum: ['introvert', 'ambivert', 'extrovert'], default: 'ambivert' }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    college: { type: String, required: true },
    campus: { type: String },
    yearOfStudy: { type: Number },
    lifestyle: lifestyleSchema,
    isVerifiedStudent: { type: Boolean, default: false },
    verificationDocumentUrl: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: ['student', 'owner', 'admin'], default: 'student' },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }]
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model('User', userSchema);


