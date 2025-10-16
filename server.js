const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;
const usersFile = path.join(__dirname, "users.json");

app.use(express.json());
function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// GET /users → return all users
app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

// POST /users → add a new user
app.post("/users", (req, res) => {
  const { name, age } = req.body;

  if (!name || typeof age !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }
  const users = readUsers();
  const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, name, age };
  users.push(newUser);
  writeUsers(users);
  res.status(201).json(newUser);
});

// PUT /users/:id → update user by ID
app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, age } = req.body;
  if (typeof name === "undefined" && typeof age === "undefined") {
    return res.status(400).json({ error: "No fields to update" });
  }
  if (typeof age !== "undefined" && typeof age !== "number") {
    return res.status(400).json({ error: "Invalid age" });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  if (typeof name !== "undefined") users[userIndex].name = name;
  if (typeof age === "number") users[userIndex].age = age;

  writeUsers(users);
  res.json(users[userIndex]);
});

app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(userIndex, 1);
  writeUsers(users);

  res.json({ message: "User deleted successfully" });
});

app.get("/users/search", (req, res) => {
  const keyword = req.query.name;
  if (!keyword) return res.status(400).json({ error: "Missing search keyword" });

  const users = readUsers();
  const filtered = users.filter(u => u.name.toLowerCase().includes(keyword.toLowerCase()));
  res.json(filtered);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


