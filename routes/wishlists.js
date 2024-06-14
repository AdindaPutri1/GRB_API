const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE WISHLIST
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { wishlist_id, customer_id } = req.body;
    console.log("Received request to create wishlist");
    console.log("Wishlist ID:", wishlist_id);
    console.log("Customer ID:", customer_id);

    const query = "INSERT INTO wishlists (wishlist_id, customer_id) VALUES ($1, $2) RETURNING *";
    const result = await client.query(query, [wishlist_id, customer_id]);

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating wishlist:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


// ADD BOOK TO WISHLIST BY TITLE AND CUSTOMER NAME
router.post("/:wishlist_id/books", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const wishlist_id = req.params.wishlist_id;
    const {title, first_name, last_name } = req.body;

    console.log(`Received request to add book to wishlist`);
    console.log(`Wishlist ID: ${wishlist_id}`);
    console.log(`Book Title: ${title}`);
    console.log(`Customer First Name: ${first_name}`);
    console.log(`Customer Last Name: ${last_name}`);

    // Find the customer by first name and last name
    const customerQuery = "SELECT customer_id FROM customers WHERE first_name = $1 AND last_name = $2";
    const customerResult = await client.query(customerQuery, [first_name, last_name]);

    if (customerResult.rows.length === 0) {
      console.log("Customer not found with provided first and last name");
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer_id = customerResult.rows[0].customer_id;

    // Check if the wishlist belongs to the customer
    const wishlistQuery = "SELECT * FROM wishlists WHERE wishlist_id = $1 AND customer_id = $2";
    const wishlistResult = await client.query(wishlistQuery, [wishlist_id, customer_id]);

    if (wishlistResult.rows.length === 0) {
      console.log("Wishlist does not belong to the customer");
      return res.status(403).json({ error: "Wishlist does not belong to the customer" });
    }

    // Find the book by title
    const bookQuery = "SELECT book_id FROM books WHERE title = $1";
    const bookResult = await client.query(bookQuery, [title]);

    if (bookResult.rows.length === 0) {
      console.log("Book not found with provided title");
      return res.status(404).json({ error: "Book not found" });
    }

    const book_id = bookResult.rows[0].book_id;

    // Add the book to the wishlist
    const insertQuery = "INSERT INTO wishlistitems (wishlist_id, book_id) VALUES ($1, $2) RETURNING *";
    const result = await client.query(insertQuery, [wishlist_id, book_id]);

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error adding book to wishlist:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET BOOK TITLES IN WISHLIST BY CUSTOMER NAME
router.get("/customer", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { first_name, last_name } = req.query;

    console.log(`Received request to fetch wishlist books for customer`);
    console.log(`Customer First Name: ${first_name}`);
    console.log(`Customer Last Name: ${last_name}`);

    // Find the customer by first name and last name
    const customerQuery = "SELECT customer_id FROM customers WHERE first_name = $1 AND last_name = $2";
    const customerResult = await client.query(customerQuery, [first_name, last_name]);

    if (customerResult.rows.length === 0) {
      console.log("Customer not found with provided first and last name");
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer_id = customerResult.rows[0].customer_id;

    // Find the wishlist for the customer
    const wishlistQuery = "SELECT wishlist_id FROM wishlists WHERE customer_id = $1";
    const wishlistResult = await client.query(wishlistQuery, [customer_id]);

    if (wishlistResult.rows.length === 0) {
      console.log("Wishlist not found for the customer");
      return res.status(404).json({ error: "Wishlist not found" });
    }

    const wishlist_id = wishlistResult.rows[0].wishlist_id;

    // Get the book titles in the wishlist
    const booksQuery = `
      SELECT books.title
      FROM wishlistitems
      JOIN books ON wishlistitems.book_id = books.book_id
      WHERE wishlistitems.wishlist_id = $1`;
    const booksResult = await client.query(booksQuery, [wishlist_id]);

    await client.query("COMMIT");
    res.status(200).json(booksResult.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error fetching wishlist books:", err.message);
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

    const query = "SELECT * FROM wishlists";
    const result = await client.query(query);

    await client.query("COMMIT");
    res.status(200).json(result.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error fetching wishlists:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const id = req.params.id;
    const query = "SELECT * FROM wishlists WHERE id = $1";
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Record not found" });
    }

    await client.query("COMMIT");
    res.status(200).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error fetching wishlist by ID:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
    const query = `UPDATE wishlists SET ${setClause} WHERE id = $1 RETURNING *`;

    const result = await client.query(query, [id, ...values]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Record not found" });
    }

    await client.query("COMMIT");
    res.status(200).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating wishlist:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE
router.delete("/:wishlist_id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const wishlist_id = req.params.wishlist_id;

    // Delete wishlist items related to the wishlist_id
    const deleteItemsQuery = "DELETE FROM wishlistitems WHERE wishlist_id = $1";
    await client.query(deleteItemsQuery, [wishlist_id]);

    // Now delete the wishlist itself
    const deleteWishlistQuery = "DELETE FROM wishlists WHERE wishlist_id = $1 RETURNING *";
    const result = await client.query(deleteWishlistQuery, [wishlist_id]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Wishlist not found" });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Wishlist deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting wishlist:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
