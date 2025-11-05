// Emergency Token Cleanup Script
// Run this in browser console (F12) to fix "Invalid token format" errors

(function() {
    console.log('🧹 Starting emergency token cleanup...');
    
    // Clear ALL localStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`   Cleared localStorage: ${key}`);
    });
    
    // Clear ALL sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`   Cleared sessionStorage: ${key}`);
    });
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('✅ Emergency cleanup complete!');
    console.log('🔄 Reloading page in 2 seconds...');
    
    setTimeout(() => {
        window.location.reload();
    }, 2000);
})();