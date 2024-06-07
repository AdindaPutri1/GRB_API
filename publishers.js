const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { publisher_id, publisher_name, address, phone, email } = req.body;
    await client.query("BEGIN");
    const query = "INSERT INTO publishers (publisher_id, publisher_name, address, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const result = await client.query(query, [publisher_id, publisher_name, address, phone, email]);
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
    const query = "SELECT * FROM publishers";
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
    const query = "SELECT * FROM publishers WHERE publisher_id = $1";
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
    const { publisher_name, address, phone, email } = req.body;
    await client.query("BEGIN");
    const query = "UPDATE publishers SET publisher_name = $1, address = $2, phone = $3, email = $4 WHERE publisher_id = $5 RETURNING *";
    const result = await client.query(query, [publisher_name, address, phone, email, id]);
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
    const query = "DELETE FROM publishers WHERE publisher_id = $1 RETURNING *";
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
