import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cron from 'node-cron';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { db } from './db.js';
import { SMSService } from './smsService.js';
import { authenticate, authorizeRoles, JWT_SECRET, ROLES } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads (prescriptions, animal photos, receipts)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

/* ============================================================
   1. AUTHENTICATION & USER MANAGEMENT
============================================================ */

// User Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const users = db.get('farm_users');
  const user = users.find(u => u.username === username || u.email === username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  if (user.status === 'Inactive') {
    return res.status(403).json({ error: 'Your account is currently inactive. Contact your farm administrator.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  // Update last login
  db.update('farm_users', u => u.id === user.id, { last_login: new Date().toISOString() });
  db.logAudit(user.id, user.username, 'LOGIN_SUCCESS', 'Auth', `User logged in from ${req.ip || 'remote'}`);

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      mobile_number: user.mobile_number,
      status: user.status
    }
  });
});

// User Signup / Self-Registration
app.post('/api/auth/signup', (req, res) => {
  const { full_name, username, email, mobile_number, password, role } = req.body;

  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ error: 'Full name, username, email, and password are required.' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.getOne('farm_users', u =>
    (u.username && u.username.toLowerCase() === normalizedUsername) ||
    (u.email && u.email.toLowerCase() === normalizedEmail)
  );

  if (existing) {
    return res.status(400).json({
      error: existing.username && existing.username.toLowerCase() === normalizedUsername
        ? 'Username is already taken. Please choose another.'
        : 'An account with this email already exists.'
    });
  }

  const validRoles = [
    'Owner / Super Admin',
    'Farm Manager',
    'Accountant',
    'Veterinary Staff',
    'Farm Worker',
    'Read-only Viewer'
  ];

  const assignedRole = validRoles.includes(role) ? role : 'Farm Manager';
  const newId = `USR-${String((db.get('farm_users').length + 1)).padStart(3, '0')}`;
  const password_hash = bcrypt.hashSync(password, 10);

  const newUser = {
    id: newId,
    full_name: full_name.trim(),
    username: username.trim(),
    email: normalizedEmail,
    mobile_number: (mobile_number || '').trim(),
    password_hash,
    role: assignedRole,
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  db.insert('farm_users', newUser);
  db.logAudit(newUser.id, newUser.username, 'SIGNUP_SUCCESS', 'Auth', `New user registered with role ${assignedRole}`);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role, full_name: newUser.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    message: 'Account created successfully!',
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      mobile_number: newUser.mobile_number,
      status: newUser.status
    }
  });
});

// Current User Profile
app.get('/api/auth/me', authenticate, (req, res) => {
  const user = db.getOne('farm_users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    mobile_number: user.mobile_number,
    status: user.status
  });
});

// First-time Admin Setup check
app.get('/api/setup/status', (req, res) => {
  const users = db.get('farm_users') || [];
  const hasOwner = users.some(u => u.role === ROLES.SUPER_ADMIN);
  res.json({
    setupCompleted: hasOwner,
    totalUsers: users.length
  });
});

// Admin User Management: List Users
app.get('/api/users', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER), (req, res) => {
  const users = db.get('farm_users').map(u => ({
    id: u.id,
    full_name: u.full_name,
    username: u.username,
    email: u.email,
    mobile_number: u.mobile_number,
    role: u.role,
    status: u.status,
    last_login: u.last_login,
    created_at: u.created_at
  }));
  res.json(users);
});

// Create User (Admin Only)
app.post('/api/users', authenticate, authorizeRoles(ROLES.SUPER_ADMIN), (req, res) => {
  const { full_name, username, email, mobile_number, password, role } = req.body;

  if (!full_name || !username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const existing = db.getOne('farm_users', u => u.username === username || u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'A user with this username or email already exists.' });
  }

  const newId = `USR-${String((db.get('farm_users').length + 1)).padStart(3, '0')}`;
  const password_hash = bcrypt.hashSync(password, 10);

  const newUser = {
    id: newId,
    full_name,
    username,
    email,
    mobile_number: mobile_number || '',
    password_hash,
    role,
    status: 'Active',
    last_login: null,
    created_at: new Date().toISOString()
  };

  db.insert('farm_users', newUser);
  db.logAudit(req.user.id, req.user.username, 'USER_CREATED', 'User Management', `Created account ${username} with role ${role}`);

  res.status(201).json({
    id: newUser.id,
    full_name: newUser.full_name,
    username: newUser.username,
    email: newUser.email,
    mobile_number: newUser.mobile_number,
    role: newUser.role,
    status: newUser.status,
    created_at: newUser.created_at
  });
});

// Update User (Admin Only)
app.put('/api/users/:id', authenticate, authorizeRoles(ROLES.SUPER_ADMIN), (req, res) => {
  const { full_name, email, mobile_number, role, status } = req.body;
  const updated = db.update('farm_users', u => u.id === req.params.id, {
    full_name,
    email,
    mobile_number,
    role,
    status
  });

  if (!updated) return res.status(404).json({ error: 'User not found' });
  db.logAudit(req.user.id, req.user.username, 'USER_UPDATED', 'User Management', `Updated user ${updated.username}`);

  res.json(updated);
});

// Reset User Password (Admin Only)
app.post('/api/users/:id/reset-password', authenticate, authorizeRoles(ROLES.SUPER_ADMIN), (req, res) => {
  const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'New password is required' });

  const password_hash = bcrypt.hashSync(new_password, 10);
  const updated = db.update('farm_users', u => u.id === req.params.id, { password_hash });
  if (!updated) return res.status(404).json({ error: 'User not found' });

  db.logAudit(req.user.id, req.user.username, 'PASSWORD_RESET', 'User Management', `Reset password for ${updated.username}`);
  res.json({ message: `Password for ${updated.username} reset successfully.` });
});

/* ============================================================
   2. BUFFALO MANAGEMENT
============================================================ */

// List Buffaloes
app.get('/api/buffaloes', authenticate, (req, res) => {
  const { status, breed, search } = req.query;
  let list = db.get('buffaloes');

  if (status && status !== 'All') {
    list = list.filter(b => b.status === status);
  }
  if (breed && breed !== 'All') {
    list = list.filter(b => b.breed === breed);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.tag_number && b.tag_number.toLowerCase().includes(q))
    );
  }

  res.json(list);
});

// Single Buffalo Detailed Profile
app.get('/api/buffaloes/:id', authenticate, (req, res) => {
  const bfl = db.getOne('buffaloes', b => b.id === req.params.id);
  if (!bfl) return res.status(404).json({ error: 'Buffalo not found' });

  // Gather associated breeding, health, production, and financial records
  const inseminations = db.get('buffalo_insemination_records').filter(r => r.buffalo_id === bfl.id);
  const pregnancies = db.get('buffalo_pregnancy_records').filter(r => r.buffalo_id === bfl.id);
  const calvings = db.get('buffalo_calving_records').filter(r => r.buffalo_id === bfl.id);
  const dewormings = db.get('animal_deworming_records').filter(r => r.animal_id === bfl.id);
  const dewormingSchedules = db.get('animal_deworming_schedules').filter(r => r.animal_id === bfl.id);
  const vaccinations = db.get('animal_vaccination_records').filter(r => r.animal_id === bfl.id);
  const medications = db.get('animal_medications').filter(r => r.animal_id === bfl.id);
  const vetVisits = db.get('veterinary_visits').filter(r => r.animal_id === bfl.id);
  const vetBills = db.get('veterinary_bills').filter(r => r.animal_id === bfl.id);
  const calves = db.get('calves').filter(c => c.mother_buffalo_id === bfl.id);

  // Calculate total medical expenses for this buffalo
  const totalMedicalExpenses = vetBills.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

  res.json({
    ...bfl,
    breeding_history: {
      inseminations,
      pregnancies,
      calvings,
      total_pregnancies: pregnancies.length,
      successful_deliveries: calvings.length,
      current_active_pregnancy: pregnancies.find(p => p.is_active) || null
    },
    health_history: {
      dewormings,
      deworming_schedules: dewormingSchedules,
      vaccinations,
      medications,
      veterinary_visits: vetVisits,
      veterinary_bills: vetBills,
      total_medical_expenses: totalMedicalExpenses
    },
    calves_born: calves,
    production_history: {
      morning_milk: bfl.morning_milk || 0,
      evening_milk: bfl.evening_milk || 0,
      daily_total: bfl.current_milk_production || 0,
      monthly_estimated: (bfl.current_milk_production || 0) * 30,
      lactation_number: bfl.lactation_number || 1
    }
  });
});

// Chronological Buffalo Timeline
app.get('/api/buffaloes/:id/timeline', authenticate, (req, res) => {
  const bfl = db.getOne('buffaloes', b => b.id === req.params.id);
  if (!bfl) return res.status(404).json({ error: 'Buffalo not found' });

  const timeline = [];

  // Birth or Purchase
  if (bfl.purchase_date) {
    timeline.push({
      date: bfl.purchase_date,
      type: 'Purchase',
      title: 'Acquired into DairyFlow Herd',
      description: `Purchased from ${bfl.supplier_details || 'Verified Breeder'} for ₹${bfl.purchase_price?.toLocaleString('en-IN')}`,
      badge: 'Acquisition'
    });
  }

  // Inseminations
  db.get('buffalo_insemination_records')
    .filter(r => r.buffalo_id === bfl.id)
    .forEach(i => {
      timeline.push({
        date: i.insemination_date,
        type: 'Insemination',
        title: `Artificial Insemination (${i.bull_breed})`,
        description: `Straw: ${i.semen_straw_id || 'N/A'}, Tech: ${i.technician_name}. ${i.remarks || ''}`,
        badge: 'Breeding'
      });
    });

  // Pregnancy Confirmations
  db.get('buffalo_pregnancy_records')
    .filter(r => r.buffalo_id === bfl.id)
    .forEach(p => {
      timeline.push({
        date: p.pregnancy_confirmation_date,
        type: 'Pregnancy',
        title: `Pregnancy Confirmation: ${p.pregnancy_test_result}`,
        description: `Stage: ${p.pregnancy_stage}. Expected Calving: ${p.expected_calving_date}. ${p.vet_recommendations || ''}`,
        badge: 'Pregnancy'
      });
    });

  // Calvings
  db.get('buffalo_calving_records')
    .filter(r => r.buffalo_id === bfl.id)
    .forEach(c => {
      timeline.push({
        date: c.actual_delivery_date,
        type: 'Calving',
        title: `Calving Delivery (${c.calf_gender} Calf - ${c.calf_id || 'CLF'})`,
        description: `Delivery: ${c.delivery_type}, Weight: ${c.birth_weight} kg. ${c.notes || ''}`,
        badge: 'Delivery'
      });
    });

  // Dewormings
  db.get('animal_deworming_records')
    .filter(r => r.animal_id === bfl.id)
    .forEach(d => {
      timeline.push({
        date: d.deworming_date,
        type: 'Deworming',
        title: `Deworming Administered: ${d.medicine_name}`,
        description: `Dosage: ${d.dosage}, Doctor: ${d.vet_doctor}. Next recommended: ${d.next_recommended_date}`,
        badge: 'Health'
      });
    });

  // Medications
  db.get('animal_medications')
    .filter(r => r.animal_id === bfl.id)
    .forEach(m => {
      timeline.push({
        date: m.treatment_date,
        type: 'Medication',
        title: `Treatment: ${m.disease_issue}`,
        description: `Medicine: ${m.medicine_name} (${m.medicine_dosage}), Status: ${m.status}`,
        badge: 'Veterinary'
      });
    });

  // Sort descending by date
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(timeline);
});

// Register Buffalo
app.post('/api/buffaloes', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const count = db.get('buffaloes').length + 1;
  const newId = req.body.id || `BFL-${String(count).padStart(3, '0')}`;

  const buffalo = {
    id: newId,
    name: req.body.name || `Buffalo ${newId}`,
    tag_number: req.body.tag_number || `DF-${newId}`,
    photo_url: req.body.photo_url || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
    breed: req.body.breed || 'Murrah',
    date_of_birth: req.body.date_of_birth || '',
    age_years: Number(req.body.age_years) || 4,
    purchase_date: req.body.purchase_date || new Date().toISOString().split('T')[0],
    purchase_price: Number(req.body.purchase_price) || 0,
    supplier_details: req.body.supplier_details || '',
    current_health_status: req.body.current_health_status || 'Healthy',
    current_milk_production: Number(req.body.current_milk_production) || 0,
    morning_milk: Number(req.body.morning_milk) || 0,
    evening_milk: Number(req.body.evening_milk) || 0,
    lactation_number: Number(req.body.lactation_number) || 1,
    breeding_status: req.body.breeding_status || 'Open',
    pregnancy_status: req.body.pregnancy_status || 'Not Pregnant',
    last_calving_date: req.body.last_calving_date || '',
    previous_medical_history: req.body.previous_medical_history || '',
    notes: req.body.notes || '',
    status: req.body.status || 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.insert('buffaloes', buffalo);
  db.logAudit(req.user.id, req.user.username, 'BUFFALO_REGISTERED', 'Buffalo Management', `Registered buffalo ${buffalo.id} (${buffalo.name})`);

  res.status(201).json(buffalo);
});

// Update Buffalo
app.put('/api/buffaloes/:id', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const updates = { ...req.body, updated_at: new Date().toISOString() };
  delete updates.id; // protect ID

  const updated = db.update('buffaloes', b => b.id === req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Buffalo not found' });

  db.logAudit(req.user.id, req.user.username, 'BUFFALO_UPDATED', 'Buffalo Management', `Updated buffalo ${req.params.id}`);
  res.json(updated);
});

/* ============================================================
   3. BREEDING & PREGNANCY MONITORING
============================================================ */

// List Inseminations
app.get('/api/breeding/inseminations', authenticate, (req, res) => {
  const { buffalo_id } = req.query;
  let records = db.get('buffalo_insemination_records');
  if (buffalo_id) {
    records = records.filter(r => r.buffalo_id === buffalo_id);
  }
  res.json(records);
});

// Record Semen / Artificial Insemination
app.post('/api/breeding/inseminations', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const {
    buffalo_id,
    insemination_date,
    insemination_time,
    semen_date,
    semen_batch_details,
    semen_straw_id,
    bull_breed,
    technician_name,
    veterinary_center,
    insemination_cost,
    remarks
  } = req.body;

  if (!buffalo_id || !insemination_date) {
    return res.status(400).json({ error: 'Buffalo ID and Insemination Date are required.' });
  }

  const newRecord = {
    id: `INS-${Date.now().toString().slice(-6)}`,
    buffalo_id,
    insemination_date,
    insemination_time: insemination_time || '07:30 AM',
    semen_date: semen_date || '',
    semen_batch_details: semen_batch_details || '',
    semen_straw_id: semen_straw_id || '',
    bull_breed: bull_breed || 'Murrah Elite',
    technician_name: technician_name || 'Veterinary Doctor',
    veterinary_center: veterinary_center || 'Farm Clinic',
    insemination_cost: Number(insemination_cost) || 0,
    remarks: remarks || '',
    created_at: new Date().toISOString()
  };

  db.insert('buffalo_insemination_records', newRecord);

  // Update buffalo breeding status (DO NOT auto-mark as pregnant, only Inseminated)
  db.update('buffaloes', b => b.id === buffalo_id, {
    breeding_status: 'Inseminated',
    updated_at: new Date().toISOString()
  });

  db.logAudit(req.user.id, req.user.username, 'INSEMINATION_RECORDED', 'Breeding', `Recorded AI for Buffalo ${buffalo_id}`);
  res.status(201).json(newRecord);
});

// List Pregnancies
app.get('/api/breeding/pregnancies', authenticate, (req, res) => {
  const { buffalo_id, is_active } = req.query;
  let records = db.get('buffalo_pregnancy_records');
  if (buffalo_id) {
    records = records.filter(r => r.buffalo_id === buffalo_id);
  }
  if (is_active !== undefined) {
    records = records.filter(r => r.is_active === (is_active === 'true'));
  }
  res.json(records);
});

// Record Pregnancy Confirmation
app.post('/api/breeding/pregnancies', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const {
    buffalo_id,
    insemination_id,
    pregnancy_confirmation_date,
    pregnancy_test_result,
    veterinary_examination,
    pregnancy_stage,
    gestation_days_setting,
    expected_calving_date,
    pregnancy_complications,
    vet_recommendations
  } = req.body;

  if (!buffalo_id || !pregnancy_confirmation_date || !pregnancy_test_result) {
    return res.status(400).json({ error: 'Buffalo ID, confirmation date, and test result are required.' });
  }

  const isPositive = pregnancy_test_result === 'Positive';
  const gestationDays = Number(gestation_days_setting) || 310;

  // Compute estimated delivery date if not provided
  let calcExpectedCalving = expected_calving_date;
  if (!calcExpectedCalving && isPositive) {
    // Look up insemination date if linked
    const ai = insemination_id ? db.getOne('buffalo_insemination_records', r => r.id === insemination_id) : null;
    const baseDate = ai ? new Date(ai.insemination_date) : new Date(pregnancy_confirmation_date);
    const est = new Date(baseDate.getTime() + (gestationDays * 24 * 60 * 60 * 1000));
    calcExpectedCalving = est.toISOString().split('T')[0];
  }

  const newRecord = {
    id: `PREG-${Date.now().toString().slice(-6)}`,
    buffalo_id,
    insemination_id: insemination_id || null,
    pregnancy_confirmation_date,
    pregnancy_test_result,
    veterinary_examination: veterinary_examination || 'Per-rectal palpation',
    pregnancy_stage: pregnancy_stage || (isPositive ? 'First Trimester (1-3 Mo)' : 'Not Applicable'),
    gestation_days_setting: gestationDays,
    expected_calving_date: isPositive ? calcExpectedCalving : null,
    actual_delivery_date: null,
    pregnancy_complications: pregnancy_complications || 'None',
    vet_recommendations: vet_recommendations || '',
    is_active: isPositive,
    created_at: new Date().toISOString()
  };

  db.insert('buffalo_pregnancy_records', newRecord);

  // Update buffalo status
  if (isPositive) {
    db.update('buffaloes', b => b.id === buffalo_id, {
      pregnancy_status: 'Confirmed Pregnant',
      breeding_status: 'Pregnancy Confirmed',
      status: 'Pregnant',
      updated_at: new Date().toISOString()
    });
  } else {
    db.update('buffaloes', b => b.id === buffalo_id, {
      pregnancy_status: 'Not Pregnant',
      breeding_status: 'Open',
      updated_at: new Date().toISOString()
    });
  }

  db.logAudit(req.user.id, req.user.username, 'PREGNANCY_RECORDED', 'Breeding', `Recorded pregnancy check: ${pregnancy_test_result} for ${buffalo_id}`);
  res.status(201).json(newRecord);
});

// Update Pregnancy Record
app.put('/api/breeding/pregnancies/:id', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const updated = db.update('buffalo_pregnancy_records', p => p.id === req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Record not found' });
  res.json(updated);
});

// Record Calving / Delivery (Automates 6 actions!)
app.post('/api/breeding/calvings', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const {
    buffalo_id,
    actual_delivery_date,
    delivery_type,
    calf_born,
    calf_gender,
    calf_name,
    birth_weight,
    health_condition,
    veterinary_assistance,
    delivery_expenses,
    notes
  } = req.body;

  if (!buffalo_id || !actual_delivery_date) {
    return res.status(400).json({ error: 'Buffalo ID and Actual Delivery Date are required.' });
  }

  const mother = db.getOne('buffaloes', b => b.id === buffalo_id);
  if (!mother) return res.status(404).json({ error: 'Mother buffalo not found.' });

  // Generate Calf ID
  const calfCount = db.get('calves').length + 1;
  const newCalfId = `CLF-${String(calfCount).padStart(3, '0')}`;

  const calvingRecord = {
    id: `CALV-${Date.now().toString().slice(-6)}`,
    buffalo_id,
    actual_delivery_date,
    delivery_type: delivery_type || 'Normal delivery',
    calf_born: calf_born !== false,
    calf_gender: calf_gender || 'Female',
    calf_id: calf_born !== false ? newCalfId : null,
    birth_weight: Number(birth_weight) || 32.0,
    health_condition: health_condition || 'Healthy, vigorous',
    veterinary_assistance: veterinary_assistance || 'Veterinarian Assisted',
    delivery_expenses: Number(delivery_expenses) || 0,
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  db.insert('buffalo_calving_records', calvingRecord);

  // 1. Update Buffalo's Calving History & Lactation
  const newLactation = (Number(mother.lactation_number) || 0) + 1;
  db.update('buffaloes', b => b.id === buffalo_id, {
    last_calving_date: actual_delivery_date,
    lactation_number: newLactation,
    pregnancy_status: 'Delivered',
    breeding_status: 'Calved',
    status: 'Lactating',
    updated_at: new Date().toISOString()
  });

  // 2. Mark active pregnancy records as completed/inactive
  const activePreg = db.getOne('buffalo_pregnancy_records', p => p.buffalo_id === buffalo_id && p.is_active);
  if (activePreg) {
    db.update('buffalo_pregnancy_records', p => p.id === activePreg.id, {
      is_active: false,
      actual_delivery_date,
      pregnancy_stage: 'Delivered'
    });
  }

  // 3 & 4. Auto-register new calf and connect to mother
  let createdCalf = null;
  if (calf_born !== false) {
    createdCalf = {
      id: newCalfId,
      name: calf_name || `${mother.name}'s Calf`,
      photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
      mother_buffalo_id: buffalo_id,
      father_info: `AI Lineage from mother ${buffalo_id}`,
      gender: calf_gender || 'Female',
      breed: mother.breed || 'Murrah',
      birth_date: actual_delivery_date,
      birth_weight: Number(birth_weight) || 32.0,
      current_weight: Number(birth_weight) || 32.0,
      health_status: 'Healthy',
      birth_condition: 'Normal',
      feeding_method: 'Mother Milk / Colostrum',
      vaccination_status: 'Pending',
      deworming_status: 'Due Soon',
      notes: `Born to Buffalo ${mother.id} (${mother.name}) via ${delivery_type || 'Normal delivery'}.`,
      status: 'Active',
      created_at: new Date().toISOString()
    };
    db.insert('calves', createdCalf);

    // Initial birth weight record
    db.insert('calf_growth_records', {
      id: `GRW-${Date.now().toString().slice(-6)}`,
      calf_id: newCalfId,
      measurement_date: actual_delivery_date,
      current_weight: Number(birth_weight) || 32.0,
      height: 65,
      weight_gain_since_last: 0,
      health_observations: `Birth assessment: ${health_condition || 'Healthy'}`,
      feeding_observations: 'Received colostrum immediately post-birth.',
      notes: 'Initial birth entry',
      created_at: new Date().toISOString()
    });

    // Schedule 1st deworming in 21 days for newborn calf
    const dewormDue = new Date(new Date(actual_delivery_date).getTime() + (21 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    db.insert('animal_deworming_schedules', {
      id: `DWS-${Date.now().toString().slice(-6)}`,
      animal_type: 'Calf',
      animal_id: newCalfId,
      animal_name: createdCalf.name,
      scheduled_date: dewormDue,
      medicine_recommended: 'Pyrantel Pamoate or Piperazine syrup',
      dosage_recommended: 'As prescribed by veterinarian',
      status: 'Scheduled',
      completed_record_id: null,
      sms_reminders_sent: [],
      created_at: new Date().toISOString()
    });
  }

  // 5. If delivery expenses entered, add to farm expense (exactly once)
  if (Number(delivery_expenses) > 0) {
    db.insert('farm_expenses', {
      id: `EXP-CALV-${Date.now().toString().slice(-6)}`,
      expense_date: actual_delivery_date,
      category: 'Veterinary & Medicine',
      description: `Calving & Veterinary assistance for Buffalo ${buffalo_id} (${mother.name})`,
      amount: Number(delivery_expenses),
      payment_mode: 'Cash',
      vendor: veterinary_assistance || 'Veterinary Assistance',
      reference_id: calvingRecord.id,
      is_medical_bill: true
    });
  }

  db.logAudit(req.user.id, req.user.username, 'CALVING_RECORDED', 'Breeding', `Calving recorded for ${buffalo_id}. New calf ${newCalfId} registered.`);

  res.status(201).json({
    calving: calvingRecord,
    calf: createdCalf,
    mother_updated: true
  });
});

/* ============================================================
   4. SEPARATE CALF MANAGEMENT MODULE
============================================================ */

// List Calves
app.get('/api/calves', authenticate, (req, res) => {
  const { gender, breed, health_status, search } = req.query;
  let list = db.get('calves');

  if (gender && gender !== 'All') {
    list = list.filter(c => c.gender === gender);
  }
  if (breed && breed !== 'All') {
    list = list.filter(c => c.breed === breed);
  }
  if (health_status && health_status !== 'All') {
    list = list.filter(c => c.health_status === health_status);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.mother_buffalo_id && c.mother_buffalo_id.toLowerCase().includes(q))
    );
  }

  res.json(list);
});

// Single Calf Profile
app.get('/api/calves/:id', authenticate, (req, res) => {
  const calf = db.getOne('calves', c => c.id === req.params.id);
  if (!calf) return res.status(404).json({ error: 'Calf not found' });

  // Gather growth records, feeding records, health, mother details
  const mother = calf.mother_buffalo_id ? db.getOne('buffaloes', b => b.id === calf.mother_buffalo_id) : null;
  const growth = db.get('calf_growth_records').filter(g => g.calf_id === calf.id);
  const feeding = db.get('calf_feeding_records').filter(f => f.calf_id === calf.id);
  const dewormings = db.get('animal_deworming_records').filter(d => d.animal_id === calf.id);
  const dewormingSchedules = db.get('animal_deworming_schedules').filter(s => s.animal_id === calf.id);
  const vaccinations = db.get('animal_vaccination_records').filter(v => v.animal_id === calf.id);
  const medications = db.get('animal_medications').filter(m => m.animal_id === calf.id);
  const vetBills = db.get('veterinary_bills').filter(b => b.animal_id === calf.id);

  // Growth calculations
  growth.sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date));
  const totalWeightGain = growth.length > 1
    ? (growth[growth.length - 1].current_weight - growth[0].current_weight)
    : 0;

  const totalMedicalExpenses = vetBills.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

  res.json({
    ...calf,
    mother_details: mother,
    growth_history: growth,
    feeding_history: feeding,
    deworming_history: dewormings,
    deworming_schedules: dewormingSchedules,
    vaccinations,
    medications,
    veterinary_bills: vetBills,
    total_medical_expenses: totalMedicalExpenses,
    total_weight_gain: totalWeightGain
  });
});

// Register Calf
app.post('/api/calves', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const count = db.get('calves').length + 1;
  const newId = req.body.id || `CLF-${String(count).padStart(3, '0')}`;

  const calf = {
    id: newId,
    name: req.body.name || `Calf ${newId}`,
    photo_url: req.body.photo_url || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
    mother_buffalo_id: req.body.mother_buffalo_id || '',
    father_info: req.body.father_info || '',
    gender: req.body.gender || 'Female',
    breed: req.body.breed || 'Murrah',
    birth_date: req.body.birth_date || new Date().toISOString().split('T')[0],
    birth_weight: Number(req.body.birth_weight) || 30.0,
    current_weight: Number(req.body.current_weight) || Number(req.body.birth_weight) || 30.0,
    health_status: req.body.health_status || 'Healthy',
    birth_condition: req.body.birth_condition || 'Normal',
    feeding_method: req.body.feeding_method || 'Mother Milk / Colostrum',
    vaccination_status: req.body.vaccination_status || 'Pending',
    deworming_status: req.body.deworming_status || 'Due Soon',
    notes: req.body.notes || '',
    status: 'Active',
    created_at: new Date().toISOString()
  };

  db.insert('calves', calf);

  // Add initial growth record
  db.insert('calf_growth_records', {
    id: `GRW-${Date.now().toString().slice(-6)}`,
    calf_id: newId,
    measurement_date: calf.birth_date,
    current_weight: calf.birth_weight,
    height: 65,
    weight_gain_since_last: 0,
    health_observations: 'Initial registration entry.',
    feeding_observations: 'Mother milk feeding initiated.',
    notes: 'Registration entry',
    created_at: new Date().toISOString()
  });

  db.logAudit(req.user.id, req.user.username, 'CALF_REGISTERED', 'Calf Management', `Registered calf ${calf.id} (${calf.name})`);
  res.status(201).json(calf);
});

// Update Calf
app.put('/api/calves/:id', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const updates = { ...req.body };
  delete updates.id;

  const updated = db.update('calves', c => c.id === req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Calf not found' });

  db.logAudit(req.user.id, req.user.username, 'CALF_UPDATED', 'Calf Management', `Updated calf ${req.params.id}`);
  res.json(updated);
});

// Record Calf Growth (Periodic Weight)
app.post('/api/calves/:id/growth', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const calfId = req.params.id;
  const { measurement_date, current_weight, height, health_observations, feeding_observations, notes } = req.body;

  if (!measurement_date || !current_weight) {
    return res.status(400).json({ error: 'Measurement date and current weight are required.' });
  }

  // Find previous measurements to calculate gain
  const prevList = db.get('calf_growth_records')
    .filter(g => g.calf_id === calfId)
    .sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date));

  const lastRecord = prevList.length > 0 ? prevList[prevList.length - 1] : null;
  const weightGain = lastRecord ? (Number(current_weight) - Number(lastRecord.current_weight)) : 0;

  const newGrowth = {
    id: `GRW-${Date.now().toString().slice(-6)}`,
    calf_id: calfId,
    measurement_date,
    current_weight: Number(current_weight),
    height: height ? Number(height) : null,
    weight_gain_since_last: Math.round(weightGain * 100) / 100,
    health_observations: health_observations || '',
    feeding_observations: feeding_observations || '',
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  db.insert('calf_growth_records', newGrowth);

  // Update current weight in calf main profile
  db.update('calves', c => c.id === calfId, { current_weight: Number(current_weight) });

  res.status(201).json(newGrowth);
});

// Record Calf Feeding
app.post('/api/calves/:id/feeding', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF, ROLES.FARM_WORKER), (req, res) => {
  const calfId = req.params.id;
  const { feeding_date, feeding_time, feed_type, quantity_litres_or_kg, unit, notes } = req.body;

  if (!feeding_date || !feed_type || !quantity_litres_or_kg) {
    return res.status(400).json({ error: 'Feeding date, feed type, and quantity are required.' });
  }

  const record = {
    id: `FEED-${Date.now().toString().slice(-6)}`,
    calf_id: calfId,
    feeding_date,
    feeding_time: feeding_time || '07:00 AM',
    feed_type,
    quantity_litres_or_kg: Number(quantity_litres_or_kg),
    unit: unit || 'L',
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  db.insert('calf_feeding_records', record);
  res.status(201).json(record);
});

/* ============================================================
   5. DEWORMING MANAGEMENT (EXTREMELY IMPORTANT)
============================================================ */

// List Deworming Records (Completed)
app.get('/api/deworming/records', authenticate, (req, res) => {
  const { animal_type, animal_id } = req.query;
  let records = db.get('animal_deworming_records');

  if (animal_type && animal_type !== 'All') {
    records = records.filter(r => r.animal_type === animal_type);
  }
  if (animal_id) {
    records = records.filter(r => r.animal_id === animal_id);
  }

  records.sort((a, b) => new Date(b.deworming_date) - new Date(a.deworming_date));
  res.json(records);
});

// Record Completed Deworming Treatment
app.post('/api/deworming/records', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const {
    animal_type,
    animal_id,
    animal_name,
    deworming_date,
    medicine_name,
    medicine_type,
    dosage,
    administration_method,
    vet_doctor,
    medicine_cost,
    next_recommended_date,
    prescription_attachment,
    remarks,
    schedule_id
  } = req.body;

  if (!animal_type || !animal_id || !deworming_date || !medicine_name || !dosage) {
    return res.status(400).json({ error: 'Animal type, ID, date, medicine name, and dosage are required.' });
  }

  const recordId = `DWR-${Date.now().toString().slice(-6)}`;
  const record = {
    id: recordId,
    animal_type,
    animal_id,
    animal_name: animal_name || `${animal_type} ${animal_id}`,
    deworming_date,
    medicine_name,
    medicine_type: medicine_type || 'Liquid / Drench',
    dosage,
    administration_method: administration_method || 'Oral',
    vet_doctor: vet_doctor || 'Veterinary Staff',
    medicine_cost: Number(medicine_cost) || 0,
    next_recommended_date: next_recommended_date || '',
    prescription_attachment: prescription_attachment || '',
    remarks: remarks || '',
    created_at: new Date().toISOString()
  };

  db.insert('animal_deworming_records', record);

  // Update schedule status if linked
  if (schedule_id) {
    db.update('animal_deworming_schedules', s => s.id === schedule_id, {
      status: 'Completed',
      completed_record_id: recordId
    });
  } else {
    // If an existing open schedule existed for this animal, close it
    const openSched = db.getOne('animal_deworming_schedules', s =>
      s.animal_id === animal_id && (s.status === 'Due Today' || s.status === 'Due Soon' || s.status === 'Overdue')
    );
    if (openSched) {
      db.update('animal_deworming_schedules', s => s.id === openSched.id, {
        status: 'Completed',
        completed_record_id: recordId
      });
    }
  }

  // Automatically schedule next deworming if recommended date is provided
  if (next_recommended_date) {
    db.insert('animal_deworming_schedules', {
      id: `DWS-${Date.now().toString().slice(-6)}`,
      animal_type,
      animal_id,
      animal_name: record.animal_name,
      scheduled_date: next_recommended_date,
      medicine_recommended: medicine_name,
      dosage_recommended: dosage,
      status: 'Scheduled',
      completed_record_id: null,
      sms_reminders_sent: [],
      created_at: new Date().toISOString()
    });
  }

  // Update animal deworming status in respective table
  if (animal_type === 'Buffalo') {
    db.update('buffaloes', b => b.id === animal_id, {
      notes: `${record.remarks ? record.remarks + '. ' : ''}Dewormed on ${deworming_date} (${medicine_name}).`
    });
  } else if (animal_type === 'Calf') {
    db.update('calves', c => c.id === animal_id, {
      deworming_status: 'Dewormed'
    });
  }

  // If medicine cost > 0, optionally record in farm expenses if requested
  if (Number(medicine_cost) > 0) {
    db.insert('farm_expenses', {
      id: `EXP-DWR-${Date.now().toString().slice(-6)}`,
      expense_date: deworming_date,
      category: 'Veterinary & Medicine',
      description: `Deworming medicine (${medicine_name}) for ${animal_type} ${animal_id}`,
      amount: Number(medicine_cost),
      payment_mode: 'Cash',
      vendor: vet_doctor || 'Farm Clinic',
      reference_id: recordId,
      is_medical_bill: true
    });
  }

  db.logAudit(req.user.id, req.user.username, 'DEWORMING_RECORDED', 'Deworming', `Recorded deworming for ${animal_type} ${animal_id} with ${medicine_name}`);
  res.status(201).json(record);
});

// List Deworming Schedules (Calendar feed)
app.get('/api/deworming/schedules', authenticate, (req, res) => {
  const { animal_type, status } = req.query;
  let list = db.get('animal_deworming_schedules');

  if (animal_type && animal_type !== 'All') {
    list = list.filter(s => s.animal_type === animal_type);
  }
  if (status && status !== 'All') {
    list = list.filter(s => s.status === status);
  }

  list.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
  res.json(list);
});

// Create Schedule
app.post('/api/deworming/schedules', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const { animal_type, animal_id, animal_name, scheduled_date, medicine_recommended, dosage_recommended } = req.body;

  if (!animal_type || !animal_id || !scheduled_date) {
    return res.status(400).json({ error: 'Animal type, ID, and scheduled date are required.' });
  }

  const newSched = {
    id: `DWS-${Date.now().toString().slice(-6)}`,
    animal_type,
    animal_id,
    animal_name: animal_name || `${animal_type} ${animal_id}`,
    scheduled_date,
    medicine_recommended: medicine_recommended || 'As prescribed by veterinarian',
    dosage_recommended: dosage_recommended || 'Prescribed dose',
    status: 'Scheduled',
    completed_record_id: null,
    sms_reminders_sent: [],
    created_at: new Date().toISOString()
  };

  db.insert('animal_deworming_schedules', newSched);
  res.status(201).json(newSched);
});

/* ============================================================
   6. SMS NOTIFICATION CONFIGURATION & LOGS
============================================================ */

// Get Settings
app.get('/api/sms/settings', authenticate, (req, res) => {
  const settings = db.get('sms_notification_settings');
  res.json(settings);
});

// Update Settings
app.post('/api/sms/settings', authenticate, authorizeRoles(ROLES.SUPER_ADMIN), (req, res) => {
  const current = db.get('sms_notification_settings');
  const updated = { ...current, ...req.body };
  db.data.sms_notification_settings = updated;
  db.save();

  db.logAudit(req.user.id, req.user.username, 'SMS_SETTINGS_UPDATED', 'Settings', 'Updated SMS notification configuration.');
  res.json(updated);
});

// Send Test SMS
app.post('/api/sms/test', authenticate, authorizeRoles(ROLES.SUPER_ADMIN), async (req, res) => {
  const settings = db.get('sms_notification_settings');
  const targetPhone = req.body.phone || settings.registered_mobile;

  const testMessage = SMSService.formatMessage('test');
  const result = await SMSService.sendSMS({
    recipientPhone: targetPhone,
    messageText: testMessage,
    animalType: 'Test',
    animalId: 'TEST-001',
    animalName: 'System Verification',
    eventType: 'Test SMS',
    reminderInterval: 'test',
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  res.json(result);
});

// List SMS Logs
app.get('/api/sms/logs', authenticate, (req, res) => {
  const logs = db.get('sms_notification_logs') || [];
  // Sort newest first
  logs.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  res.json(logs);
});

// Retry Failed SMS
app.post('/api/sms/retry/:id', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER), async (req, res) => {
  const log = db.getOne('sms_notification_logs', l => l.id === req.params.id);
  if (!log) return res.status(404).json({ error: 'SMS log entry not found.' });

  const result = await SMSService.sendSMS({
    recipientPhone: log.recipient_phone,
    messageText: log.message_text,
    animalType: log.animal_type,
    animalId: log.animal_id,
    animalName: log.animal_name,
    eventType: log.event_type,
    reminderInterval: log.reminder_interval,
    scheduledDate: log.scheduled_date
  });

  res.json(result);
});

// Manually Trigger Scheduled Notification Check
app.post('/api/sms/trigger-check', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER), async (req, res) => {
  const result = await SMSService.checkAndSendScheduledReminders();
  res.json({ message: 'Scheduled reminder check executed.', result });
});

/* ============================================================
   7. VETERINARY & MEDICATION MANAGEMENT & BILLING
============================================================ */

// List Medications
app.get('/api/veterinary/medications', authenticate, (req, res) => {
  const { animal_id, status } = req.query;
  let list = db.get('animal_medications');
  if (animal_id) list = list.filter(m => m.animal_id === animal_id);
  if (status && status !== 'All') list = list.filter(m => m.status === status);
  list.sort((a, b) => new Date(b.treatment_date) - new Date(a.treatment_date));
  res.json(list);
});

// Add Medication Record
app.post('/api/veterinary/medications', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF), (req, res) => {
  const {
    animal_type,
    animal_id,
    animal_name,
    treatment_date,
    medicine_name,
    medicine_category,
    disease_issue,
    medicine_dosage,
    frequency,
    treatment_duration,
    administration_method,
    vet_doctor,
    prescription_upload,
    medication_cost,
    status,
    follow_up_date,
    additional_notes
  } = req.body;

  if (!animal_id || !treatment_date || !medicine_name) {
    return res.status(400).json({ error: 'Animal ID, treatment date, and medicine name are required.' });
  }

  const newMed = {
    id: `MED-${Date.now().toString().slice(-6)}`,
    animal_type: animal_type || 'Buffalo',
    animal_id,
    animal_name: animal_name || `${animal_type} ${animal_id}`,
    treatment_date,
    medicine_name,
    medicine_category: medicine_category || 'General',
    disease_issue: disease_issue || 'General Medical Care',
    medicine_dosage: medicine_dosage || 'Prescribed',
    frequency: frequency || 'Once daily',
    treatment_duration: treatment_duration || '3 days',
    administration_method: administration_method || 'Intramuscular',
    vet_doctor: vet_doctor || 'Farm Veterinarian',
    prescription_upload: prescription_upload || '',
    medication_cost: Number(medication_cost) || 0,
    status: status || 'Ongoing',
    follow_up_date: follow_up_date || '',
    additional_notes: additional_notes || '',
    bill_id: null,
    created_at: new Date().toISOString()
  };

  db.insert('animal_medications', newMed);

  // Update animal health status to Under Treatment if ongoing
  if (status === 'Ongoing') {
    if (animal_type === 'Buffalo') {
      db.update('buffaloes', b => b.id === animal_id, { current_health_status: 'Under Treatment' });
    } else if (animal_type === 'Calf') {
      db.update('calves', c => c.id === animal_id, { health_status: 'Under Treatment' });
    }
  }

  db.logAudit(req.user.id, req.user.username, 'MEDICATION_ADDED', 'Veterinary', `Prescribed ${medicine_name} for ${animal_type} ${animal_id}`);
  res.status(201).json(newMed);
});

// List Veterinary Bills
app.get('/api/veterinary/bills', authenticate, (req, res) => {
  const { animal_id, category } = req.query;
  let list = db.get('veterinary_bills');
  if (animal_id) list = list.filter(b => b.animal_id === animal_id);
  if (category && category !== 'All') list = list.filter(b => b.bill_category === category);
  list.sort((a, b) => new Date(b.bill_date) - new Date(a.bill_date));
  res.json(list);
});

// Add Veterinary Bill (Enforces EXACTLY ONCE main financial expense posting!)
app.post('/api/veterinary/bills', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.VET_STAFF, ROLES.ACCOUNTANT), (req, res) => {
  const {
    bill_number,
    bill_date,
    animal_id,
    animal_category,
    supplier_clinic,
    bill_category,
    description,
    quantity,
    unit_price,
    total_amount,
    amount_paid,
    payment_method,
    receipt_attachment,
    items
  } = req.body;

  if (!bill_number || !bill_date || !total_amount) {
    return res.status(400).json({ error: 'Bill number, date, and total amount are required.' });
  }

  const billId = `VBILL-${Date.now().toString().slice(-6)}`;
  const total = Number(total_amount);
  const paid = Number(amount_paid !== undefined ? amount_paid : total);
  const outstanding = total - paid;
  const expenseId = `EXP-VET-${Date.now().toString().slice(-6)}`;

  const newBill = {
    id: billId,
    bill_number,
    bill_date,
    animal_id: animal_id || 'General Herd',
    animal_category: animal_category || 'Buffalo',
    supplier_clinic: supplier_clinic || 'Veterinary Hospital',
    bill_category: bill_category || 'Treatment',
    description: description || `Medical bill ${bill_number}`,
    quantity: Number(quantity) || 1,
    unit_price: Number(unit_price) || total,
    total_amount: total,
    amount_paid: paid,
    outstanding_amount: outstanding,
    payment_method: payment_method || 'Cash',
    receipt_attachment: receipt_attachment || '',
    items: Array.isArray(items) ? items : [{ description: description || 'Veterinary services', quantity: 1, unit_price: total, total }],
    linked_expense_id: expenseId,
    created_at: new Date().toISOString()
  };

  db.insert('veterinary_bills', newBill);

  // CRITICAL REQUIREMENT: Connect to main DairyFlow financial dashboard EXACTLY ONCE!
  const expenseRecord = {
    id: expenseId,
    expense_date: bill_date,
    category: 'Veterinary & Medicine',
    description: `Vet Bill ${bill_number}: ${description || bill_category} (${animal_id ? animal_category + ' ' + animal_id : 'General Herd'})`,
    amount: total,
    payment_mode: payment_method || 'Cash',
    vendor: supplier_clinic || 'Veterinary Clinic',
    reference_id: billId,
    is_medical_bill: true
  };
  db.insert('farm_expenses', expenseRecord);

  db.logAudit(req.user.id, req.user.username, 'VET_BILL_RECORDED', 'Veterinary Billing', `Recorded bill ${bill_number} (₹${total}) linked to expense ${expenseId}`);
  res.status(201).json({ bill: newBill, expense: expenseRecord });
});

// Animal-wise Monthly Medical Expenditure Report
app.get('/api/veterinary/reports/animal-wise', authenticate, (req, res) => {
  const bills = db.get('veterinary_bills');
  const summary = {};

  bills.forEach(bill => {
    const key = bill.animal_id || 'General Herd';
    if (!summary[key]) {
      summary[key] = {
        animal_id: key,
        animal_category: bill.animal_category,
        total_medical_expenses: 0,
        bills_count: 0,
        bills: []
      };
    }
    summary[key].total_medical_expenses += Number(bill.total_amount) || 0;
    summary[key].bills_count += 1;
    summary[key].bills.push(bill);
  });

  const list = Object.values(summary);
  list.sort((a, b) => b.total_medical_expenses - a.total_medical_expenses);

  const highestExpenditureAnimal = list.length > 0 ? list[0] : null;

  res.json({
    report: list,
    highest_expenditure_animal: highestExpenditureAnimal,
    total_farm_veterinary_expense: list.reduce((sum, item) => sum + item.total_medical_expenses, 0)
  });
});

/* ============================================================
   8. COMPLETE FARM HEALTH & BREEDING CALENDAR
============================================================ */

app.get('/api/calendar/events', authenticate, (req, res) => {
  const events = [];

  // Deworming Schedules
  db.get('animal_deworming_schedules').forEach(s => {
    let color = '#f59e0b'; // yellow (due soon)
    if (s.status === 'Completed') color = '#10b981'; // green
    else if (s.status === 'Overdue') color = '#ef4444'; // red
    else if (s.status === 'Due Today') color = '#e11d48'; // crimson

    events.push({
      id: `EV-DWS-${s.id}`,
      title: `${s.animal_type} Deworming: ${s.animal_name} (${s.animal_id})`,
      date: s.scheduled_date,
      type: 'Deworming',
      animal_type: s.animal_type,
      animal_id: s.animal_id,
      status: s.status,
      color,
      details: `Medicine: ${s.medicine_recommended}, Dose: ${s.dosage_recommended}`,
      url: s.animal_type === 'Buffalo' ? `/buffaloes/${s.animal_id}` : `/calves/${s.animal_id}`
    });
  });

  // Vaccinations
  db.get('animal_vaccination_records').forEach(v => {
    events.push({
      id: `EV-VAC-${v.id}`,
      title: `Vaccination: ${v.vaccine_name} (${v.animal_id})`,
      date: v.vaccination_date,
      type: 'Vaccination',
      animal_type: v.animal_type,
      animal_id: v.animal_id,
      status: v.status,
      color: '#3b82f6', // blue
      details: `Batch: ${v.batch_no || 'N/A'}, Vet: ${v.doctor_name}`,
      url: v.animal_type === 'Buffalo' ? `/buffaloes/${v.animal_id}` : `/calves/${v.animal_id}`
    });
  });

  // Artificial Inseminations
  db.get('buffalo_insemination_records').forEach(i => {
    events.push({
      id: `EV-INS-${i.id}`,
      title: `AI Performed: Buffalo ${i.buffalo_id} (${i.bull_breed})`,
      date: i.insemination_date,
      type: 'Insemination',
      animal_type: 'Buffalo',
      animal_id: i.buffalo_id,
      status: 'Completed',
      color: '#8b5cf6', // purple
      details: `Straw: ${i.semen_straw_id}, Tech: ${i.technician_name}`,
      url: `/buffaloes/${i.buffalo_id}`
    });
  });

  // Expected Calving Deliveries
  db.get('buffalo_pregnancy_records').filter(p => p.is_active && p.expected_calving_date).forEach(p => {
    events.push({
      id: `EV-CALV-EXP-${p.id}`,
      title: `Expected Calving: Buffalo ${p.buffalo_id}`,
      date: p.expected_calving_date,
      type: 'Expected Delivery',
      animal_type: 'Buffalo',
      animal_id: p.buffalo_id,
      status: 'Expected',
      color: '#ec4899', // pink
      details: `Stage: ${p.pregnancy_stage}. Prepare calving box.`,
      url: `/buffaloes/${p.buffalo_id}`
    });
  });

  // Actual Calvings
  db.get('buffalo_calving_records').forEach(c => {
    events.push({
      id: `EV-CALV-ACT-${c.id}`,
      title: `Calving Delivered: Buffalo ${c.buffalo_id} (${c.calf_gender} Calf)`,
      date: c.actual_delivery_date,
      type: 'Calving Delivery',
      animal_type: 'Buffalo',
      animal_id: c.buffalo_id,
      status: 'Completed',
      color: '#059669', // emerald
      details: `Calf: ${c.calf_id}, Delivery: ${c.delivery_type}`,
      url: `/buffaloes/${c.buffalo_id}`
    });
  });

  // Veterinary Visits & Follow-ups
  db.get('veterinary_visits').forEach(v => {
    events.push({
      id: `EV-VIS-${v.id}`,
      title: `Vet Appointment: ${v.doctor_name} (${v.animal_id})`,
      date: v.visit_date,
      type: 'Vet Visit',
      animal_type: v.animal_type,
      animal_id: v.animal_id,
      status: 'Scheduled',
      color: '#0284c7', // sky
      details: `Purpose: ${v.purpose}`,
      url: v.animal_type === 'Buffalo' ? `/buffaloes/${v.animal_id}` : `/calves/${v.animal_id}`
    });
  });

  // Medication Follow-ups
  db.get('animal_medications').filter(m => m.follow_up_date).forEach(m => {
    events.push({
      id: `EV-MED-FOL-${m.id}`,
      title: `Medication Follow-up: ${m.animal_id} (${m.disease_issue})`,
      date: m.follow_up_date,
      type: 'Medical Follow-up',
      animal_type: m.animal_type,
      animal_id: m.animal_id,
      status: 'Pending',
      color: '#d97706', // amber
      details: `Review ${m.medicine_name}`,
      url: m.animal_type === 'Buffalo' ? `/buffaloes/${m.animal_id}` : `/calves/${m.animal_id}`
    });
  });

  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(events);
});

/* ============================================================
   9. ENHANCED DASHBOARD INTEGRATION
============================================================ */

app.get('/api/dashboard/stats', authenticate, (req, res) => {
  const buffaloes = db.get('buffaloes') || [];
  const calves = db.get('calves') || [];
  const cows = db.get('cattle') || [];
  const deliveries = db.get('milk_deliveries') || [];
  const bills = db.get('customer_bills') || [];
  const expenses = db.get('farm_expenses') || [];
  const revenues = db.get('farm_revenue') || [];
  const schedules = db.get('animal_deworming_schedules') || [];
  const vaccinations = db.get('animal_vaccination_records') || [];
  const medications = db.get('animal_medications') || [];
  const pregnancies = db.get('buffalo_pregnancy_records') || [];

  // Animal Statistics
  const totalBuffaloes = buffaloes.length;
  const totalCalves = calves.length;
  const totalCows = cows.length;

  const totalPregnantBuffaloes = buffaloes.filter(b => b.pregnancy_status === 'Confirmed Pregnant' || b.status === 'Pregnant').length;
  const totalLactatingBuffaloes = buffaloes.filter(b => b.status === 'Lactating' || (b.current_milk_production > 0)).length;
  const totalActiveMilkingAnimals = totalLactatingBuffaloes + cows.filter(c => c.status === 'Lactating').length;

  // Deworming stats
  const todayStr = new Date().toISOString().split('T')[0];
  const dewormingDueToday = schedules.filter(s => s.status === 'Due Today' || (s.scheduled_date === todayStr && s.status !== 'Completed')).length;
  const dewormingOverdue = schedules.filter(s => s.status === 'Overdue' || (new Date(s.scheduled_date) < new Date(todayStr) && s.status !== 'Completed')).length;

  // Expected deliveries this month
  const currentMonthStr = todayStr.substring(0, 7); // '2026-11'
  const expectedDeliveriesThisMonth = pregnancies.filter(p => p.is_active && p.expected_calving_date && p.expected_calving_date.startsWith(currentMonthStr)).length;

  // Upcoming vaccinations
  const upcomingVaccinations = vaccinations.filter(v => v.status === 'Upcoming' || new Date(v.vaccination_date) >= new Date(todayStr)).length;

  // Under treatment
  const animalsUnderTreatment = buffaloes.filter(b => b.status === 'Under treatment' || b.current_health_status === 'Under Treatment').length
    + calves.filter(c => c.health_status === 'Under Treatment').length;

  // Total daily milk production
  const totalDailyBuffaloMilk = buffaloes.reduce((acc, curr) => acc + (Number(curr.current_milk_production) || 0), 0);
  const totalDailyCowMilk = cows.reduce((acc, curr) => acc + (Number(curr.current_milk_production) || 0), 0);
  const totalDailyMilk = totalDailyBuffaloMilk + totalDailyCowMilk;

  // Financial summary
  const totalRevenue = revenues.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalMedicalExpenses = expenses.filter(e => e.is_medical_bill || e.category === 'Veterinary & Medicine')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  res.json({
    animal_stats: {
      total_buffaloes: totalBuffaloes,
      total_cows: totalCows,
      total_calves: totalCalves,
      total_pregnant_buffaloes: totalPregnantBuffaloes,
      total_lactating_buffaloes: totalLactatingBuffaloes,
      total_active_milking_animals: totalActiveMilkingAnimals,
      expected_deliveries_this_month: expectedDeliveriesThisMonth,
      deworming_due_today: dewormingDueToday,
      deworming_overdue: dewormingOverdue,
      upcoming_vaccinations: upcomingVaccinations,
      animals_under_treatment: animalsUnderTreatment,
      total_daily_milk_litres: totalDailyMilk,
      buffalo_daily_milk_litres: totalDailyBuffaloMilk,
      cow_daily_milk_litres: totalDailyCowMilk
    },
    financial_stats: {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      total_medical_expenses: totalMedicalExpenses,
      currency: "₹"
    }
  });
});

// Animal Health & Breeding Alerts Panel
app.get('/api/dashboard/alerts', authenticate, (req, res) => {
  const alerts = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  // 1. Deworming schedules
  db.get('animal_deworming_schedules').forEach(s => {
    if (s.status === 'Completed' || s.status === 'Skipped') return;
    const diff = Math.round((new Date(s.scheduled_date).getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diff < 0) {
      alerts.push({
        animal_id: s.animal_id,
        animal_name: s.animal_name,
        animal_type: s.animal_type,
        activity: 'Deworming',
        due_date: s.scheduled_date,
        status: 'Overdue',
        badge_variant: 'destructive',
        url: s.animal_type === 'Buffalo' ? `/buffaloes/${s.animal_id}` : `/calves/${s.animal_id}`
      });
    } else if (diff === 0) {
      alerts.push({
        animal_id: s.animal_id,
        animal_name: s.animal_name,
        animal_type: s.animal_type,
        activity: 'Deworming',
        due_date: s.scheduled_date,
        status: 'Due Today',
        badge_variant: 'warning',
        url: s.animal_type === 'Buffalo' ? `/buffaloes/${s.animal_id}` : `/calves/${s.animal_id}`
      });
    } else if (diff <= 7) {
      alerts.push({
        animal_id: s.animal_id,
        animal_name: s.animal_name,
        animal_type: s.animal_type,
        activity: 'Deworming',
        due_date: s.scheduled_date,
        status: 'Due Soon',
        badge_variant: 'secondary',
        url: s.animal_type === 'Buffalo' ? `/buffaloes/${s.animal_id}` : `/calves/${s.animal_id}`
      });
    }
  });

  // 2. Upcoming Vaccinations
  db.get('animal_vaccination_records').forEach(v => {
    if (v.status === 'Upcoming') {
      alerts.push({
        animal_id: v.animal_id,
        animal_name: `${v.animal_type} ${v.animal_id}`,
        animal_type: v.animal_type,
        activity: `Vaccination (${v.vaccine_name.split(' ')[0]})`,
        due_date: v.vaccination_date,
        status: 'Upcoming',
        badge_variant: 'info',
        url: v.animal_type === 'Buffalo' ? `/buffaloes/${v.animal_id}` : `/calves/${v.animal_id}`
      });
    }
  });

  // 3. Expected Deliveries
  db.get('buffalo_pregnancy_records').filter(p => p.is_active && p.expected_calving_date).forEach(p => {
    const diff = Math.round((new Date(p.expected_calving_date).getTime() - today.getTime()) / (1000 * 3600 * 24));
    let statusText = 'Upcoming';
    if (diff < 0) statusText = 'Overdue';
    else if (diff <= 14) statusText = 'Due Soon';

    alerts.push({
      animal_id: p.buffalo_id,
      animal_name: `Buffalo ${p.buffalo_id}`,
      animal_type: 'Buffalo',
      activity: 'Expected Delivery',
      due_date: p.expected_calving_date,
      status: statusText,
      badge_variant: diff < 0 ? 'destructive' : 'warning',
      url: `/buffaloes/${p.buffalo_id}`
    });
  });

  // 4. Pregnancy examinations scheduled
  db.get('veterinary_visits').filter(v => v.purpose.toLowerCase().includes('pregnancy')).forEach(v => {
    alerts.push({
      animal_id: v.animal_id,
      animal_name: `${v.animal_type} ${v.animal_id}`,
      animal_type: v.animal_type,
      activity: 'Pregnancy Check',
      due_date: v.visit_date,
      status: 'Upcoming',
      badge_variant: 'info',
      url: `/buffaloes/${v.animal_id}`
    });
  });

  alerts.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  res.json(alerts);
});

/* ============================================================
   10. EXISTING MODULES (FINANCE, BILLING, CUSTOMERS, COWS)
============================================================ */

// Cows (Cattle Management)
app.get('/api/cattle', authenticate, (req, res) => res.json(db.get('cattle')));
app.post('/api/cattle', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER), (req, res) => {
  const newCow = { id: `COW-${Date.now().toString().slice(-4)}`, ...req.body };
  db.insert('cattle', newCow);
  res.status(201).json(newCow);
});

// Customers
app.get('/api/customers', authenticate, (req, res) => res.json(db.get('customers')));
app.post('/api/customers', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.ACCOUNTANT), (req, res) => {
  const newCust = { id: `CUST-${Date.now().toString().slice(-4)}`, ...req.body };
  db.insert('customers', newCust);
  res.status(201).json(newCust);
});

// Deliveries
app.get('/api/deliveries', authenticate, (req, res) => res.json(db.get('milk_deliveries')));
app.post('/api/deliveries', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.FARM_MANAGER, ROLES.FARM_WORKER), (req, res) => {
  const del = { id: `DEL-${Date.now().toString().slice(-6)}`, created_at: new Date().toISOString(), ...req.body };
  db.insert('milk_deliveries', del);
  res.status(201).json(del);
});

// Customer Bills & Payments
app.get('/api/billing', authenticate, (req, res) => res.json(db.get('customer_bills')));
app.get('/api/payments', authenticate, (req, res) => res.json(db.get('customer_payments')));
app.post('/api/payments', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT), (req, res) => {
  const pay = { id: `PAY-${Date.now().toString().slice(-6)}`, created_at: new Date().toISOString(), ...req.body };
  db.insert('customer_payments', pay);
  res.status(201).json(pay);
});

// Farm Investments
app.get('/api/finance/investments', authenticate, (req, res) => res.json(db.get('farm_investments')));
app.post('/api/finance/investments', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT), (req, res) => {
  const inv = { id: `INV-${Date.now().toString().slice(-6)}`, ...req.body };
  db.insert('farm_investments', inv);
  res.status(201).json(inv);
});

// Farm Expenses
app.get('/api/finance/expenses', authenticate, (req, res) => res.json(db.get('farm_expenses')));
app.post('/api/finance/expenses', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT), (req, res) => {
  const exp = { id: `EXP-${Date.now().toString().slice(-6)}`, is_medical_bill: false, ...req.body };
  db.insert('farm_expenses', exp);
  res.status(201).json(exp);
});

// Farm Revenue
app.get('/api/finance/revenue', authenticate, (req, res) => res.json(db.get('farm_revenue')));
app.post('/api/finance/revenue', authenticate, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT), (req, res) => {
  const rev = { id: `REV-${Date.now().toString().slice(-6)}`, ...req.body };
  db.insert('farm_revenue', rev);
  res.status(201).json(rev);
});

// Audit Logs
app.get('/api/audit-logs', authenticate, authorizeRoles(ROLES.SUPER_ADMIN), (req, res) => {
  const logs = db.get('audit_logs') || [];
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(logs);
});

/* ============================================================
   11. AUTOMATED BACKGROUND SMS SCHEDULER
============================================================ */

// Run scheduled check every 15 minutes in background
cron.schedule('*/15 * * * *', async () => {
  console.log('⏰ [Scheduler] Running automated health & deworming SMS reminder check...');
  try {
    const result = await SMSService.checkAndSendScheduledReminders();
    console.log(`✅ [Scheduler] Completed. Sent ${result.sent} notifications.`);
  } catch (err) {
    console.error('❌ [Scheduler] Error during scheduled check:', err);
  }
});

// Also trigger once upon server boot
setTimeout(async () => {
  console.log('🚀 [Boot] Running initial health reminder check...');
  try {
    const result = await SMSService.checkAndSendScheduledReminders();
    console.log(`✅ [Boot] Checked ${result.checked} schedules. Sent ${result.sent} alerts.`);
  } catch (err) {
    console.error('❌ [Boot] Initial check error:', err);
  }
}, 3000);

// Serve Built Frontend (Production Mode)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` DairyFlow Backend running on http://localhost:${PORT}`);
    console.log(` Background SMS & Deworming Scheduler: ACTIVE`);
    console.log(` Persistent Database: Ready`);
    console.log(`====================================================`);
  });
}

export default app;
