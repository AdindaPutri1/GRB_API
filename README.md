# GRB_API
API untuk Good Reading Books. API ini dibuat untuk mendukung aplikasi BookStore_Online yang mengelola data buku, pengguna, wishlist, dan pesanan.

### Use Case Utama
Berikut adalah daftar use case utama API yang mencakup operasi SQL, DML, dan TCL:

1. **Registrasi Pengguna**
   - Dengan POST `/api/users/`, pengguna baru dapat mendaftar dengan memberikan detail mereka.

2. **Login Pengguna**
   - Dengan POST `/api/users/login`, pengguna yang sudah terdaftar dapat melakukan login menggunakan username atau email dan password mereka.

3. **Update Profil Pengguna**
   - Dengan PUT `/api/users/:id`, pengguna dapat memperbarui informasi profil mereka.

4. **Pencarian Buku berdasarkan Kata Kunci Judul Buku**
   - Dengan GET `/api/books/search?keyword=:keyword`, pengguna dapat mencari buku berdasarkan kata kunci dari judul buku.

5. **Pencarian Buku berdasarkan Penulis**
   - Dengan GET `/api/books/searchByAuthor?name=:name`, pengguna dapat mencari buku berdasarkan nama penulis.

6. **Pencarian Buku berdasarkan Kategori**
   - Dengan GET `/api/books/searchByCategory?category=:category`, pengguna dapat mencari buku berdasarkan kategori.

7. **Tambah Buku ke Wishlist**
   - Dengan PUT `/api/wishlists/{id}/books`, pengguna dapat menambahkan buku ke wishlist mereka.

8. **Melihat Wishlist**
   - Dengan GET `/api/wishlists/customer?first_name=:first_name&last_name=:last_name`, pengguna dapat melihat wishlist mereka berdasarkan nama pengguna.

9. **Melihat Pesanan**
   - Dengan GET `/api/orders/:first_name/:last_name`, pengguna dapat melihat pesanan mereka berdasarkan nama pengguna.

10. **Memperbaharui Informasi Buku**
    - Dengan PUT `/api/books/:id`, pihak perusahaan dapat memperbaharui informasi buku.

11. **Menghapus Buku dari Database**
    - Dengan DELETE `/api/books/:id` atau `/api/books/:title`, buku dapat dihapus dari database.

### Informasi Tambahan
- API ini mencakup lebih dari 11 use case utama.
- Setiap rute API mengimplementasikan operasi CRUD (Create, Read, Update, Delete) pada tabel-tabel dalam database.
- Deskripsi lebih detail dan spesifikasi API dapat ditemukan di file terkait dalam direktori `routes`.

Jika Anda memerlukan informasi lebih lanjut atau memiliki pertanyaan, jangan ragu untuk menghubungi saya.

Terima kasih.

