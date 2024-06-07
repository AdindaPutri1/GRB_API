const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { supplier_id, supplier_name, contact_person, contact_email, contact_phone } = req.body;
    const query = "INSERT INTO suppliers (supplier_id, supplier_name, contact_person, contact_email, contact_phone) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const result = await client.query(query, [supplier_id, supplier_name, contact_person, contact_email, contact_phone]);
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
    const query = "SELECT * FROM suppliers";
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
    const query = "SELECT * FROM suppliers WHERE supplier_id = $1";
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
    const { supplier_name, contact_person, contact_email, contact_phone } = req.body;
    const query = "UPDATE suppliers SET supplier_name = $1, contact_person = $2, contact_email = $3, contact_phone = $4 WHERE supplier_id = $5 RETURNING *";
    const result = await client.query(query, [supplier_name, contact_person, contact_email, contact_phone, id]);
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
    const query = "DELETE FROM suppliers WHERE supplier_id = $1 RETURNING *";
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
