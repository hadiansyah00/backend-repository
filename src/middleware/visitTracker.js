const { VisitLog } = require('../models');

/**
 * Middleware to track repository visits asynchronously.
 * It does not block the main request flow.
 */
const visitTracker = async (req, res, next) => {
  try {
    const repositoryId = req.params.id; // Could be undefined if it's a general site visit
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    // Fire & Forget: Don't await this so it doesn't block the API response
    VisitLog.create({
      repository_id: repositoryId || null,
      ip_address: ipAddress,
      user_agent: userAgent
    }).catch(err => {
      console.error('Failed to log visit:', err);
    });

  } catch (error) {
    console.error('Error in visitTracker middleware:', error);
  } finally {
    // Always call next() to continue processing the request
    next();
  }
};

module.exports = visitTracker;
