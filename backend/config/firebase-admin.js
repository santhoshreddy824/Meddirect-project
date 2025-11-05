// Dev-friendly Firebase ID token verification without service account
// NOTE: This decodes and performs basic checks only. For production, replace with Firebase Admin SDK verification.

const base64UrlToJson = (segment) => {
  // Add padding if missing
  const pad = segment.length % 4;
  const padded = segment + (pad ? '='.repeat(4 - pad) : '');
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(json);
};

export const verifyFirebaseToken = async (idToken) => {
  try {
    if (!idToken || typeof idToken !== 'string' || idToken.split('.').length < 2) {
      throw new Error('Malformed token');
    }

    const payload = base64UrlToJson(idToken.split('.')[1]);

    // Basic validation - check audience and expiration
    const expectedAud = process.env.FIREBASE_PROJECT_ID || 'meddirect-7ff5f';
    if (payload.aud !== expectedAud) {
      throw new Error('Invalid audience');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};
