# To-Do List UI (Frontend)

## 1. Tentang UI Ini
Ini adalah proyek antarmuka pengguna (Frontend) untuk aplikasi To-Do List, dibangun menggunakan teknologi mutakhir React dan Vite. Aplikasi web ini merupakan Single Page Application (SPA) yang interaktif, merender antarmuka tanpa perlu memuat ulang halaman secara penuh. Aplikasi ini menyajikan fitur Dashboard, penyaringan tugas, autentikasi pengguna, manajemen kategori, dan visualisasi tugas.

## 2. Teknologi yang Digunakan
- **Framework UI:** React 19
- **Build Tool:** Vite (Super cepat untuk development dan bundling)
- **Styling:** Tailwind CSS (Utility-first CSS framework untuk desain cepat dan estetik)
- **HTTP Client:** Axios (Mengambil dan mengirim API request)
- **Routing:** React Router DOM (Navigasi halaman internal)
- **Icons:** Lucide React (Ikon yang konsisten)
- **Notifications:** React Hot Toast (Sistem notifikasi popup)
- **Charts:** Recharts (Bila dibutuhkan untuk fitur analitik)

## 3. Struktur Project Frontend
Berikut adalah penjelasan bagian-bagian dan folder utama di dalam direktori `todolist-ui/src`:

- **`/src/api/`**
  - **Fungsi:** Mengumpulkan logika komunikasi ke server. Berisi konfigurasi Axios (termasuk interceptors untuk selalu menyisipkan Bearer Token JWT), dan kumpulan fungsi API calls spesifik (misal: `createTodo`, `loginUser`).
- **`/src/assets/`**
  - **Fungsi:** Tempat menyimpan file media statis lokal seperti logo, gambar ilustrasi, atau jenis font kustom.
- **`/src/components/`**
  - **Fungsi:** Menyimpan blok bangunan UI (React Components) yang mandiri dan bisa digunakan berulang kali di berbagai halaman.
  - **Contoh File:**
    - `TodoCard.tsx`: Tampilan satu kotak tugas.
    - `TodoForm.tsx`: Modal atau form untuk menambah dan mengedit tugas.
    - `FilterBar.tsx`: Baris pencarian dan dropdown saringan tugas.
- **`/src/pages/`**
  - **Fungsi:** Menyimpan komponen level halaman. Komponen ini biasanya digabungkan dengan rute URL.
  - **Contoh File:** 
    - `Dashboard.tsx`: Halaman pusat yang memuat daftar task.
    - `Login.tsx` & `Register.tsx`: Halaman untuk autentikasi user.
- **`/src/App.tsx`**
  - **Fungsi:** Komponen Akar (Root) yang menampung konfigurasi utama seperti React Router (mendefinisikan halaman apa muncul di URL apa) dan Layout struktur umum (Sidebar, Header).
- **`/src/main.tsx`**
  - **Fungsi:** Titik masuk eksekusi kode (Entry Point). React menggunakan file ini untuk menempelkan (mount) seluruh DOM virtual aplikasi ke elemen HTML asli `<div id="root">`.
- **`/src/index.css` & `App.css`**
  - **Fungsi:** File stylesheet dasar. Tempat mendeklarasikan `@tailwind base`, `@tailwind components`, dan variabel CSS (seperti palet warna global).

## 4. Aliran Data Frontend
**Dari Mana ke Mana (Data Flow):**

1. **User Event (Aksi Pengguna):** Pengguna berinteraksi dengan UI, misal mengetik judul tugas baru lalu mengklik tombol submit di komponen `TodoForm.tsx`.
2. **State Management:** React menangkap event pengiriman. State lokal (memakai `useState`) mengambil data dari form.
3. **API Call:** Komponen tersebut mengeksekusi metode API dari **`/src/api/`** (contoh: fungsi `apiCreateTodo(data)`).
4. **Axios Request:** File API merangkai paket data JSON (termasuk Auth Header) lalu Axios mengirimkan `HTTP POST` Request melintasi jaringan ke endpoint Backend (Golang).
5. **Loading State:** Selama request di perjalanan, UI menampilkan indikator loading (spinner atau tombol disable).
6. **API Response:** Axios mendapatkan jawaban JSON dan status HTTP (contoh: 201 Created) dari Backend.
7. **Mutasi UI:** Komponen induk (misal `Dashboard.tsx`) merespons dengan menambahkan data tugas baru tersebut ke dalam React State (daftar `todos`).
8. **Re-render:** Karena State berubah, React secara otomatis menggambar ulang (re-render) tampilan UI. `TodoCard` baru langsung muncul di layar tanpa reload.
9. **Feedback:** Sistem memanggil *React Hot Toast* untuk memunculkan pesan "Tugas berhasil dibuat!" di sudut layar pengguna.

## 5. Penanganan Response dari API
Frontend ini telah dirancang untuk secara otomatis mengurai struktur respons JSON seragam yang dikirim oleh Backend. Secara struktural, komponen Frontend mengekstrak nilai `data` dan `message` dari respons tersebut:

- Jika mendapat respons **sukses** (`"status": "success"`), aplikasi akan mengambil properti `data` (seperti daftar tugas) dan menyimpannya ke dalam *state* React untuk segera ditampilkan.
- Jika terjadi **error** (`"status": "error"`), aplikasi akan langsung menembakkan notifikasi error (berupa pesan *Toast popup* merah) yang isinya diambil persis dari `"message"` API secara otomatis, sehingga UI selalu responsif dalam menangani galat (error handling).

## 6. Langkah-Langkah Menjalankan UI (Step-by-Step)
Untuk menjalankan sisi web (React) secara lokal, ikuti langkah-langkah berikut:

1. Pastikan Anda memiliki perangkat lunak NodeJS versi terbaru yang sudah terinstal di PC.
2. Buka terminal (CMD/Powershell) dan masuk ke dalam folder `todolist-ui`.
3. Siapkan environment file dengan menyalin konfigurasi contoh:
   ```bash
   cp .env.example .env
   ```
   Lalu buka file `.env` tersebut. Pastikan variabel URL mengarah pada endpoint Golang Backend yang telah Anda jalankan. Contoh: `VITE_API_URL=http://localhost:8080/api/v1`.
4. Install semua dependensi package *Node.js* dan *React* yang diperlukan:
   ```bash
   npm install
   ```
5. Setelah instalasi selesai, nyalakan Vite development server:
   ```bash
   npm run dev
   ```
6. Aplikasi berhasil berjalan! Cek di terminal (biasanya menunjuk ke URL `http://localhost:5173`). Buka URL tersebut di browser web Anda dan antarmuka *To-Do List* akan siap digunakan.
