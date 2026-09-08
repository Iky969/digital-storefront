import { Router } from 'express';
import db from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/buy — atomic purchase + instant delivery
router.post('/', requireAuth, (req, res) => {
  const { product_id, target_data } = req.body || {};

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const isTopup = product.type === 'game_topup';
  if (isTopup && (!target_data || !String(target_data).trim())) {
    return res.status(400).json({ error: 'Target data (Game ID) is required for topup products' });
  }

  const stockItem = isTopup
    ? { id: null, content: 'AUTO_FULFILLED' }
    : db
        .prepare('SELECT id, content FROM items_stock WHERE product_id = ? AND is_sold = 0 LIMIT 1')
        .get(product.id);

  if (!isTopup && !stockItem) return res.status(409).json({ error: 'Out of stock' });
  if (user.balance < product.price) {
    return res.status(400).json({ error: 'Insufficient balance', balance: user.balance, price: product.price });
  }

  const deductBalance = db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?');
  const markSold = db.prepare('UPDATE items_stock SET is_sold = 1 WHERE id = ?');
  const insertTx = db.prepare(
    `INSERT INTO transactions (user_id, product_id, price, target_data, delivered_content, status)
     VALUES (?, ?, ?, ?, ?, 'completed')`
  );

  let txId;
  const tx = db.transaction(() => {
    deductBalance.run(product.price, user.id);
    if (stockItem.id) markSold.run(stockItem.id);
    const info = insertTx.run(user.id, product.id, product.price, target_data || null, stockItem.content);
    txId = info.lastInsertRowid;
  });
  tx();

  const updated = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id);
  return res.json({
    success: true,
    transaction_id: txId,
    delivered_content: stockItem.content,
    new_balance: updated.balance,
  });
});

export default router;