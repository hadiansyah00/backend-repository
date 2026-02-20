require('dotenv').config();
const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Test database connection
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // 2. Sync models (Warning: alter: true modifies tables to match models)
    // For development only. In production, use migrations!
    await db.sequelize.sync({ alter: true });
    // await db.sequelize.sync({ force: true }); // Use force:true ONLY if you want to drop and recreate all tables
    console.log('Database synced successfully.');

    // 3. Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`👉 http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
