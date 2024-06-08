// authors.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { first_name, last_name } = req.body;
    await client.query("BEGIN"); // Mulai transaksi

    const query = "INSERT INTO authors (first_name, last_name) VALUES ($1, $2) RETURNING *";
    const result = await client.query(query, [first_name, last_name]);

    await client.query("COMMIT"); // Konfirmasi transaksi jika berhasil
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK"); // Batalkan transaksi jika ada kesalahan
    res.status(500).json({ error: err.message });
  } finally {
    client.release(); // Kembalikan koneksi ke pool
  }
});

// READ ALL
router.get("/", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Mulai transaksi

    const query = "SELECT * FROM authors";
    const result = await client.query(query);

    await client.query("COMMIT"); // Konfirmasi transaksi jika berhasil
    res.status(200).json(result.rows);
  } catch (err) {
    await client.query("ROLLBACK"); // Batalkan transaksi jika ada kesalahan
    res.status(500).json({ error: err.message });
  } finally {
    client.release(); // Kembalikan koneksi ke pool
  }
});

// READ ONE
router.get("/:author_id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Mulai transaksi

    const authorId = req.params.author_id;
    const query = "SELECT * FROM authors WHERE author_id = $1";
    const result = await client.query(query, [authorId]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK"); // Batalkan transaksi jika tidak ditemukan
      return res.status(404).json({ error: "Author not found" });
    }

    await client.query("COMMIT"); // Konfirmasi transaksi jika berhasil
    res.status(200).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK"); // Batalkan transaksi jika ada kesalahan
    res.status(500).json({ error: err.message });
  } finally {
    client.release(); // Kembalikan koneksi ke pool
  }
});


// UPDATE
router.put("/:author_id", async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN"); // Mulai transaksi
    
    const authorId = req.params.author_id;
    const { first_name, last_name } = req.body;
    const query = "UPDATE authors SET first_name = $1, last_name = $2 WHERE author_id = $3 RETURNING *";
    const result = await client.query(query, [first_name, last_name, authorId]);
    
    if (result.rows.length === 0) {
      await client.query("ROLLBACK"); // Batalkan transaksi jika tidak ditemukan
      return res.status(404).json({ error: "Author not found" });
    }

    await client.query("COMMIT"); // Konfirmasi transaksi jika berhasil
    res.status(200).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK"); // Batalkan transaksi jika ada kesalahan
    res.status(500).json({ error: err.message });
  } finally {
    client.release(); // Kembalikan koneksi ke pool
  }
});


// DELETE an author
router.delete("/:author_id", async (req, res) => {
    const authorId = req.params.author_id;
    
    try {
      // Start a transaction
      await pool.query('BEGIN');
      
      // Delete related entries in the bookauthors table
      await pool.query("DELETE FROM bookauthors WHERE author_id = $1", [authorId]);
      
      // Delete the author
      const result = await pool.query("DELETE FROM authors WHERE author_id = $1 RETURNING *", [authorId]);
      
      if (result.rows.length === 0) {
        // Rollback transaction if author not found
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: "Author not found" });
      }
      
      // Commit the transaction
      await pool.query('COMMIT');
      
      res.status(200).json({ message: "Author and related records deleted successfully" });
    } catch (err) {
      // Rollback the transaction in case of error
      await pool.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    }
  });  

module.exports = router;
