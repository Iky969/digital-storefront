import { Router } from 'express';
import db from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PAYMENT_METHODS = ['DANA', 'OVO', 'GoPay', 'QRIS'];

function generatePaymentCode(method) {
  const digits = Math.floor(100000000 + Math.random() * 900000000);
  return `${method === 'QRIS' ? 'QRIS-' : ''}${digits}`;
}

// POST /api/wallet/deposit
router.post('/deposit', requireAuth, (req, res) => {
  const { amount, payment_method } = req.body || {};
  const parsed = Number(amount);
  if (!Number.isInteger(parsed) || parsed < 1000) {
    return res.status(400).json({ error: 'Amount must be an integer of at least 1000' });
  }
  if (!PAYMENT_METHODS.includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  const payment_code = generatePaymentCode(payment_method);
  const info = db
    .prepare(
      'INSERT INTO deposits (user_id, amount, payment_method, payment_code, status) VALUES (?, ?, ?, ?, ?)'
    )
    .run(req.user.id, parsed, payment_method, payment_code, 'pending');

  const deposit = db.prepare('SELECT * FROM deposits WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json({ deposit });
});

// POST /api/wallet/deposit/confirm
router.post('/deposit/confirm', requireAuth, (req, res) => {
  const { deposit_id } = req.body || {};
  const deposit = db.prepare('SELECT * FROM deposits WHERE id = ? AND user_id = ?').get(deposit_id, req.user.id);
  if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
  if (deposit.status !== 'pending') {
    return res.status(400).json({ error: `Deposit already ${deposit.status}` });
  }

  const updateDeposit = db.prepare("UPDATE deposits SET status = 'success' WHERE id = ?");
  const creditBalance = db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');

  const tx = db.transaction(() => {
    updateDeposit.run(deposit.id);
    creditBalance.run(deposit.amount, req.user.id);
  });
  tx();

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return res.json({
    success: true,
    message: 'Deposit confirmed, balance credited',
    new_balance: user.balance,
  });
});

// GET /api/wallet/history
router.get('/history', requireAuth, (req, res) => {
  const deposits = db
    .prepare('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.user.id);
  const transactions = db
    .prepare(
      `SELECT t.*, p.name AS product_name FROM transactions t
       JOIN products p ON p.id = t.product_id
       WHERE t.user_id = ? ORDER BY t.created_at DESC, t.id DESC`
    )
    .all(req.user.id);
  return res.json({ deposits, transactions });
});

export default router;