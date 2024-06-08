const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");

const app = express();
const port = 5000; // Port

app.use(bodyParser.json());

// Daftar tabel yang ingin diquery
const tables = [
  "authors",
  "bookauthors",
  "bookcategories",
  "books",
  "categories",
  "customers",
  "inventory",
  "languages",
  "orderitems",
  "orders",
  "publishers",
  "reviews",
  "roles",
  "suppliers",
  "userroles",
  "users",
  "wishlistitems",
  "wishlists"
];

// Fungsi untuk memvalidasi tabel
function validateTable(table) {
  return tables.includes(table);
}

// Loop untuk membuat rute untuk setiap tabel
tables.forEach(table => {
  const tableName = table.toLowerCase(); // Convert nama tabel menjadi lowercase
  const tableRoute = require(`./routes/${tableName}`); // Impor rute dari file yang sesuai
  app.use(`/api/${tableName}`, tableRoute); // Gunakan rute yang diimpor
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});