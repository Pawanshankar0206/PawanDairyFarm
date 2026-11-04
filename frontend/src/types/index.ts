export type UserRole =
  | 'Owner / Super Admin'
  | 'Farm Manager'
  | 'Accountant'
  | 'Veterinary Staff'
  | 'Farm Worker'
  | 'Read-only Viewer';

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  mobile_number: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  last_login?: string;
  created_at: string;
}

export type BuffaloStatus =
  | 'Active'
  | 'Pregnant'
  | 'Lactating'
  | 'Dry period'
  | 'Not pregnant'
  | 'Under treatment'
  | 'Retired';

export interface Buffalo {
  id: string;
  name: string;
  tag_number: string;
  photo_url: string;
  breed: string;
  date_of_birth?: string;
  age_years: number;
  purchase_date: string;
  purchase_price: number;
  supplier_details: string;
  current_health_status: 'Healthy' | 'Minor Issue' | 'Sick' | 'Under Treatment' | 'Critical';
  current_milk_production: number;
  morning_milk: number;
  evening_milk: number;
  lactation_number: number;
  breeding_status: 'Open' | 'Inseminated' | 'Pregnancy Confirmed' | 'Dry' | 'Calved';
  pregnancy_status: 'Not Pregnant' | 'Suspected' | 'Confirmed Pregnant' | 'Delivered';
  last_calving_date?: string;
  previous_medical_history: string;
  notes: string;
  status: BuffaloStatus;
  created_at: string;
  updated_at: string;
}

export interface InseminationRecord {
  id: string;
  buffalo_id: string;
  insemination_date: string;
  insemination_time: string;
  semen_date: string;
  semen_batch_details: string;
  semen_straw_id: string;
  bull_breed: string;
  technician_name: string;
  veterinary_center: string;
  insemination_cost: number;
  remarks: string;
  created_at: string;
}

export interface PregnancyRecord {
  id: string;
  buffalo_id: string;
  insemination_id?: string;
  pregnancy_confirmation_date: string;
  pregnancy_test_result: 'Positive' | 'Negative' | 'Inconclusive';
  veterinary_examination: string;
  pregnancy_stage: string;
  gestation_days_setting: number;
  expected_calving_date: string;
  actual_delivery_date?: string;
  pregnancy_complications: string;
  vet_recommendations: string;
  is_active: boolean;
  created_at: string;
}

export interface CalvingRecord {
  id: string;
  buffalo_id: string;
  actual_delivery_date: string;
  delivery_type: 'Normal delivery' | 'Assisted delivery' | 'Complicated delivery';
  calf_born: boolean;
  calf_gender: 'Male' | 'Female';
  calf_id?: string;
  birth_weight: number;
  health_condition: string;
  veterinary_assistance: string;
  delivery_expenses: number;
  notes: string;
  created_at: string;
}

export interface Calf {
  id: string;
  name: string;
  photo_url: string;
  mother_buffalo_id?: string;
  father_info?: string;
  gender: 'Male' | 'Female';
  breed: string;
  birth_date: string;
  birth_weight: number;
  current_weight: number;
  health_status: 'Healthy' | 'Under Observation' | 'Under Treatment' | 'Sick';
  birth_condition: 'Normal' | 'Weak' | 'Vigorous';
  feeding_method: string;
  vaccination_status: 'Up to Date' | 'Pending' | 'Due Soon';
  deworming_status: 'Dewormed' | 'Due Soon' | 'Overdue';
  notes: string;
  status: 'Active' | 'Sold' | 'Deceased' | 'Transitioned to Adult';
  created_at: string;
}

export interface CalfGrowthRecord {
  id: string;
  calf_id: string;
  measurement_date: string;
  current_weight: number;
  height?: number;
  weight_gain_since_last: number;
  health_observations: string;
  feeding_observations: string;
  notes: string;
  created_at: string;
}

export interface CalfFeedingRecord {
  id: string;
  calf_id: string;
  feeding_date: string;
  feeding_time: string;
  feed_type: string;
  quantity_litres_or_kg: number;
  unit: string;
  notes: string;
  created_at: string;
}

export interface DewormingRecord {
  id: string;
  animal_type: 'Buffalo' | 'Calf' | 'Cow';
  animal_id: string;
  animal_name: string;
  deworming_date: string;
  medicine_name: string;
  medicine_type: string;
  dosage: string;
  administration_method: string;
  vet_doctor: string;
  medicine_cost: number;
  next_recommended_date: string;
  prescription_attachment?: string;
  remarks: string;
  created_at: string;
}

export interface DewormingSchedule {
  id: string;
  animal_type: 'Buffalo' | 'Calf' | 'Cow';
  animal_id: string;
  animal_name: string;
  scheduled_date: string;
  medicine_recommended: string;
  dosage_recommended: string;
  status: 'Scheduled' | 'Due Soon' | 'Due Today' | 'Overdue' | 'Completed' | 'Skipped';
  completed_record_id?: string;
  sms_reminders_sent: string[];
  created_at: string;
}

export interface VaccinationRecord {
  id: string;
  animal_type: 'Buffalo' | 'Calf' | 'Cow';
  animal_id: string;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string;
  batch_no: string;
  doctor_name: string;
  cost: number;
  status: 'Completed' | 'Upcoming' | 'Overdue';
  notes: string;
  created_at: string;
}

export interface MedicationRecord {
  id: string;
  animal_type: 'Buffalo' | 'Calf' | 'Cow';
  animal_id: string;
  animal_name: string;
  treatment_date: string;
  medicine_name: string;
  medicine_category: string;
  disease_issue: string;
  medicine_dosage: string;
  frequency: string;
  treatment_duration: string;
  administration_method: string;
  vet_doctor: string;
  prescription_upload?: string;
  medication_cost: number;
  status: 'Ongoing' | 'Completed';
  follow_up_date?: string;
  additional_notes: string;
  bill_id?: string;
  created_at: string;
}

export interface VeterinaryBillItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface VeterinaryBill {
  id: string;
  bill_number: string;
  bill_date: string;
  animal_id: string;
  animal_category: string;
  supplier_clinic: string;
  bill_category: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  amount_paid: number;
  outstanding_amount: number;
  payment_method: string;
  receipt_attachment?: string;
  items: VeterinaryBillItem[];
  linked_expense_id?: string;
  created_at: string;
}

export interface SMSNotificationSettings {
  registered_mobile: string;
  is_verified: boolean;
  sms_enabled: boolean;
  intervals: {
    before_7_days: boolean;
    before_3_days: boolean;
    before_1_day: boolean;
    on_due_date: boolean;
    daily_overdue: boolean;
  };
  animal_categories: {
    buffalo: boolean;
    calf: boolean;
    cow: boolean;
  };
  provider: 'msg91' | 'twilio' | 'webhook' | 'simulator';
  api_key: string;
  auth_token: string;
  sender_id: string;
  template_id: string;
  twilio_account_sid: string;
  twilio_phone_number: string;
}

export interface SMSNotificationLog {
  id: string;
  animal_type: string;
  animal_id: string;
  animal_name: string;
  event_type: string;
  reminder_interval: string;
  scheduled_date: string;
  recipient_phone: string;
  message_text: string;
  provider: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Simulated';
  provider_message_id: string;
  error_message: string;
  sent_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  animal_stats: {
    total_buffaloes: number;
    total_cows: number;
    total_calves: number;
    total_pregnant_buffaloes: number;
    total_lactating_buffaloes: number;
    total_active_milking_animals: number;
    expected_deliveries_this_month: number;
    deworming_due_today: number;
    deworming_overdue: number;
    upcoming_vaccinations: number;
    animals_under_treatment: number;
    total_daily_milk_litres: number;
    buffalo_daily_milk_litres: number;
    cow_daily_milk_litres: number;
  };
  financial_stats: {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    total_medical_expenses: number;
    currency: string;
  };
}

export interface HealthAlert {
  animal_id: string;
  animal_name: string;
  animal_type: string;
  activity: string;
  due_date: string;
  status: string;
  badge_variant: string;
  url: string;
}
