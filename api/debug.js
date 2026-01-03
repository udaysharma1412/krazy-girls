// Debug API Function for Vercel
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      mongodb_uri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      jwt_secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      email_host: process.env.EMAIL_HOST || 'NOT SET',
      email_port: process.env.EMAIL_PORT || 'NOT SET',
      email_user: process.env.EMAIL_USER || 'NOT SET',
      email_pass: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
      jwt_expire: process.env.JWT_EXPIRE || 'NOT SET',
      node_version: process.version,
      platform: process.platform,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
      headers: req.headers,
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body
    };

    console.log('🔍 Debug API called:', debugInfo);

    res.status(200).json({
      success: true,
      message: 'Debug information retrieved successfully',
      debug: debugInfo
    });

  } catch (error) {
    console.error('❌ Debug API error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug API error',
      error: error.message
    });
  }
};
