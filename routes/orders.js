// orders.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const { customer_id, book_id } = req.body;

    // Periksa apakah buku tersedia dalam inventaris
    const inventoryQuery = "SELECT * FROM inventory WHERE book_id = $1 AND quantity > 0";
    const inventoryResult = await pool.query(inventoryQuery, [book_id]);

    if (inventoryResult.rows.length === 0) {
      return res.status(400).json({ error: "Buku tidak tersedia dalam inventaris" });
    }

    // Lakukan pemesanan
    const orderQuery = "INSERT INTO orders (customer_id) VALUES ($1) RETURNING order_id";
    const orderResult = await pool.query(orderQuery, [customer_id]);
    const order_id = orderResult.rows[0].order_id;

    // Tambahkan buku ke daftar pesanan
    const orderItemQuery = "INSERT INTO orderitems (order_id, book_id) VALUES ($1, $2)";
    await pool.query(orderItemQuery, [order_id, book_id]);

    // Kurangi jumlah buku yang tersedia dalam inventaris
    const updateInventoryQuery = "UPDATE inventory SET quantity = quantity - 1 WHERE book_id = $1";
    await pool.query(updateInventoryQuery, [book_id]);

    res.status(201).json({ message: "Pemesanan berhasil", order_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// READ ALL
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM orders";
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:first_name/:last_name", async (req, res) => {
  try {
    const { first_name, last_name } = req.params;
    const query = "SELECT * FROM orders WHERE customer_id = (SELECT customer_id FROM customers WHERE first_name = $1 AND last_name = $2)";
    const result = await pool.query(query, [first_name, last_name]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { customer_id, order_date } = req.body;
    const query = "UPDATE orders SET customer_id = $1, order_date = $2 WHERE order_id = $3 RETURNING *";
    const result = await pool.query(query, [customer_id, order_date, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "DELETE FROM orders WHERE order_id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const { first_name, last_name } = req.query;

    // Ambil customer_id berdasarkan first_name dan last_name
    const customerQuery = "SELECT customer_id FROM customers WHERE first_name = $1 AND last_name = $2";
    const customerResult = await pool.query(customerQuery, [first_name, last_name]);

    // Periksa apakah pelanggan ditemukan
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: "Pelanggan tidak ditemukan" });
    }

    const customer_id = customerResult.rows[0].customer_id;

    // Ambil riwayat pesanan berdasarkan customer_id
    const orderQuery = `
      SELECT orders.order_id, orders.order_date, books.title
      FROM orders
      JOIN orderitems ON orders.order_id = orderitems.order_id
      JOIN books ON orderitems.book_id = books.book_id
      WHERE orders.customer_id = $1`;
    const orderResult = await pool.query(orderQuery, [customer_id]);

    res.status(200).json(orderResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
