export function requireOwner(req, res, next) {
  if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Owner access required' });
  }
  next();
}


