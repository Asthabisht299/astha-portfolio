
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const readline = require("readline");

dotenv.config({ path: ".env.local" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  let connection;

  try {
    const username = await ask("Admin username: ");
    const password = await ask("Admin password: ");

    if (!username || password.length < 12) {
      throw new Error("Username required and password must be at least 12 characters.");
    }

    const hash = await bcrypt.hash(password, 12);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306),
    });

    await connection.execute(
      "INSERT INTO admin (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)",
      [username, hash]
    );

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    if (connection) await connection.end();
    rl.close();
  }
}

main();
