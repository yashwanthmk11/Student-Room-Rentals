import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isCurrentTenant: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    body: { type: String, required: true },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // can be null for anonymous
    isAnonymous: { type: Boolean, default: true },
    answers: [answerSchema]
  },
  { timestamps: true }
);

export const Question = mongoose.model('Question', questionSchema);


