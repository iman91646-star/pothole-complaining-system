import express from 'express';
import path from 'path';
import { apiApp } from './server/api.ts';

const app = express();
const PORT = 3000;

// Mount API routes
app.use(apiApp);

// In production, serve the built Vite application
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback all other client requests to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PotholeTrack full-stack server running at http://0.0.0.0:${PORT}`);
});
