import app from './server.js';
import { db } from './db.js';
import http from 'http';

async function runE2ERegistrationTests() {
  console.log('================================================================');
  console.log(' DAIRYFLOW — REGISTRATION & AUTHENTICATION END-TO-END TEST SUITE');
  console.log('================================================================\n');

  // Start temporary server for testing
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5088, '127.0.0.1', resolve));
  const BASE_URL = 'http://127.0.0.1:5088';

  let passedTests = 0;

  try {
    // Clean up test users first
    db.deleteMany('farm_users', u => u.username.toLowerCase() === 'pawan_1606' || u.email.toLowerCase() === 'pawanshankardurisetti@gmail.com');

    // -------------------------------------------------------------
    // TEST 1: First Owner Registration
    // -------------------------------------------------------------
    console.log('▶ [TEST 1] First Owner Registration (Pawan Shankar / Pawan_1606)...');
    const ownerPayload = {
      full_name: 'Pawan Shankar',
      username: 'Pawan_1606',
      email: 'pawanshankardurisetti@gmail.com',
      mobile_number: '6305869563',
      password: 'password123',
      confirm_password: 'password123',
      role: 'Owner / Super Admin',
      agreed_to_terms: true
    };

    const res1 = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ownerPayload)
    });

    console.log(`   Response status: ${res1.status}`);
    const data1 = await res1.json();
    if (res1.status !== 201) {
      throw new Error(`Test 1 Failed: Expected status 201, got ${res1.status}. Error: ${JSON.stringify(data1)}`);
    }
    if (!data1.token || !data1.user || data1.user.role !== 'Owner / Super Admin') {
      throw new Error(`Test 1 Failed: User token or role invalid. Data: ${JSON.stringify(data1)}`);
    }

    // Verify DB insertion
    const dbOwner = db.getOne('farm_users', u => u.username === 'Pawan_1606');
    if (!dbOwner) {
      throw new Error('Test 1 Failed: User record was not persisted to the database.');
    }
    console.log(`   ✅ Owner registered and persisted in DB: ID ${dbOwner.id}, Role: ${dbOwner.role}`);
    console.log(`   ✅ JWT token successfully generated for session authentication.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 2: Duplicate Registration Check
    // -------------------------------------------------------------
    console.log('▶ [TEST 2] Duplicate Registration Validation...');
    const dupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ownerPayload)
    });

    console.log(`   Duplicate response status: ${dupRes.status}`);
    const dupData = await dupRes.json();
    if (dupRes.status !== 409) {
      throw new Error(`Test 2 Failed: Expected 409 Conflict for duplicate username, got ${dupRes.status}`);
    }
    console.log(`   ✅ Verified duplicate rejection message: "${dupData.error}" (HTTP 409, No 500).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 3: Invalid Password / Mismatch
    // -------------------------------------------------------------
    console.log('▶ [TEST 3] Password Mismatch Validation...');
    const mismatchRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...ownerPayload,
        username: 'unique_user_3',
        email: 'unique3@test.com',
        confirm_password: 'differentPassword!'
      })
    });

    console.log(`   Mismatch response status: ${mismatchRes.status}`);
    const mismatchData = await mismatchRes.json();
    if (mismatchRes.status !== 400) {
      throw new Error(`Test 3 Failed: Expected 400 Bad Request, got ${mismatchRes.status}`);
    }
    console.log(`   ✅ Verified password mismatch caught: "${mismatchData.error}" (HTTP 400).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 4: Missing Required Fields
    // -------------------------------------------------------------
    console.log('▶ [TEST 4] Missing Required Fields Validation...');
    const missingRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: '',
        username: '',
        email: 'invalid-email'
      })
    });

    console.log(`   Missing fields response status: ${missingRes.status}`);
    const missingData = await missingRes.json();
    if (missingRes.status !== 400) {
      throw new Error(`Test 4 Failed: Expected 400 for missing fields, got ${missingRes.status}`);
    }
    console.log(`   ✅ Verified input validation response: "${missingData.error}" (HTTP 400).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 5: Subsequent Public Super Admin Registration Prevention
    // -------------------------------------------------------------
    console.log('▶ [TEST 5] Super Admin Privilege Escalation Prevention...');
    const unauthorizedAdminRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Attacker User',
        username: 'attacker_admin',
        email: 'attacker@evil.com',
        password: 'password123',
        confirm_password: 'password123',
        role: 'Owner / Super Admin',
        agreed_to_terms: true
      })
    });

    console.log(`   Unauthorized admin registration status: ${unauthorizedAdminRes.status}`);
    const unauthorizedData = await unauthorizedAdminRes.json();
    if (unauthorizedAdminRes.status !== 403) {
      throw new Error(`Test 5 Failed: Expected 403 Forbidden for duplicate Super Admin, got ${unauthorizedAdminRes.status}`);
    }
    console.log(`   ✅ Verified unauthorized Owner registration blocked: "${unauthorizedData.error}" (HTTP 403).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 6: Login with Newly Created Owner Credentials
    // -------------------------------------------------------------
    console.log('▶ [TEST 6] Login using New Owner Credentials...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Pawan_1606',
        password: 'password123'
      })
    });

    console.log(`   Login response status: ${loginRes.status}`);
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) {
      throw new Error(`Test 6 Failed: Expected 200 OK for login, got ${loginRes.status}`);
    }
    if (!loginData.token || loginData.user.username !== 'Pawan_1606' || loginData.user.role !== 'Owner / Super Admin') {
      throw new Error(`Test 6 Failed: User identity or token mismatch: ${JSON.stringify(loginData)}`);
    }

    // Verify token with /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.username !== 'Pawan_1606') {
      throw new Error(`Test 6 Failed: Token verification failed on /api/auth/me.`);
    }
    console.log(`   ✅ Logged in successfully: Token issued for ${meData.full_name} (${meData.role}).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 7: SMS Gateway Graceful Fallback
    // -------------------------------------------------------------
    console.log('▶ [TEST 7] SMS Provider Unavailable (Non-blocking Verification)...');
    const smsUserPayload = {
      full_name: 'SMS Worker',
      username: 'sms_worker_test',
      email: 'smsworker@dairyflow.com',
      mobile_number: '+919111122222',
      password: 'password123',
      confirm_password: 'password123',
      role: 'Farm Worker',
      agreed_to_terms: true
    };
    const smsRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsUserPayload)
    });

    console.log(`   SMS user signup status: ${smsRes.status}`);
    if (smsRes.status !== 201) {
      throw new Error(`Test 7 Failed: Expected 201, account creation was blocked by SMS failure.`);
    }
    db.deleteMany('farm_users', u => u.username === 'sms_worker_test');
    console.log(`   ✅ Account created successfully despite SMS provider being unconfigured. Zero rollback.\n`);
    passedTests++;

    console.log('================================================================');
    console.log(` 🎉 ALL ${passedTests}/7 END-TO-END REGISTRATION & AUTH TESTS PASSED!`);
    console.log('================================================================');

  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runE2ERegistrationTests();
