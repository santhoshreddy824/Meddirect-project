// Simple Firebase token verification without service account
// For production, you should use proper Firebase Admin SDK with service account

export const verifyFirebaseToken = async (idToken) => {
  try {
    // Simple JWT decode to get basic user info
    // In production, use Firebase Admin SDK for proper verification
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    
    // Basic validation - check if token is for our Firebase project
    if (payload.aud !== "meddirect-7ff5f") {
      throw new Error("Invalid audience");
    }

    // Check if token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error("Token expired");
    }

    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  } catch (error) {
    throw new Error("Invalid Firebase token");
  }
};
