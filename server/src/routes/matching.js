import express from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Very simple lifestyle-based compatibility score between 0 and 1
function computeCompatibilityScore(a, b) {
  if (!a || !b) return 0;
  let score = 0;
  let total = 0;

  const fields = [
    'sleepSchedule',
    'studyHabits',
    'cleanliness',
    'foodPreference',
    'introvertExtrovert'
  ];

  fields.forEach((field) => {
    total += 1;
    if (a[field] && b[field] && a[field] === b[field]) score += 1;
  });

  // soft match on smoking / drinking (prefer same)
  ['smoking', 'drinking'].forEach((field) => {
    total += 1;
    if (typeof a[field] === 'boolean' && typeof b[field] === 'boolean') {
      if (a[field] === b[field]) score += 1;
    }
  });

  return total ? score / total : 0;
}

router.get('/roommates', requireAuth, async (req, res) => {
  try {
    const current = req.user;
    const others = await User.find({
      _id: { $ne: current._id },
      college: current.college
    }).lean();

    const results = others
      .map((u) => ({
        user: {
          _id: u._id,
          name: u.name,
          college: u.college,
          campus: u.campus,
          lifestyle: u.lifestyle
        },
        score: computeCompatibilityScore(current.lifestyle || {}, u.lifestyle || {})
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
});

export default router;


