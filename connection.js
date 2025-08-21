// connection.js - Perbaikan untuk Railway MySQL
const mysql = require("mysql2");

// Konfigurasi database untuk Railway
const dbConfig = {
  // Gunakan Railway environment variables
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "railway",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,

  // Konfigurasi tambahan untuk Railway
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,

  // Connection pool settings
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

console.log("🔧 Database config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  ssl: !!dbConfig.ssl,
});

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("🔍 Error details:", err.stack);

    // Tampilkan environment variables untuk debugging
    console.log("📊 Environment variables:");
    console.log("- MYSQLHOST:", process.env.MYSQLHOST);
    console.log("- MYSQLUSER:", process.env.MYSQLUSER);
    console.log("- MYSQLDATABASE:", process.env.MYSQLDATABASE);
    console.log("- MYSQLPORT:", process.env.MYSQLPORT);
    console.log("- NODE_ENV:", process.env.NODE_ENV);

    return;
  }
  console.log("✅ Connected to MySQL database");
  console.log(`🗃️  Database: ${dbConfig.database}`);
});

// Handle connection errors
db.on("error", (err) => {
  console.error("❌ Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("🔄 Reconnecting to database...");
    // Reconnect logic bisa ditambahkan di sini
  }
});

module.exports = db;
