import express from 'express';
import cors from 'cors';
import { seed } from './seed.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import walletRoutes from './routes/wallet.js';
import buyRoutes from './routes/buy.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

// Auto-seed on startup
try {
  if (seed()) console.log('Database seeded with initial data.');
} catch (err) {
  console.error('Seed failed:', err.message);
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/buy', buyRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
