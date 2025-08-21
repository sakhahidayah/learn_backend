const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 3000;
const db = require("./connection");
const cors = require("cors");
const response = require("./response");
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  if (res.statusCode === 200) {
    res.send("route test");
  } else {
    res.send("error");
  }
});

// GET ALL DATA
app.get("/siswa", (req, res) => {
  const sql = "SELECT * FROM siswa_db";
  db.query(sql, (err, result) => {
    // console.log(result);
    response(200, result, "berhasil mendapatkan seluruh data !", res);
  });
});

// ADD DATA
app.post("/siswa", (req, res) => {
  const { nama_siswa, status_siswa, nik_sekolah } = req.body;
  const sql = `INSERT INTO siswa_db (nama_siswa, status_siswa, nik_sekolah) 
             VALUES ('${nama_siswa}', '${status_siswa}', ${nik_sekolah})`;
  db.query(sql, (err, result) => {
    if (err) response(500, "Invalid", "Error NIK/ID", res);
    if (result?.affectedRows) {
      const data = {
        isSuccess: result.affectedRows,
        id: result.insertId,
      };
      response(200, data, "Berhasil menambahkan data", res);
    }
  });
});

// UPDATE DATA
app.put("/siswa/update", (req, res) => {
  const { nama_siswa, status_siswa, id, nik_sekolah } = req.body;
  // console.log(req.body);
  const sql = `UPDATE siswa_db SET nama_siswa = '${nama_siswa}', status_siswa = '${status_siswa}', nik_sekolah = '${nik_sekolah}' WHERE id = '${id}'`;
  db.query(sql, (err, result) => {
    if (err) {
      response(500, "Invalid", "Failed To Update", res);
      return;
    }
    if (result?.affectedRows) {
      const data = {
        isSuccess: result.affectedRows,
        message: result.info,
      };
      response(200, data, "Update data Succesfully ", res);
      console.log(data);
    } else {
      const data = {
        isSuccess: result.affectedRows,
        message: result.info,
      };
      response(404, data, "ID not Found", res);
    }
    // console.log(response);
  });
});

// DELETE DATA
app.delete("/siswa", (req, res) => {
  const { id } = req.body;
  const sql = `DELETE FROM siswa_db WHERE id = ${id}`;
  db.query(sql, (err, result) => {
    if (err) response(500, "Invalid", "Failed to Delete", res);
    if (result?.affectedRows) {
      const data = {
        isDelete: result.affectedRows,
        message: result.info,
      };
      response(200, data, "Delete data Succesfully ", res);
    } else {
      const data = {
        isSuccess: result.affectedRows,
        message: result.info,
      };
      response(404, data, "ID not Found", res);
    }
  });
});

// SEARCH DATA FROM ID
app.get("/siswa/search", (req, res) => {
  const { q } = req.query;
  let sql = `SELECT * FROM siswa_db WHERE 1=1`;
  let params = [];
  if (q) {
    sql += " AND (nama_siswa LIKE ? OR status_siswa LIKE ? OR nik_sekolah LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  db.query(sql, params, (error, result) => {
    // console.log(result);
    response(200, result, `Search success`, res);
  });
});

app.get("/siswa/:id", (req, res) => {
  const { id } = req.params;
  let sql = `SELECT * FROM siswa_db WHERE id = ${id}`;
  db.query(sql, (error, result) => {
    response(200, result, `Search success`, res);
  });
});

app.get("/siswa", (req, res) => {
  const { id, nama_siswa, nik_sekolah, status_siswa } = req.query;
  const sql = `SELECT * FROM siswa_db WHERE id = '${id}', nama_siswa = "${nama_siswa}", nik_sekolah = "${nik_sekolah}", status_siswa = "${status_siswa}"`;
  db.query(sql, (error, result) => {
    response(200, result, "testing search pake nama ", res);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
