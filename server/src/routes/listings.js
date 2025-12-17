import express from 'express';
import { Listing } from '../models/Listing.js';
import { Review } from '../models/Review.js';
import { Question } from '../models/QA.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Create listing
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const listing = await Listing.create({
      ...data,
      createdBy: req.user._id
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create listing' });
  }
});

// Search listings with filters including campus-time and max total cost
router.get('/', async (req, res) => {
  try {
    const {
      city,
      nearCampus,
      roomType,
      maxTotalCost,
      maxCommuteMinutes,
      genderPreference,
      amenities,
      sort
    } = req.query;

    const query = { isActive: true };
    if (city) query.city = city;
    if (nearCampus) query.nearCampus = nearCampus;
    if (roomType) query.roomType = roomType;
    if (genderPreference) query.genderPreference = genderPreference;
    if (maxCommuteMinutes) {
      query.commuteTimeToCampusMinutes = { $lte: Number(maxCommuteMinutes) };
    }

    if (amenities) {
      const list = Array.isArray(amenities) ? amenities : String(amenities).split(',');
      query.amenities = { $all: list.filter(Boolean) };
    }

    let listings = await Listing.find(query).lean();

    if (maxTotalCost) {
      const max = Number(maxTotalCost);
      listings = listings.filter((l) => {
        const c = l.cost || {};
        const total =
          (c.rent || 0) +
          (c.utilities || 0) +
          (c.internet || 0) +
          (c.maintenance || 0) +
          (c.other || 0);
        l.totalMonthlyCost = total;
        return total <= max;
      });
    } else {
      listings = listings.map((l) => {
        const c = l.cost || {};
        l.totalMonthlyCost =
          (c.rent || 0) +
          (c.utilities || 0) +
          (c.internet || 0) +
          (c.maintenance || 0) +
          (c.other || 0);
        return l;
      });
    }

    // Sorting
    if (sort === 'cost') {
      listings.sort((a, b) => (a.totalMonthlyCost || 0) - (b.totalMonthlyCost || 0));
    } else if (sort === 'commute') {
      listings.sort(
        (a, b) =>
          (a.commuteTimeToCampusMinutes || Number.MAX_SAFE_INTEGER) -
          (b.commuteTimeToCampusMinutes || Number.MAX_SAFE_INTEGER)
      );
    } else if (sort === 'safety') {
      listings.sort(
        (a, b) => (b.safety?.safetyRating || 0) - (a.safety?.safetyRating || 0)
      );
    }

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
});

// Get listing detail with reviews and Q&A
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('createdBy', 'name college')
      .lean();
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    const reviews = await Review.find({ listing: listing._id })
      .populate('author', 'name college')
      .lean();
    const questions = await Question.find({ listing: listing._id })
      .populate('answers.author', 'name college')
      .lean();

    res.json({ listing, reviews, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch listing' });
  }
});

// Add review
router.post('/:id/reviews', requireAuth, async (req, res) => {
  try {
    const { rating, title, body, stayedFrom, stayedTo, tags, wouldRecommend } = req.body;
    const review = await Review.create({
      listing: req.params.id,
      author: req.user._id,
      rating,
      title,
      body,
      stayedFrom,
      stayedTo,
      tags,
      wouldRecommend
    });
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add review' });
  }
});

// Anonymous Q&A
router.post('/:id/questions', requireAuth, async (req, res) => {
  try {
    const { body, isAnonymous = true } = req.body;
    const question = await Question.create({
      listing: req.params.id,
      body,
      isAnonymous,
      askedBy: isAnonymous ? null : req.user._id
    });
    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to post question' });
  }
});

router.post('/:listingId/questions/:questionId/answers', requireAuth, async (req, res) => {
  try {
    const { body, isCurrentTenant = false } = req.body;
    const question = await Question.findOne({
      _id: req.params.questionId,
      listing: req.params.listingId
    });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    question.answers.push({
      body,
      author: req.user._id,
      isCurrentTenant
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to post answer' });
  }
});

// Save / unsave listing for current user
router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const exists = user.savedListings?.some((lid) => String(lid) === String(id));
    if (!exists) {
      user.savedListings = [...(user.savedListings || []), id];
      await user.save();
    }
    res.json({ savedListings: user.savedListings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save listing' });
  }
});

router.delete('/:id/save', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    user.savedListings = (user.savedListings || []).filter(
      (lid) => String(lid) !== String(id)
    );
    await user.save();
    res.json({ savedListings: user.savedListings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to unsave listing' });
  }
});

router.get('/saved/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedListings').lean();
    const listings = (user?.savedListings || []).map((l) => {
      const c = l.cost || {};
      const total =
        (c.rent || 0) +
        (c.utilities || 0) +
        (c.internet || 0) +
        (c.maintenance || 0) +
        (c.other || 0);
      return { ...l, totalMonthlyCost: total };
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load saved listings' });
  }
});

export default router;


