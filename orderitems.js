const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id, book_id } = req.body;
    await client.query("BEGIN");
    const query = "INSERT INTO orderitems (order_id, book_id) VALUES ($1, $2) RETURNING *";
    const result = await client.query(query, [order_id, book_id]);
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
    const query = "SELECT * FROM orderitems";
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
    const query = "SELECT * FROM orderitems WHERE order_id = $1";
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
    const { book_id } = req.body;
    await client.query("BEGIN");
    const query = "UPDATE orderitems SET book_id = $1 WHERE order_id = $2 RETURNING *";
    const result = await client.query(query, [book_id, id]);
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
    const query = "DELETE FROM orderitems WHERE order_id = $1 RETURNING *";
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
