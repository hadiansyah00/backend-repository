const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Static files
// ======================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ======================
// Swagger Docs (HARUS DI ATAS)
// ======================
app.use(
  "/api/docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, {
    explorer: true,
  })
);

// ======================
// Health Check
// ======================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Repository API is running',
  });
});

// ======================
// API Routes
// ======================
const routes = require('./routes');
app.use('/api', routes);

// ======================
// 404 Handler (PALING AKHIR)
// ======================
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;