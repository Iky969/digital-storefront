import { Router } from 'express';
import db from '../database.js';

const router = Router();

// GET /api/products
router.get('/', (req, res) => {
  const { category } = req.query;
  const baseSql = `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
    (SELECT COUNT(*) FROM items_stock s WHERE s.product_id = p.id AND s.is_sold = 0) AS stock_count
   FROM products p
   JOIN categories c ON c.id = p.category_id`;
  const withCategory = `${baseSql} WHERE c.slug = ? ORDER BY p.id ASC`;
  const withoutCategory = `${baseSql} ORDER BY p.id ASC`;

  const products = category
    ? db.prepare(withCategory).all(category)
    : db.prepare(withoutCategory).all();
  return res.json({ products });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db
    .prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
        (SELECT COUNT(*) FROM items_stock s WHERE s.product_id = p.id AND s.is_sold = 0) AS stock_count
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`
    )
    .get(req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json({ product });
});

export default router;