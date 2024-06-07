const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { book_id, category_id } = req.body;
    await client.query("BEGIN");
    const query = "INSERT INTO bookcategories (book_id, category_id) VALUES ($1, $2) RETURNING *";
    const result = await client.query(query, [book_id, category_id]);
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
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
    const query = "SELECT * FROM bookcategories";
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
    const query = "SELECT * FROM bookcategories WHERE book_id = $1 OR category_id = $1";
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
    const { book_id, category_id } = req.body;
    await client.query("BEGIN");
    const query = "UPDATE bookcategories SET book_id = $1, category_id = $2 WHERE book_id = $3 OR category_id = $3 RETURNING *";
    const result = await client.query(query, [book_id, category_id, id]);
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

// DELETE
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    await client.query("BEGIN");
    const query = "DELETE FROM bookcategories WHERE book_id = $1 OR category_id = $1 RETURNING *";
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

module.exports = router;
