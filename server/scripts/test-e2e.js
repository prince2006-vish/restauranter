// Using native Node.js global fetch

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE END-TO-END SYSTEM TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extra = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${extra}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'Health check endpoint');

    // 2. Public Settings
    const settingsRes = await fetch(`${BASE_URL}/settings`);
    const settingsData = await settingsRes.json();
    assert(settingsRes.status === 200 && settingsData.data.restaurantName === 'Meetha Pani', 'Public Settings (Meetha Pani loaded)');

    // 3. Categories
    const catsRes = await fetch(`${BASE_URL}/categories`);
    const catsData = await catsRes.json();
    assert(catsRes.status === 200 && catsData.count >= 6, 'Dynamic categories from MongoDB', `(Count: ${catsData.count})`);

    // 4. Menu & Filtering
    const foodsRes = await fetch(`${BASE_URL}/foods`);
    const foodsData = await foodsRes.json();
    assert(foodsRes.status === 200 && foodsData.count >= 15, 'Dynamic food items from MongoDB', `(Count: ${foodsData.count})`);

    const searchRes = await fetch(`${BASE_URL}/foods?search=tikka`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.count > 0, 'Food search filter for "tikka"', `(Found: ${searchData.count})`);

    // 5. Security: Unauthorized Admin protection
    const unauthRes = await fetch(`${BASE_URL}/foods/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker Food' }),
    });
    assert(unauthRes.status === 401, 'Unauthorized request rejected (401)');

    // 6. Admin Login
    const loginRes = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'AdminPassword123!' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'Admin login with seed credentials');
    const adminToken = loginData.token;

    // 7. Coupon Validation
    const couponRes = await fetch(`${BASE_URL}/offers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'MEETHA15', subtotal: 600 }),
    });
    const couponData = await couponRes.json();
    assert(couponRes.status === 200 && couponData.discount > 0, 'Coupon MEETHA15 discount calculation', `(Discount: ₹${couponData.discount})`);

    // 8. Order Placement & WhatsApp Generation
    const testFood = foodsData.data[0];
    const checkoutRes = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Anand Mahindra',
        customerPhone: '9876543210',
        customerWhatsapp: '9876543210',
        orderType: 'delivery',
        deliveryAddress: 'Flat 101, Heritage Palm Enclave, Civil Lines, Jaipur',
        landmark: 'Opposite State Museum',
        customerInstructions: 'Extra green chutney and fragrant rose petals please',
        couponCode: 'MEETHA15',
        items: [{ foodId: testFood._id, quantity: 2 }],
      }),
    });
    const checkoutData = await checkoutRes.json();
    assert(checkoutRes.status === 201 && checkoutData.order.orderNumber, 'Order creation & ticket generation', `(ID: ${checkoutData.order?.orderNumber})`);
    assert(checkoutData.whatsappUrl && checkoutData.whatsappUrl.startsWith('https://wa.me/'), 'WhatsApp Click-to-Chat URL generated');
    assert(checkoutData.whatsappMessage && checkoutData.whatsappMessage.includes('NEW ORDER — MEETHA PANI RESTAURANT'), 'WhatsApp order template formatted');

    const createdOrderNumber = checkoutData.order.orderNumber;
    const guestToken = checkoutData.order.guestTrackingToken;

    // 9. Order Tracking with Token (Full Access) vs Without Token (Redacted Privacy Access)
    const trackFullRes = await fetch(`${BASE_URL}/orders/track/${createdOrderNumber}?token=${guestToken}`);
    const trackFullData = await trackFullRes.json();
    assert(trackFullData.fullAccess === true && trackFullData.order.customerPhone === '9876543210', 'Authorized customer/guest tracking with full details');

    const trackRedactedRes = await fetch(`${BASE_URL}/orders/track/${createdOrderNumber}`);
    const trackRedactedData = await trackRedactedRes.json();
    assert(trackRedactedData.fullAccess === false && !trackRedactedData.order.customerPhone, 'Unauthorized guest view redacts private phone & address');

    // 10. Admin Status Update
    const statusRes = await fetch(`${BASE_URL}/orders/admin/${createdOrderNumber}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        orderStatus: 'Preparing',
        note: 'Chef has put the handi on the charcoal stove.',
      }),
    });
    const statusData = await statusRes.json();
    assert(statusRes.status === 200 && statusData.order.orderStatus === 'Preparing', 'Admin order status update to Preparing');

    // 11. Admin Dashboard Stats
    const statsRes = await fetch(`${BASE_URL}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.stats.totalOrders > 0, 'Admin real-time statistics calculated', `(Total Orders: ${statsData.stats?.totalOrders})`);

    // 12. Customer Registration & Order History
    const testCustEmail = `test.patron.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Devika Singhania',
        email: testCustEmail,
        phone: '9876549999',
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, 'Customer registration with secure password');

    // 13. Admin Customer Directory
    const adminCustRes = await fetch(`${BASE_URL}/customers/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminCustData = await adminCustRes.json();
    assert(adminCustRes.status === 200 && adminCustData.total > 0, 'Admin customer directory with total spend stats');

    console.log('\n====================================================');
    console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
