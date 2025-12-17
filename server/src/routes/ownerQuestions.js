import express from 'express';
import { Listing } from '../models/Listing.js';
import { Question } from '../models/QA.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/owner.js';

const router = express.Router();

// All questions for listings owned by current owner
router.get('/', requireAuth, requireOwner, async (req, res) => {
  try {
    const listings = await Listing.find({ createdBy: req.user._id }, { _id: 1 }).lean();
    const ids = listings.map((l) => l._id);
    const questions = await Question.find({ listing: { $in: ids } })
      .populate('listing', 'title city nearCampus')
      .populate('answers.author', 'name')
      .lean();
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load questions' });
  }
});

export default router;


