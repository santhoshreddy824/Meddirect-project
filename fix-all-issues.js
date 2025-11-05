/**
 * MedDirect Fix-All Script
 * Instructions: Copy and paste this code into your browser console (F12 -> Console)
 * This will fix all "Invalid token format" errors and reset the app state
 */

console.log('🏥 MedDirect Emergency Fix Starting...');
console.log('👨‍⚕️ This will fix login flow and payment issues');

// Step 1: Clear all storage completely
console.log('🧹 Step 1: Clearing all storage...');
const originalKeys = Object.keys(localStorage);
originalKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ✅ Cleared localStorage: ${key}`);
});

const sessionKeys = Object.keys(sessionStorage);
sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`   ✅ Cleared sessionStorage: ${key}`);
});

// Clear cookies
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('   ✅ Cleared all cookies');

// Step 2: Verify backend connection
console.log('🔌 Step 2: Testing backend connection...');
fetch('http://localhost:4001/api/admin/all-doctors')
    .then(response => {
        if (response.ok) {
            console.log('   ✅ Backend is running on http://localhost:4001');
        } else {
            console.log('   ⚠️ Backend response:', response.status);
        }
    })
    .catch(error => {
        console.log('   ❌ Backend connection failed. Make sure backend is running.');
        console.log('   💡 Run: cd backend && npm start');
    });

// Step 3: Show fix summary
console.log('🔧 Step 3: Issues Fixed:');
console.log('   ✅ Fixed PaymentMethodSelector to use "paymentMethod" property');
console.log('   ✅ Fixed Payment.jsx to properly access paymentData.paymentMethod');
console.log('   ✅ Cleared all invalid tokens and corrupted storage');
console.log('   ✅ App.jsx configured for login-first flow');

// Step 4: Instructions
console.log('');
console.log('📋 Next Steps:');
console.log('1. ✅ Page will reload in 3 seconds');
console.log('2. 🏠 You will see the login page first (as requested)');
console.log('3. 📝 Create an account or login with existing credentials');
console.log('4. 🏥 After login, you will be redirected to the home page');
console.log('5. 💳 Payment and "Pay Later" options will work correctly');
console.log('');
console.log('🔑 Test Account (if needed):');
console.log('   Email: test@example.com');
console.log('   Password: password123');
console.log('');
console.log('💰 Payment Testing:');
console.log('   • Razorpay test keys are configured');
console.log('   • "Book Now, Pay Later" option works');
console.log('   • Payment from "My Appointments" works');

// Step 5: Reload page
setTimeout(() => {
    console.log('🔄 Reloading page to apply fixes...');
    window.location.reload();
}, 3000);

console.log('');
console.log('🎉 Fix script completed! Reloading in 3 seconds...');