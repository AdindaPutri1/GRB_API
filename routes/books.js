const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { book_id, title, author, isbn, publication_date, price, sold_out, publisher_id, description, language_id, quantity_in_stock } = req.body;
    await client.query("BEGIN");
    const query = "INSERT INTO books (book_id, title, author, isbn, publication_date, price, sold_out, publisher_id, description, language_id, quantity_in_stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *";
    const result = await client.query(query, [book_id, title, author, isbn, publication_date, price, sold_out, publisher_id, description, language_id, quantity_in_stock]);
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// SEARCH BY KEYWORD
router.get("/search", async (req, res) => {
  const client = await pool.connect();
  try {
    const keyword = req.query.keyword;
    await client.query("BEGIN");
    const query = "SELECT * FROM books WHERE title ILIKE $1 OR description ILIKE $1";
    const result = await client.query(query, [`%${keyword}%`]);
    await client.query("COMMIT");
    res.status(200).json(result.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// SEARCH BY AUTHOR
router.get("/searchByAuthor", async (req, res) => {
  const client = await pool.connect();
  try {
    const name = req.query.name;
    await client.query("BEGIN");
    const query = "SELECT * FROM books WHERE author ILIKE $1";
    const result = await client.query(query, [`%${name}%`]);
    await client.query("COMMIT");
    res.status(200).json(result.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// SEARCH BY CATEGORY
router.get("/searchByCategory", async (req, res) => {
  const client = await pool.connect();
  try {
    const category = req.query.category;
    await client.query("BEGIN");
    const query = `
      SELECT books.*
      FROM books
      JOIN bookcategories ON books.book_id = bookcategories.book_id
      JOIN categories ON bookcategories.category_id = categories.category_id
      WHERE categories.category_name ILIKE $1`;
    const result = await client.query(query, [`%${category}%`]);
    await client.query("COMMIT");
    res.status(200).json(result.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// READ ALL
router.get("/", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const query = "SELECT * FROM books";
    const result = await client.query(query);
    await client.query("COMMIT");
    res.status(200).json(result.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    await client.query("BEGIN");
    const query = "SELECT * FROM books WHERE book_id = $1";
    const result = await client.query(query, [id]);
    await client.query("COMMIT");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    const { title, author, isbn, publication_date, price, sold_out, publisher_id, description, language_id, quantity_in_stock } = req.body;
    await client.query("BEGIN");
    const query = "UPDATE books SET title = $1, author = $2, isbn = $3, publication_date = $4, price = $5, sold_out = $6, publisher_id = $7, description = $8, language_id = $9, quantity_in_stock = $10 WHERE book_id = $11 RETURNING *";
    const result = await client.query(query, [title, author, isbn, publication_date, price, sold_out, publisher_id, description, language_id, quantity_in_stock, id]);
    await client.query("COMMIT");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE by ID
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    await client.query("BEGIN");
    const query = "DELETE FROM books WHERE book_id = $1 RETURNING *";
    const result = await client.query(query, [id]);
    await client.query("COMMIT");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE by Title
router.delete("/title/:title", async (req, res) => {
  const client = await pool.connect();
  try {
    const title = req.params.title;
    await client.query("BEGIN");
    const query = "DELETE FROM books WHERE title = $1 RETURNING *";
    const result = await client.query(query, [title]);
    await client.query("COMMIT");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
