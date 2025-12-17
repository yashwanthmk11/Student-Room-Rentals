import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Listing } from '../models/Listing.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/owner.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get all listings for current owner
router.get('/listings', requireAuth, requireOwner, async (req, res) => {
  try {
    const listings = await Listing.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load owner listings' });
  }
});

// Create listing
router.post('/listings', requireAuth, requireOwner, async (req, res) => {
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

// Update listing (only if it belongs to this owner)
router.put('/listings/:id', requireAuth, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

// Soft delete / deactivate listing
router.delete('/listings/:id', requireAuth, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ message: 'Listing deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to deactivate listing' });
  }
});

// Upload media (images/videos) for a listing
router.post(
  '/listings/:id/media',
  requireAuth,
  requireOwner,
  upload.array('files', 6),
  async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findOne({ _id: id, createdBy: req.user._id });
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      const files = req.files || [];
      files.forEach((file) => {
        const f = file;
        const ext = path.extname(f.originalname).toLowerCase();
        const isVideo = ['.mp4', '.mov', '.webm'].includes(ext);
        listing.media.push({
          url: `/uploads/${f.filename}`,
          type: isVideo ? 'video' : 'image',
          uploadedBy: req.user._id
        });
      });

      await listing.save();
      res.status(201).json(listing);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload media' });
    }
  }
);

export default router;


