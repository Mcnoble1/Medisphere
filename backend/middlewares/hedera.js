export function attachHederaClient(req, res, next) {
  // Get Hedera client from app instance
  req.hederaClient = req.app.get('hederaClient');

  if (!req.hederaClient) {
    console.error('Hedera client not found in app instance');
    return res.status(500).json({
      message: 'Hedera client not available',
      error: 'Backend service unavailable'
    });
  }

  next();
}