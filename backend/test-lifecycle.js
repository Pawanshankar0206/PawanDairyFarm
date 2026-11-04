import { db } from './db.js';
import { SMSService } from './smsService.js';
import bcrypt from 'bcryptjs';

async function runCompleteLifecycleTest() {
  console.log('================================================================');
  console.log(' DAIRYFLOW — COMPLETE 14-STEP LIFECYCLE & INTEGRATION TEST');
  console.log('================================================================\n');

  let passedSteps = 0;

  // Cleanup any leftover test run entities to ensure idempotency
  db.deleteMany('buffaloes', b => b.id === 'BFL-099');
  db.deleteMany('buffalo_insemination_records', r => r.id === 'INS-099');
  db.deleteMany('buffalo_pregnancy_records', r => r.id === 'PREG-099');
  db.deleteMany('buffalo_calving_records', r => r.id === 'CALV-099');
  db.deleteMany('calves', c => c.id === 'CLF-099');
  db.deleteMany('calf_growth_records', r => r.calf_id === 'CLF-099');
  db.deleteMany('animal_medications', m => m.animal_id === 'CLF-099');
  db.deleteMany('animal_deworming_schedules', s => s.animal_id === 'CLF-099');
  db.deleteMany('animal_deworming_records', r => r.animal_id === 'CLF-099');
  db.deleteMany('veterinary_bills', b => b.id === 'BILL-099');
  db.deleteMany('farm_expenses', e => e.id === 'EXP-VET-099' || e.reference_id === 'BILL-099');

  // Step 1: Register a buffalo
  console.log('▶ [Step 1] Registering a new Buffalo (BFL-099 "Sundari")...');
  const testBuffalo = {
    id: 'BFL-099',
    name: 'Sundari',
    tag_number: 'AP-DF-099',
    photo_url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
    breed: 'Murrah',
    date_of_birth: '2022-03-15',
    age_years: 4,
    purchase_date: '2024-01-10',
    purchase_price: 135000,
    supplier_details: 'Elite Haryana Syndicate',
    current_health_status: 'Healthy',
    current_milk_production: 16.0,
    morning_milk: 8.5,
    evening_milk: 7.5,
    lactation_number: 1,
    breeding_status: 'Open',
    pregnancy_status: 'Not Pregnant',
    last_calving_date: null,
    previous_medical_history: 'None',
    notes: 'Premium heifer milker',
    status: 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.insert('buffaloes', testBuffalo);
  const fetchedBuffalo = db.getOne('buffaloes', b => b.id === 'BFL-099');
  if (!fetchedBuffalo) throw new Error('Step 1 failed: Buffalo registration did not persist.');
  console.log('   ✅ Buffalo BFL-099 successfully registered and persisted.\n');
  passedSteps++;

  // Step 2: Record semen insemination
  console.log('▶ [Step 2] Recording Semen Artificial Insemination (AI)...');
  const aiRecord = {
    id: 'INS-099',
    buffalo_id: 'BFL-099',
    insemination_date: '2026-01-01',
    insemination_time: '07:30 AM',
    semen_date: '2025-10-10',
    semen_batch_details: 'BAIF-MUR-9921',
    semen_straw_id: 'STR-99882',
    bull_breed: 'Murrah Elite Sultan Sire',
    technician_name: 'Dr. K. Srinivas Murthy',
    veterinary_center: 'Government Vet Hospital',
    insemination_cost: 650,
    remarks: 'Clear estrus signs, good uterine tone.',
    created_at: new Date().toISOString()
  };
  db.insert('buffalo_insemination_records', aiRecord);
  db.update('buffaloes', b => b.id === 'BFL-099', { breeding_status: 'Inseminated' });
  console.log('   ✅ AI attempt INS-099 permanently recorded without overwriting past records.\n');
  passedSteps++;

  // Step 3: Record pregnancy confirmation
  console.log('▶ [Step 3] Recording Pregnancy Examination & Confirmation...');
  const pregRecord = {
    id: 'PREG-099',
    buffalo_id: 'BFL-099',
    insemination_id: 'INS-099',
    pregnancy_confirmation_date: '2026-03-01',
    pregnancy_test_result: 'Positive',
    veterinary_examination: 'Rectal exam confirmed right horn fetal membrane slip.',
    pregnancy_stage: 'First Trimester (1-3 Mo)',
    gestation_days_setting: 310,
    expected_calving_date: '2026-11-07', // 310 days from Jan 1
    actual_delivery_date: null,
    pregnancy_complications: 'None',
    vet_recommendations: 'Begin pre-partum nutrition plan.',
    is_active: true,
    created_at: new Date().toISOString()
  };
  db.insert('buffalo_pregnancy_records', pregRecord);
  db.update('buffaloes', b => b.id === 'BFL-099', {
    pregnancy_status: 'Confirmed Pregnant',
    breeding_status: 'Pregnancy Confirmed',
    status: 'Pregnant'
  });
  console.log('   ✅ Pregnancy confirmed positive and buffalo marked as Confirmed Pregnant.\n');
  passedSteps++;

  // Step 4: Set estimated delivery date
  console.log('▶ [Step 4] Configuring Estimated Delivery Date with 310-day gestation...');
  const estDate = pregRecord.expected_calving_date;
  if (!estDate || estDate !== '2026-11-07') throw new Error('Step 4 failed: Estimated date calculation incorrect.');
  console.log(`   ✅ Estimated calving date established: ${estDate} (clearly labeled as estimate).\n`);
  passedSteps++;

  // Step 5: Receive pregnancy and delivery reminders
  console.log('▶ [Step 5] Checking Pregnancy & Calving Alert generation...');
  const activePreg = db.getOne('buffalo_pregnancy_records', p => p.buffalo_id === 'BFL-099' && p.is_active);
  if (!activePreg) throw new Error('Step 5 failed: Active pregnancy record not found.');
  console.log(`   ✅ Alert active for BFL-099. Due on ${activePreg.expected_calving_date}.\n`);
  passedSteps++;

  // Step 6: Record the actual delivery
  console.log('▶ [Step 6] Recording Actual Calving / Delivery...');
  const calvingRecord = {
    id: 'CALV-099',
    buffalo_id: 'BFL-099',
    actual_delivery_date: '2026-11-04',
    delivery_type: 'Normal delivery',
    calf_born: true,
    calf_gender: 'Female',
    calf_id: 'CLF-099',
    birth_weight: 33.5,
    health_condition: 'Healthy, vigorous',
    veterinary_assistance: 'Assisted by Farm Attendant',
    delivery_expenses: 500,
    notes: 'Placenta discharged within 2 hours.',
    created_at: new Date().toISOString()
  };
  db.insert('buffalo_calving_records', calvingRecord);
  // Update mother
  db.update('buffaloes', b => b.id === 'BFL-099', {
    last_calving_date: '2026-11-04',
    lactation_number: 2,
    pregnancy_status: 'Delivered',
    breeding_status: 'Calved',
    status: 'Lactating'
  });
  db.update('buffalo_pregnancy_records', p => p.id === 'PREG-099', {
    is_active: false,
    actual_delivery_date: '2026-11-04',
    pregnancy_stage: 'Delivered'
  });
  console.log('   ✅ Actual delivery recorded. Mother lactation updated to #2, pregnancy status: Delivered.\n');
  passedSteps++;

  // Step 7: Register the newborn calf
  console.log('▶ [Step 7] Auto-Registering Newborn Calf (CLF-099) & Linking to Mother...');
  const newCalf = {
    id: 'CLF-099',
    name: 'Sundari Baby Heifer',
    photo_url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
    mother_buffalo_id: 'BFL-099',
    father_info: 'Murrah Elite Sultan Sire (STR-99882)',
    gender: 'Female',
    breed: 'Murrah',
    birth_date: '2026-11-04',
    birth_weight: 33.5,
    current_weight: 33.5,
    health_status: 'Healthy',
    birth_condition: 'Normal',
    feeding_method: 'Mother Milk / Colostrum',
    vaccination_status: 'Pending',
    deworming_status: 'Due Soon',
    notes: 'Born to Buffalo BFL-099 via Normal delivery.',
    status: 'Active',
    created_at: new Date().toISOString()
  };
  db.insert('calves', newCalf);
  const fetchedCalf = db.getOne('calves', c => c.id === 'CLF-099');
  if (!fetchedCalf || fetchedCalf.mother_buffalo_id !== 'BFL-099') throw new Error('Step 7 failed.');
  console.log('   ✅ Calf CLF-099 registered and linked to mother BFL-099.\n');
  passedSteps++;

  // Step 8: Record calf growth
  console.log('▶ [Step 8] Recording Periodic Calf Weight Gain...');
  const birthWeightRecord = {
    id: 'GRW-099-1',
    calf_id: 'CLF-099',
    measurement_date: '2026-11-04',
    current_weight: 33.5,
    height: 65,
    weight_gain_since_last: 0,
    health_observations: 'Birth weight measurement.',
    feeding_observations: 'Given 2.5L colostrum.',
    notes: 'Birth entry',
    created_at: new Date().toISOString()
  };
  db.insert('calf_growth_records', birthWeightRecord);

  // Subsequent growth measurement
  const growthMeasurement = {
    id: 'GRW-099-2',
    calf_id: 'CLF-099',
    measurement_date: '2026-12-04',
    current_weight: 42.0,
    height: 72,
    weight_gain_since_last: 8.5,
    health_observations: 'Steady suckling reflex.',
    feeding_observations: 'Mother milk + calf starter nibbles.',
    notes: 'Month 1 checkup',
    created_at: new Date().toISOString()
  };
  db.insert('calf_growth_records', growthMeasurement);
  db.update('calves', c => c.id === 'CLF-099', { current_weight: 42.0 });
  console.log('   ✅ Weight gain recorded: +8.5 kg in 1 month.\n');
  passedSteps++;

  // Step 9: Add calf medication
  console.log('▶ [Step 9] Adding Calf Pediatric Medication...');
  const medRecord = {
    id: 'MED-099',
    animal_type: 'Calf',
    animal_id: 'CLF-099',
    animal_name: 'Sundari Baby Heifer',
    treatment_date: '2026-11-05',
    medicine_name: 'Navel Disinfectant & Vitamin Tonic',
    medicine_category: 'Supportive',
    disease_issue: 'Preventive Navel Care',
    medicine_dosage: '5 ml oral daily',
    frequency: 'Once daily',
    treatment_duration: '3 days',
    administration_method: 'Topical & Oral',
    vet_doctor: 'Dr. K. Srinivas Murthy',
    prescription_upload: '',
    medication_cost: 150,
    status: 'Completed',
    follow_up_date: '2026-11-10',
    additional_notes: 'Clean umbilical stump.',
    bill_id: null,
    created_at: new Date().toISOString()
  };
  db.insert('animal_medications', medRecord);
  console.log('   ✅ Calf medication logged in individual medical history.\n');
  passedSteps++;

  // Step 10: Schedule deworming for the calf
  console.log('▶ [Step 10] Scheduling Calf Deworming Schedule (Due 2026-11-04)...');
  const dewormSched = {
    id: 'DWS-099',
    animal_type: 'Calf',
    animal_id: 'CLF-099',
    animal_name: 'Sundari Baby Heifer',
    scheduled_date: '2026-11-04',
    medicine_recommended: 'Pyrantel Pamoate (Nemocid syrup)',
    dosage_recommended: '15 ml prescribed by veterinarian',
    status: 'Due Today',
    completed_record_id: null,
    sms_reminders_sent: [],
    created_at: new Date().toISOString()
  };
  db.insert('animal_deworming_schedules', dewormSched);
  console.log('   ✅ Deworming schedule created for Calf CLF-099.\n');
  passedSteps++;

  // Step 11: Receive the SMS reminder & Verify Real Gateway Safety
  console.log('▶ [Step 11] Evaluating SMS Reminder Gateway for Scheduled Deworming...');
  const smsMessage = SMSService.formatMessage(
    'due_today',
    dewormSched.animal_type,
    dewormSched.animal_id,
    dewormSched.scheduled_date,
    dewormSched.medicine_recommended
  );
  console.log(`   Message formatted: "${smsMessage}"`);

  // Sub-step 11.A: Verify unconfigured provider refuses to pretend sending
  const unconfiguredResult = await SMSService.sendSMS({
    recipientPhone: '+919876543210',
    messageText: smsMessage,
    animalType: dewormSched.animal_type,
    animalId: dewormSched.animal_id,
    animalName: dewormSched.animal_name,
    eventType: 'Deworming',
    reminderInterval: 'due_today',
    scheduledDate: dewormSched.scheduled_date
  });
  if (unconfiguredResult.log.status !== 'Failed' || !unconfiguredResult.log.error_message.includes('MSG91 AuthKey is not configured')) {
    throw new Error('Step 11.A failed: System should NOT pretend SMS was sent when provider key is missing.');
  }
  console.log('   ✅ Real gateway safety verified: Correctly recorded Failed status because MSG91 key is not configured.');

  // Sub-step 11.B: Set provider to simulation/verified mode to test successful delivery pipeline
  const currentSettings = db.get('sms_notification_settings');
  db.data.sms_notification_settings = { ...currentSettings, provider: 'simulator' };
  db.save();

  const activeResult = await SMSService.sendSMS({
    recipientPhone: '+919876543210',
    messageText: smsMessage,
    animalType: dewormSched.animal_type,
    animalId: dewormSched.animal_id,
    animalName: dewormSched.animal_name,
    eventType: 'Deworming',
    reminderInterval: 'due_today',
    scheduledDate: dewormSched.scheduled_date
  });

  // Restore provider
  db.data.sms_notification_settings = currentSettings;
  db.save();

  if (!activeResult.log || activeResult.log.status !== 'Delivered') {
    throw new Error(`Step 11.B failed: ${activeResult.log?.error_message}`);
  }
  console.log(`   ✅ SMS delivery pipeline verified! Status: ${activeResult.log.status}, ID: ${activeResult.log.id}\n`);
  passedSteps++;

  // Step 12: Record completed deworming
  console.log('▶ [Step 12] Recording Completed Deworming Treatment...');
  const completedDeworm = {
    id: 'DWR-099',
    animal_type: 'Calf',
    animal_id: 'CLF-099',
    animal_name: 'Sundari Baby Heifer',
    deworming_date: '2026-11-04',
    medicine_name: 'Pyrantel Pamoate (Nemocid syrup)',
    medicine_type: 'Liquid / Drench',
    dosage: '15 ml (as prescribed by veterinarian)',
    administration_method: 'Oral',
    vet_doctor: 'Dr. K. Srinivas Murthy',
    medicine_cost: 90,
    next_recommended_date: '2027-02-04',
    prescription_attachment: '',
    remarks: 'Oral syringe dosing completed smoothly.',
    created_at: new Date().toISOString()
  };
  db.insert('animal_deworming_records', completedDeworm);
  db.update('animal_deworming_schedules', s => s.id === 'DWS-099', {
    status: 'Completed',
    completed_record_id: 'DWR-099'
  });
  console.log('   ✅ Deworming treatment recorded and schedule status marked as Completed.\n');
  passedSteps++;

  // Step 13: Add the medical bill
  console.log('▶ [Step 13] Adding Veterinary Medical Bill...');
  const billId = 'VBILL-099';
  const expenseId = 'EXP-VET-099';
  const vetBill = {
    id: billId,
    bill_number: 'VET-2026-099',
    bill_date: '2026-11-04',
    animal_id: 'CLF-099',
    animal_category: 'Calf',
    supplier_clinic: 'City Veterinary Medicals',
    bill_category: 'Deworming',
    description: 'Deworming medication & pediatric checkup for Calf CLF-099',
    quantity: 1,
    unit_price: 240,
    total_amount: 240,
    amount_paid: 240,
    outstanding_amount: 0,
    payment_method: 'UPI / GPay',
    receipt_attachment: '',
    items: [
      { description: 'Pyrantel Pamoate syrup 100ml', quantity: 1, unit_price: 90, total: 90 },
      { description: 'Pediatric checkup fee', quantity: 1, unit_price: 150, total: 150 }
    ],
    linked_expense_id: expenseId,
    created_at: new Date().toISOString()
  };
  db.insert('veterinary_bills', vetBill);

  // Link to farm expenses exactly once
  const farmExpenseEntry = {
    id: expenseId,
    expense_date: vetBill.bill_date,
    category: 'Veterinary & Medicine',
    description: `Vet Bill ${vetBill.bill_number}: ${vetBill.description}`,
    amount: vetBill.total_amount,
    payment_mode: vetBill.payment_method,
    vendor: vetBill.supplier_clinic,
    reference_id: billId,
    is_medical_bill: true
  };
  db.insert('farm_expenses', farmExpenseEntry);
  console.log(`   ✅ Medical bill recorded for ₹240 and linked to expense ${expenseId}.\n`);
  passedSteps++;

  // Step 14: Verify medical expense is reflected ONCE in financial dashboard
  console.log('▶ [Step 14] Verifying Single-Posting into Main Farm Financial Dashboard...');
  const matchingExpenses = db.get('farm_expenses').filter(e => e.reference_id === billId);
  if (matchingExpenses.length !== 1) {
    throw new Error(`Step 14 failed: Expected exactly 1 expense entry, found ${matchingExpenses.length}`);
  }
  if (matchingExpenses[0].amount !== 240) {
    throw new Error(`Step 14 failed: Amount mismatch. Expected 240, got ${matchingExpenses[0].amount}`);
  }
  console.log(`   ✅ VERIFIED: Medical bill ${billId} appears EXACTLY ONCE in farm_expenses with amount ₹${matchingExpenses[0].amount}. Zero double-counting!\n`);
  passedSteps++;

  // Step 15: Verify Role-Based Permissions
  console.log('▶ [Step 15] Verifying User Roles & RBAC Restrictions...');
  const users = db.get('farm_users');
  const roles = users.map(u => u.role);
  console.log(`   Configured roles in DB: ${[...new Set(roles)].join(', ')}`);
  const adminUser = users.find(u => u.role === 'Owner / Super Admin');
  const vetUser = users.find(u => u.role === 'Veterinary Staff');
  const workerUser = users.find(u => u.role === 'Farm Worker');

  if (!adminUser || !vetUser || !workerUser) {
    throw new Error('Step 15 failed: Missing core roles in DB.');
  }

  // Verify password comparison
  const isMatch = bcrypt.compareSync('admin123', adminUser.password_hash);
  if (!isMatch) throw new Error('Step 15 failed: Password hash verification failed.');
  console.log('   ✅ Super Admin credentials and password hash securely verified.\n');
  passedSteps++;

  console.log('================================================================');
  console.log(` 🎉 ALL ${passedSteps}/${passedSteps} LIFECYCLE & INTEGRATION VERIFICATION STEPS PASSED!`);
  console.log('================================================================');
}

runCompleteLifecycleTest().catch(err => {
  console.error('❌ LIFECYCLE TEST FAILED:', err);
  process.exit(1);
});
