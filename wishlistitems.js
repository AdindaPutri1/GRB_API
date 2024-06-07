const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { columns, values } = req.body;
    const query = `INSERT INTO wishlistitems (${columns.join(", ")}) VALUES (${values.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`;
    const result = await client.query(query, values);
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
  try {
    const query = "SELECT * FROM wishlistitems";
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "SELECT * FROM wishlistitems WHERE id = $1";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const id = req.params.id;
    const { columns, values } = req.body;
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(", ");
    const query = `UPDATE wishlistitems SET ${setClause} WHERE id = $1 RETURNING *`;
    const result = await client.query(query, [id, ...values]);
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
    await client.query("BEGIN");
    const id = req.params.id;
    const query = "DELETE FROM wishlistitems WHERE id = $1 RETURNING *";
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
