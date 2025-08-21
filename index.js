// server.js - Improved version dengan security fixes
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db = require("./connection");
const cors = require("cors");
const response = require("./response");

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Health check endpoint
app.get("/health", (req, res) => {
  // Test database connection
  db.query("SELECT 1 + 1 AS result", (err, result) => {
    if (err) {
      res.status(500).json({
        status: "unhealthy",
        database: "disconnected",
        error: err.message,
      });
    } else {
      res.json({
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
        test_result: result[0]?.result,
      });
    }
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "API Lingkup Sekolah",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      siswa: {
        get_all: "GET /siswa",
        get_by_id: "GET /siswa/:id",
        search: "GET /siswa/search?q=keyword",
        create: "POST /siswa",
        update: "PUT /siswa/update",
        delete: "DELETE /siswa",
      },
    },
  });
});

// GET ALL DATA
app.get("/siswa", (req, res) => {
  const sql = "SELECT * FROM siswa_db ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Get siswa error:", err);
      response(500, null, "Gagal mengambil data siswa", res);
      return;
    }
    response(200, result, "Berhasil mendapatkan seluruh data!", res);
  });
});

// ADD DATA - dengan prepared statement untuk security
app.post("/siswa", (req, res) => {
  const { nama_siswa, status_siswa, nik_sekolah } = req.body;

  // Validasi input
  if (!nama_siswa || !status_siswa || !nik_sekolah) {
    response(400, null, "Nama siswa, status siswa, dan NIK sekolah wajib diisi", res);
    return;
  }

  const sql = "INSERT INTO siswa_db (nama_siswa, status_siswa, nik_sekolah) VALUES (?, ?, ?)";
  db.query(sql, [nama_siswa, status_siswa, nik_sekolah], (err, result) => {
    if (err) {
      console.error("Add siswa error:", err);
      if (err.code === "ER_DUP_ENTRY") {
        response(409, null, "Data dengan NIK ini sudah ada", res);
      } else {
        response(500, null, "Gagal menambahkan data siswa", res);
      }
      return;
    }

    if (result?.affectedRows) {
      const data = {
        isSuccess: result.affectedRows,
        id: result.insertId,
      };
      response(201, data, "Berhasil menambahkan data siswa", res);
    }
  });
});

// UPDATE DATA - dengan prepared statement
app.put("/siswa/update", (req, res) => {
  const { nama_siswa, status_siswa, id, nik_sekolah } = req.body;

  // Validasi input
  if (!id) {
    response(400, null, "ID siswa wajib diisi", res);
    return;
  }

  const sql = "UPDATE siswa_db SET nama_siswa = ?, status_siswa = ?, nik_sekolah = ? WHERE id = ?";
  db.query(sql, [nama_siswa, status_siswa, nik_sekolah, id], (err, result) => {
    if (err) {
      console.error("Update siswa error:", err);
      response(500, null, "Gagal mengupdate data siswa", res);
      return;
    }

    if (result?.affectedRows > 0) {
      const data = {
        isSuccess: result.affectedRows,
        message: "Data berhasil diupdate",
      };
      response(200, data, "Update data berhasil", res);
    } else {
      response(404, null, "Data dengan ID tersebut tidak ditemukan", res);
    }
  });
});

// DELETE DATA - dengan prepared statement
app.delete("/siswa", (req, res) => {
  const { id } = req.body;

  if (!id) {
    response(400, null, "ID siswa wajib diisi", res);
    return;
  }

  const sql = "DELETE FROM siswa_db WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete siswa error:", err);
      response(500, null, "Gagal menghapus data siswa", res);
      return;
    }

    if (result?.affectedRows > 0) {
      const data = {
        isDelete: result.affectedRows,
        message: "Data berhasil dihapus",
      };
      response(200, data, "Delete data berhasil", res);
    } else {
      response(404, null, "Data dengan ID tersebut tidak ditemukan", res);
    }
  });
});

// SEARCH DATA - dengan prepared statement
app.get("/siswa/search", (req, res) => {
  const { q } = req.query;

  if (!q) {
    response(400, null, "Parameter pencarian (q) wajib diisi", res);
    return;
  }

  const sql = `SELECT * FROM siswa_db 
               WHERE nama_siswa LIKE ? 
               OR status_siswa LIKE ? 
               OR nik_sekolah LIKE ?
               ORDER BY id DESC`;

  const searchTerm = `%${q}%`;
  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, result) => {
    if (err) {
      console.error("Search siswa error:", err);
      response(500, null, "Gagal mencari data siswa", res);
      return;
    }
    response(200, result, `Pencarian dengan keyword "${q}" berhasil`, res);
  });
});

// GET BY ID - dengan prepared statement
app.get("/siswa/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    response(400, null, "ID siswa tidak valid", res);
    return;
  }

  const sql = "SELECT * FROM siswa_db WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Get siswa by ID error:", err);
      response(500, null, "Gagal mengambil data siswa", res);
      return;
    }

    if (result.length === 0) {
      response(404, null, "Data siswa tidak ditemukan", res);
    } else {
      response(200, result[0], "Data siswa berhasil ditemukan", res);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  response(500, null, "Internal server error", res);
});

// 404 handler
app.use("*", (req, res) => {
  response(404, null, "Endpoint tidak ditemukan", res);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🔄 Gracefully shutting down...");
  db.end(() => {
    console.log("🔚 Database connection closed");
    process.exit(0);
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});
