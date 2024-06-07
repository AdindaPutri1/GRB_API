const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, username, password, email, created_at } = req.body;
    await client.query("BEGIN");
    const query = "INSERT INTO users (user_id, username, password, email, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const result = await client.query(query, [user_id, username, password, email, created_at]);
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
    const query = "SELECT * FROM users";
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

// READ ONE by Username
router.get("/:username", async (req, res) => {
  const client = await pool.connect();
  try {
    const username = req.params.username;
    await client.query("BEGIN");
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(query, [username]);
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
    const { columns, values } = req.body;
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(", ");
    await client.query("BEGIN");
    const query = `UPDATE users SET ${setClause} WHERE user_id = $1 RETURNING *`;
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
    const id = req.params.id;
    await client.query("BEGIN");
    const query = "DELETE FROM users WHERE user_id = $1 RETURNING *";
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

// LOGIN
router.post("/login", async (req, res) => {
  const client = await pool.connect();
  try {
    const { usernameOrEmail, password } = req.body;
    await client.query("BEGIN");
    const query = "SELECT * FROM users WHERE username = $1 OR email = $2";
    const result = await client.query(query, [usernameOrEmail, usernameOrEmail]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(401).json({ error: "Invalid username or email" });
    }

    const user = result.rows[0];

    // Assuming passwords are stored as plain text (not recommended)
    if (user.password !== password) {
      await client.query("ROLLBACK");
      return res.status(401).json({ error: "Invalid password" });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
