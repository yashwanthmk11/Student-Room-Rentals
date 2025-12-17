import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String },
    body: { type: String },
    stayedFrom: { type: Date },
    stayedTo: { type: Date },
    wouldRecommend: { type: Boolean, default: true },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

export const Review = mongoose.model('Review', reviewSchema);


