/**
 * Framework-agnostic Vercel Edge Middleware
 * Protects the /admin.html route with Basic Auth.
 */
export default function middleware(request) {
  const url = new URL(request.url);

  // Only protect the /admin.html path
  if (url.pathname !== '/admin.html') {
    return; // Pass through to next route
  }

  const basicAuth = request.headers.get('authorization');
  
  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1];
      const decoded = atob(authValue);
      const [user, pwd] = decoded.split(':');

      // Check against Environment Variables in Vercel
      // Default fallback (only for local testing) is 'admin' / 'aurum2026'
      const correctUser = process.env.ADMIN_USER || 'admin';
      const correctPass = process.env.ADMIN_PASS || 'aurum2026';

      if (user === correctUser && pwd === correctPass) {
        return; // Allow access
      }
    } catch (e) {
      console.error('Basic Auth decoding failed', e);
    }
  }

  // If not authenticated, trigger the browser's basic auth popup
  return new Response('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="AURUM Secure Admin"',
    },
  });
}
