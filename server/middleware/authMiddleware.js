import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';

export const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no admin token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meetha_pani_super_secret_jwt_key_2026_production');
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin account not found or deactivated' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

export const protectCustomer = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, please login to continue' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meetha_pani_super_secret_jwt_key_2026_production');
    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer account not found' });
    }
    if (customer.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'This account has been suspended' });
    }
    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};

export const optionalCustomer = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meetha_pani_super_secret_jwt_key_2026_production');
      const customer = await Customer.findById(decoded.id).select('-password');
      if (customer && customer.status === 'active') {
        req.customer = customer;
      }
    } catch {
      // Continue as guest
    }
  }
  next();
};
