import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'dairyflow-super-secure-production-secret-2026';

export const ROLES = {
  SUPER_ADMIN: 'Owner / Super Admin',
  FARM_MANAGER: 'Farm Manager',
  ACCOUNTANT: 'Accountant',
  VET_STAFF: 'Veterinary Staff',
  FARM_WORKER: 'Farm Worker',
  VIEWER: 'Read-only Viewer'
};

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }

    // Owner / Super Admin always has full access
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: `Access denied. Your role '${req.user.role}' lacks permission for this action.`
    });
  };
}
