import db from './database.js';
import bcrypt from 'bcryptjs';

export function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (userCount > 0) return false;

  const insertUser = db.prepare(
    'INSERT INTO users (username, email, password_hash, balance, role) VALUES (?, ?, ?, ?, ?)'
  );
  insertUser.run('admin', 'admin@store.local', bcrypt.hashSync('admin123', 10), 1000000, 'admin');
  insertUser.run('user', 'user@store.local', bcrypt.hashSync('user123', 10), 50000, 'user');

  const insertCategory = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
  const gameCat = insertCategory.run('Game Topup', 'game-topup', 'Gamepad2').lastInsertRowid;
  const streamCat = insertCategory.run('Streaming Premium', 'streaming-premium', 'Clapperboard').lastInsertRowid;
  const voucherCat = insertCategory.run('Voucher', 'voucher', 'Ticket').lastInsertRowid;

  const insertProduct = db.prepare(
    'INSERT INTO products (category_id, name, description, price, type) VALUES (?, ?, ?, ?, ?)'
  );
  const ml = insertProduct.run(gameCat, 'Mobile Legends 86 Diamonds', 'Instant delivery ke ID kamu.', 20000, 'game_topup').lastInsertRowid;
  const netflix = insertProduct.run(streamCat, 'Netflix Premium 1 Bulan', 'Akun premium shared, garansi 30 hari.', 45000, 'account_credentials').lastInsertRowid;
  const spotify = insertProduct.run(streamCat, 'Spotify Individual 1 Bulan', 'Akun premium, upgrade via email.', 30000, 'account_credentials').lastInsertRowid;
  const gplay = insertProduct.run(voucherCat, 'Google Play Voucher 50k', 'Kode voucher resmi region Indonesia.', 52000, 'voucher_code').lastInsertRowid;
  insertProduct.run(gameCat, 'Valorant 1000 VP', 'Masukkan Riot ID kamu, VP masuk otomatis.', 110000, 'game_topup');

  const insertStock = db.prepare('INSERT INTO items_stock (product_id, content) VALUES (?, ?)');
  const stockLines = {
    [netflix]: [
      'netflix01@mail.com:Pass1234',
      'netflix02@mail.com:Pass1234',
      'netflix03@mail.com:Pass1234',
      'netflix04@mail.com:Pass1234',
      'netflix05@mail.com:Pass1234',
    ],
    [spotify]: [
      'spotify01@mail.com:Pass1234',
      'spotify02@mail.com:Pass1234',
      'spotify03@mail.com:Pass1234',
      'spotify04@mail.com:Pass1234',
      'spotify05@mail.com:Pass1234',
    ],
    [gplay]: [
      'GOOGLEPLAY-50K-AAAA-BBBB',
      'GOOGLEPLAY-50K-CCCC-DDDD',
      'GOOGLEPLAY-50K-EEEE-FFFF',
      'GOOGLEPLAY-50K-GGGG-HHHH',
      'GOOGLEPLAY-50K-IIII-JJJJ',
    ],
  };
  for (const [pid, lines] of Object.entries(stockLines)) {
    for (const line of lines) insertStock.run(Number(pid), line);
  }

  return true;
}

// Run directly: node seed.js
if (import.meta.url === `file://${process.argv[1]}`) {
  const did = seed();
  console.log(did ? 'Seed data inserted.' : 'Data already exists, skipping seed.');
}
