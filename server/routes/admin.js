import { Router } from 'express';
import db from '../database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

const PRODUCT_TYPES = ['account_credentials', 'voucher_code', 'game_topup'];

// POST /api/admin/products
router.post('/products', (req, res) => {
  const { category_id, name, description, price, type } = req.body || {};
  if (!name || !category_id || !Number.isInteger(Number(category_id)) || !Number.isInteger(Number(price)) || !PRODUCT_TYPES.includes(type)) {
    return res.status(400).json({ error: 'category_id, name, integer price, and valid type are required' });
  }
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const info = db
    .prepare('INSERT INTO products (category_id, name, description, price, type) VALUES (?, ?, ?, ?, ?)')
    .run(category_id, name, description || null, Number(price), type);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json({ product });
});

// POST /api/admin/stock/bulk
router.post('/stock/bulk', (req, res) => {
  const { product_id, items } = req.body || {};
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const lines = String(items || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return res.status(400).json({ error: 'No stock items provided' });

  const insert = db.prepare('INSERT INTO items_stock (product_id, content) VALUES (?, ?)');
  const tx = db.transaction(() => {
    for (const line of lines) insert.run(product_id, line);
  });
  tx();

  return res.status(201).json({ success: true, inserted: lines.length });
});

// GET /api/admin/deposits/pending
router.get('/deposits/pending', (req, res) => {
  const deposits = db
    .prepare(
      `SELECT d.*, u.username, u.email FROM deposits d
       JOIN users u ON u.id = d.user_id
       WHERE d.status = 'pending'
       ORDER BY d.created_at ASC, d.id ASC`
    )
    .all();
  return res.json({ deposits });
});

// POST /api/admin/deposits/approve
router.post('/deposits/approve', (req, res) => {
  const { deposit_id } = req.body || {};
  const deposit = db.prepare('SELECT * FROM deposits WHERE id = ?').get(deposit_id);
  if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
  if (deposit.status !== 'pending') {
    return res.status(400).json({ error: `Deposit already ${deposit.status}` });
  }

  const updateDeposit = db.prepare("UPDATE deposits SET status = 'success' WHERE id = ?");
  const creditBalance = db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');

  const tx = db.transaction(() => {
    updateDeposit.run(deposit.id);
    creditBalance.run(deposit.amount, deposit.user_id);
  });
  tx();

  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(deposit.user_id);
  return res.json({ success: true, new_balance: user.balance });
});

export default router;