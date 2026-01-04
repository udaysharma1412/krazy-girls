// Simple test function for Vercel
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 Test function called!');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Headers:', req.headers);
    console.log('🔍 Environment variables:', {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    });

    res.status(200).json({
      success: true,
      message: 'Test function working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      environment: 'Vercel'
    });

  } catch (error) {
    console.error('❌ Test function error:', error);
    res.status(500).json({
      success: false,
      message: 'Test function error',
      error: error.message
    });
  }
};
