import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';

const generateToken = (id, role = 'customer') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'meetha_pani_super_secret_jwt_key_2026_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ============ ADMIN AUTH ============

export const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password' });
    }

    const admin = await Admin.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }],
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id, admin.role);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (req.body.fullName) admin.fullName = req.body.fullName;
    if (req.body.email) admin.email = req.body.email.toLowerCase();
    if (req.body.password) admin.password = req.body.password;

    await admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============ CUSTOMER AUTH ============

export const customerRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please log in.' });
    }

    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      address: address || {},
    });

    const token = generateToken(customer._id, 'customer');

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (customer.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(customer._id, 'customer');

    res.json({
      success: true,
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      customer: req.customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (req.body.name) customer.name = req.body.name;
    if (req.body.phone) customer.phone = req.body.phone;
    if (req.body.address) customer.address = { ...customer.address, ...req.body.address };
    if (req.body.password) customer.password = req.body.password;

    await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    });
  } catch (error) {
    next(error);
  }
};
