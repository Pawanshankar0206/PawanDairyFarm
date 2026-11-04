-- ============================================================
-- DAIRYFLOW ENTERPRISE DATABASE EXTENSION (PostgreSQL / Supabase)
-- Buffalo Management | Calf Management | Breeding | Deworming | Veterinary | SMS Alerts | RBAC
-- ============================================================

-- 1. Farm Users & Roles
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO user_roles (name, description) VALUES
    ('Owner / Super Admin', 'Full administrative authority and financial control'),
    ('Farm Manager', 'Daily operations, livestock production, and inventory'),
    ('Accountant', 'Financial reporting, billing, expenses, and revenues'),
    ('Veterinary Staff', 'Livestock health, breeding, deworming, and clinical treatments'),
    ('Farm Worker', 'Daily feeding, milking routines, and operational tasks'),
    ('Read-only Viewer', 'View-only access to operational dashboards')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS farm_users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) REFERENCES user_roles(name) ON UPDATE CASCADE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buffalo Management
CREATE TABLE IF NOT EXISTS buffaloes (
    id VARCHAR(50) PRIMARY KEY, -- e.g. BFL-001
    name VARCHAR(100) NOT NULL,
    tag_number VARCHAR(100) UNIQUE,
    photo_url TEXT,
    breed VARCHAR(80) NOT NULL,
    date_of_birth DATE,
    age_years NUMERIC(4, 1),
    purchase_date DATE,
    purchase_price NUMERIC(12, 2) DEFAULT 0,
    supplier_details TEXT,
    current_health_status VARCHAR(50) DEFAULT 'Healthy',
    current_milk_production NUMERIC(6, 2) DEFAULT 0, -- Litres per day
    morning_milk NUMERIC(6, 2) DEFAULT 0,
    evening_milk NUMERIC(6, 2) DEFAULT 0,
    lactation_number INT DEFAULT 1,
    breeding_status VARCHAR(50) DEFAULT 'Open',
    pregnancy_status VARCHAR(50) DEFAULT 'Not Pregnant',
    last_calving_date DATE,
    previous_medical_history TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Pregnant', 'Lactating', 'Dry period', 'Not pregnant', 'Under treatment', 'Retired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buffalo Insemination Records
CREATE TABLE IF NOT EXISTS buffalo_insemination_records (
    id VARCHAR(50) PRIMARY KEY,
    buffalo_id VARCHAR(50) REFERENCES buffaloes(id) ON DELETE CASCADE,
    insemination_date DATE NOT NULL,
    insemination_time VARCHAR(20),
    semen_date DATE,
    semen_batch_details VARCHAR(150),
    semen_straw_id VARCHAR(100),
    bull_breed VARCHAR(100),
    technician_name VARCHAR(150),
    veterinary_center VARCHAR(200),
    insemination_cost NUMERIC(10, 2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buffalo Pregnancy Monitoring
CREATE TABLE IF NOT EXISTS buffalo_pregnancy_records (
    id VARCHAR(50) PRIMARY KEY,
    buffalo_id VARCHAR(50) REFERENCES buffaloes(id) ON DELETE CASCADE,
    insemination_id VARCHAR(50) REFERENCES buffalo_insemination_records(id) ON DELETE SET NULL,
    pregnancy_confirmation_date DATE NOT NULL,
    pregnancy_test_result VARCHAR(50) NOT NULL, -- Positive / Negative / Inconclusive
    veterinary_examination TEXT,
    pregnancy_stage VARCHAR(100),
    gestation_days_setting INT DEFAULT 310,
    expected_calving_date DATE,
    actual_delivery_date DATE,
    pregnancy_complications TEXT,
    vet_recommendations TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Buffalo Calving Records
CREATE TABLE IF NOT EXISTS buffalo_calving_records (
    id VARCHAR(50) PRIMARY KEY,
    buffalo_id VARCHAR(50) REFERENCES buffaloes(id) ON DELETE CASCADE,
    actual_delivery_date DATE NOT NULL,
    delivery_type VARCHAR(50) DEFAULT 'Normal delivery', -- Normal / Assisted / Complicated
    calf_born BOOLEAN DEFAULT TRUE,
    calf_gender VARCHAR(20),
    calf_id VARCHAR(50),
    birth_weight NUMERIC(6, 2),
    health_condition TEXT,
    veterinary_assistance VARCHAR(150),
    delivery_expenses NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Calf Management Module
CREATE TABLE IF NOT EXISTS calves (
    id VARCHAR(50) PRIMARY KEY, -- e.g. CLF-001
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    mother_buffalo_id VARCHAR(50) REFERENCES buffaloes(id) ON DELETE SET NULL,
    father_info TEXT,
    gender VARCHAR(20) NOT NULL, -- Male / Female
    breed VARCHAR(80),
    birth_date DATE NOT NULL,
    birth_weight NUMERIC(6, 2) NOT NULL,
    current_weight NUMERIC(6, 2) NOT NULL,
    health_status VARCHAR(50) DEFAULT 'Healthy',
    birth_condition VARCHAR(50) DEFAULT 'Normal',
    feeding_method VARCHAR(80) DEFAULT 'Mother Milk / Colostrum',
    vaccination_status VARCHAR(50) DEFAULT 'Pending',
    deworming_status VARCHAR(50) DEFAULT 'Due Soon',
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Sold', 'Deceased', 'Transitioned to Adult')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Calf Growth Records
CREATE TABLE IF NOT EXISTS calf_growth_records (
    id VARCHAR(50) PRIMARY KEY,
    calf_id VARCHAR(50) REFERENCES calves(id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL,
    current_weight NUMERIC(6, 2) NOT NULL,
    height NUMERIC(6, 2),
    weight_gain_since_last NUMERIC(6, 2) DEFAULT 0,
    health_observations TEXT,
    feeding_observations TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Calf Feeding Records
CREATE TABLE IF NOT EXISTS calf_feeding_records (
    id VARCHAR(50) PRIMARY KEY,
    calf_id VARCHAR(50) REFERENCES calves(id) ON DELETE CASCADE,
    feeding_date DATE NOT NULL,
    feeding_time VARCHAR(20),
    feed_type VARCHAR(100) NOT NULL,
    quantity_litres_or_kg NUMERIC(6, 2) NOT NULL,
    unit VARCHAR(10) DEFAULT 'L',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Deworming Management
CREATE TABLE IF NOT EXISTS animal_deworming_records (
    id VARCHAR(50) PRIMARY KEY,
    animal_type VARCHAR(30) NOT NULL CHECK (animal_type IN ('Buffalo', 'Calf', 'Cow')),
    animal_id VARCHAR(50) NOT NULL,
    animal_name VARCHAR(100),
    deworming_date DATE NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    medicine_type VARCHAR(50),
    dosage VARCHAR(100) NOT NULL,
    administration_method VARCHAR(50) DEFAULT 'Oral',
    vet_doctor VARCHAR(150),
    medicine_cost NUMERIC(10, 2) DEFAULT 0,
    next_recommended_date DATE,
    prescription_attachment TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS animal_deworming_schedules (
    id VARCHAR(50) PRIMARY KEY,
    animal_type VARCHAR(30) NOT NULL CHECK (animal_type IN ('Buffalo', 'Calf', 'Cow')),
    animal_id VARCHAR(50) NOT NULL,
    animal_name VARCHAR(100),
    scheduled_date DATE NOT NULL,
    medicine_recommended VARCHAR(150),
    dosage_recommended VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Due Soon', 'Due Today', 'Overdue', 'Completed', 'Skipped')),
    completed_record_id VARCHAR(50) REFERENCES animal_deworming_records(id) ON DELETE SET NULL,
    sms_reminders_sent TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Vaccinations & Clinical Medications
CREATE TABLE IF NOT EXISTS animal_vaccination_records (
    id VARCHAR(50) PRIMARY KEY,
    animal_type VARCHAR(30) NOT NULL,
    animal_id VARCHAR(50) NOT NULL,
    vaccine_name VARCHAR(150) NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    batch_no VARCHAR(100),
    doctor_name VARCHAR(150),
    cost NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Completed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS animal_medications (
    id VARCHAR(50) PRIMARY KEY,
    animal_type VARCHAR(30) NOT NULL,
    animal_id VARCHAR(50) NOT NULL,
    animal_name VARCHAR(100),
    treatment_date DATE NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    medicine_category VARCHAR(100),
    disease_issue TEXT,
    medicine_dosage VARCHAR(100),
    frequency VARCHAR(100),
    treatment_duration VARCHAR(100),
    administration_method VARCHAR(100),
    vet_doctor VARCHAR(150),
    prescription_upload TEXT,
    medication_cost NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Ongoing',
    follow_up_date DATE,
    additional_notes TEXT,
    bill_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Veterinary Visits and Billing
CREATE TABLE IF NOT EXISTS veterinary_visits (
    id VARCHAR(50) PRIMARY KEY,
    animal_id VARCHAR(50) NOT NULL,
    animal_type VARCHAR(30) NOT NULL,
    visit_date DATE NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    purpose TEXT,
    findings TEXT,
    recommendations TEXT,
    fee NUMERIC(10, 2) DEFAULT 0,
    bill_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS veterinary_bills (
    id VARCHAR(50) PRIMARY KEY,
    bill_number VARCHAR(100) NOT NULL,
    bill_date DATE NOT NULL,
    animal_id VARCHAR(50),
    animal_category VARCHAR(50),
    supplier_clinic VARCHAR(200),
    bill_category VARCHAR(100),
    description TEXT,
    quantity NUMERIC(8, 2) DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    outstanding_amount NUMERIC(12, 2) DEFAULT 0,
    payment_method VARCHAR(50),
    receipt_attachment TEXT,
    linked_expense_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS veterinary_bill_items (
    id SERIAL PRIMARY KEY,
    bill_id VARCHAR(50) REFERENCES veterinary_bills(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(8, 2) DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL
);

-- 12. SMS Notifications Settings and Delivery Logs
CREATE TABLE IF NOT EXISTS sms_notification_settings (
    id SERIAL PRIMARY KEY,
    registered_mobile VARCHAR(20) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    intervals JSONB,
    animal_categories JSONB,
    provider VARCHAR(50) DEFAULT 'msg91',
    api_key TEXT,
    auth_token TEXT,
    sender_id VARCHAR(50) DEFAULT 'DFLOW',
    template_id VARCHAR(100),
    twilio_account_sid TEXT,
    twilio_phone_number VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sms_notification_logs (
    id VARCHAR(50) PRIMARY KEY,
    animal_type VARCHAR(30),
    animal_id VARCHAR(50),
    animal_name VARCHAR(100),
    event_type VARCHAR(50),
    reminder_interval VARCHAR(50),
    scheduled_date DATE,
    recipient_phone VARCHAR(30) NOT NULL,
    message_text TEXT NOT NULL,
    provider VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Sent',
    provider_message_id VARCHAR(100),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Trails
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_buffalo_status ON buffaloes(status);
CREATE INDEX IF NOT EXISTS idx_calves_mother ON calves(mother_buffalo_id);
CREATE INDEX IF NOT EXISTS idx_deworm_sched_date ON animal_deworming_schedules(scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_vet_bills_animal ON veterinary_bills(animal_id);
