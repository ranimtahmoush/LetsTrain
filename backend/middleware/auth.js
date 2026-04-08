const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Token present:', !!token);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? `[SET]` : '[NOT SET, using default]');
  
  if (!token) {
    console.log('ERROR: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret';
    console.log('Verifying with secret:', secret === 'your_jwt_secret' ? '[CUSTOM_SECRET]' : '[DEFAULT_SECRET]');
    const decoded = jwt.verify(token, secret);
    console.log('Token verified successfully');
    console.log('Decoded user:', decoded.user);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('ERROR: Token verification failed');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
};