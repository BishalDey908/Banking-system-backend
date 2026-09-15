// Vercel Serverless Function Entrypoint
// Directly mounts the Express banking application
const app = require('../backend/src/app');

module.exports = app;

