/**
 * MedDirect Login & Google Sign-In Diagnostic Tool
 * Copy and paste this in your browser console (F12) to test authentication
 */

console.log('🔍 MedDirect Authentication Diagnostic Starting...');

// Test 1: Check backend connectivity
async function testBackendConnection() {
    console.log('\n📡 Test 1: Backend Connection');
    try {
        const response = await fetch('http://localhost:4001');
        const text = await response.text();
        console.log('   ✅ Backend is running:', response.status, text.substring(0, 100));
        return true;
    } catch (error) {
        console.log('   ❌ Backend connection failed:', error.message);
        console.log('   💡 Solution: Run "cd backend && npm start"');
        return false;
    }
}

// Test 2: Check user registration endpoint
async function testRegistration() {
    console.log('\n👤 Test 2: User Registration Endpoint');
    try {
        const testUser = {
            name: "Test User",
            email: `test${Date.now()}@example.com`,
            password: "password123",
            captchaToken: null // Skip captcha for test
        };
        
        const response = await fetch('http://localhost:4001/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        const data = await response.json();
        console.log('   📝 Registration response:', data);
        
        if (data.success) {
            console.log('   ✅ Registration endpoint working');
            return true;
        } else {
            console.log('   ⚠️ Registration issue:', data.message);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Registration test failed:', error.message);
        return false;
    }
}

// Test 3: Check Firebase configuration
function testFirebaseConfig() {
    console.log('\n🔥 Test 3: Firebase Configuration');
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined' && typeof window.firebase === 'undefined') {
        console.log('   ⚠️ Firebase not loaded globally, checking modules...');
    }
    
    // Check Firebase config in window
    const scripts = Array.from(document.querySelectorAll('script'));
    const firebaseScript = scripts.find(s => s.src && s.src.includes('firebase'));
    
    if (firebaseScript) {
        console.log('   ✅ Firebase script found:', firebaseScript.src);
    } else {
        console.log('   ⚠️ Firebase script not found in DOM');
    }
    
    // Check if popup blockers are active
    const popupTest = window.open('', '_blank', 'width=1,height=1');
    if (popupTest) {
        popupTest.close();
        console.log('   ✅ Popups are allowed');
        return true;
    } else {
        console.log('   ❌ Popups are blocked - this will break Google Sign-In');
        console.log('   💡 Solution: Allow popups for this site');
        return false;
    }
}

// Test 4: Check local storage
function testLocalStorage() {
    console.log('\n💾 Test 4: Local Storage');
    try {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        
        if (value === 'value') {
            console.log('   ✅ Local storage working');
            
            // Check for existing tokens
            const existingToken = localStorage.getItem('token');
            if (existingToken) {
                console.log('   ⚠️ Existing token found:', existingToken.substring(0, 20) + '...');
                console.log('   💡 This might cause issues. Clear with: localStorage.clear()');
            } else {
                console.log('   ✅ No existing tokens found');
            }
            return true;
        }
    } catch (error) {
        console.log('   ❌ Local storage error:', error.message);
        return false;
    }
}

// Test 5: Quick fix for common issues
function quickFix() {
    console.log('\n🔧 Quick Fix: Clearing problematic data...');
    
    // Clear all storage
    try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('   ✅ Storage cleared');
    } catch (error) {
        console.log('   ❌ Storage clear failed:', error.message);
    }
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    console.log('   ✅ Cookies cleared');
}

// Run all tests
async function runDiagnostics() {
    console.log('🚀 Running comprehensive authentication diagnostics...\n');
    
    const backendOK = await testBackendConnection();
    const storageOK = testLocalStorage();
    const firebaseOK = testFirebaseConfig();
    
    if (backendOK) {
        await testRegistration();
    }
    
    console.log('\n📋 Diagnostic Summary:');
    console.log(`   Backend: ${backendOK ? '✅' : '❌'}`);
    console.log(`   Storage: ${storageOK ? '✅' : '❌'}`);
    console.log(`   Firebase: ${firebaseOK ? '✅' : '❌'}`);
    
    if (!backendOK || !storageOK || !firebaseOK) {
        console.log('\n🔧 Issues found! Running quick fix...');
        quickFix();
        console.log('   💡 Please refresh the page and try again');
    } else {
        console.log('\n🎉 All systems look good!');
        console.log('   📝 Try creating an account or signing in with Google');
    }
    
    console.log('\n🆘 If issues persist:');
    console.log('   1. Make sure backend is running: cd backend && npm start');
    console.log('   2. Allow popups for this site');
    console.log('   3. Clear browser cache and cookies');
    console.log('   4. Try incognito/private browsing mode');
}

// Export functions to window for manual testing
window.authDiagnostics = {
    runAll: runDiagnostics,
    testBackend: testBackendConnection,
    testRegistration: testRegistration,
    testFirebase: testFirebaseConfig,
    testStorage: testLocalStorage,
    quickFix: quickFix
};

// Auto-run diagnostics
runDiagnostics();