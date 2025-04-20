require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
}));

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("Connected to MySQL DB");
  }
});

// Server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
    db.query("SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp", [room], (err, results) => {
      if (err) {
        console.error("DB error loading messages:", err);
      } else {
        socket.emit("loadMessages", results);
      }
    });
  });

  socket.on("sendMessage", ({ room, message }) => {
    db.query("INSERT INTO messages (room_id, sender_id, textt) VALUES (?, ?, ?)", [room, message.sender, message.text], (err) => {
      if (err) {
        console.error("DB error inserting message:", err);
      } else {
        io.to(room).emit("receiveMessage", message);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// **User Registration API**
app.post("/register", async (req, res) => {
  const { name, phone, email, password, role } = req.body;

  db.query("SELECT * FROM users WHERE email = ?",email, async (err, result) => {
    if (err) return res.status(500).json({ error: "Database Error", details: err });

    if (result && result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = "INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)";
      db.query(sql, [name, phone, email, hashedPassword, role], (err, result) => {
        if (err) return res.status(500).json({ error: "Database Error", details: err });
        res.status(201).json({ message: "User Registered Successfully" });
      });
    } catch (error) {
      res.status(500).json({ message: "Error hashing password", error });
    }
  });
});

// **User Login API**
app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);  // Log incoming request

  const { email, password ,role} = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database Error" });
    }

    if (!result || result.length === 0) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (user.role !== role) {
      return res.status(403).json({ message: "Incorrect role selected" });
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role},
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    console.log({token});

    console.log("Login successful for:", email); // Log success
    res.json({ message: "Login Successful", token, id: user.id, role: user.role });
  });
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Received token:", req.headers.authorization);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user;
    next();
  });
};


app.get("/supplier-profile", authenticate, (req, res) => {
  const supplierId = req.user.id; // Extract supplier ID from token

  const sql = "SELECT id, name, email, phone FROM users WHERE id = ?";
  db.query(sql, [supplierId], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(result[0]); // Send supplier profile
  });
});
app.post("/add-food",authenticate,(req, res) => {
  console.log("Received request:", req.body); // Debugging log
  const supplierId = req.user.id;
  console.log(supplierId);
  const { foodName, quantity,imageUrl, location  } = req.body;
  const qty = Number(quantity);
  if (!foodName || !quantity|| !imageUrl || !location || !supplierId) {
    return res.status(400).json({ error: "All fields are required" });
  }
  

  const sql = "INSERT INTO food (supplier_id,food_name, quantity, image_url, location,requesting_ngoo_phone) VALUES (?,?, ?, ?, ?, ?)";
  const a = 0;
  db.query(sql, [supplierId, foodName, qty,imageUrl, location,a], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Food added successfully!" });
  });
});
app.get("/available-food", authenticate ,  (req, res) => {
  db.query("SELECT * FROM food", (err, result) => {
    if (err) return res.status(500).json({ error: "Database Error", details: err });
    res.json(result);
  });
});

app.post("/add-request", authenticate, (req, res) => {
  const ngo_id = req.user.id; // NGO ID from token
  const { food_name, supplier_id } = req.body;

  if (!food_name || !supplier_id) {
    return res.status(400).json({ error: "Missing food name or supplier ID" });
  }

  // Get NGO phone number
  db.query("SELECT phone  FROM users WHERE id = ?", [ngo_id], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "NGO not found" });
    }

    const ngoPhone = result[0].phone;

    // Update the food table
    db.query(
      "UPDATE food SET requesting_ngoo_phone = ? ,ngo_id=? WHERE food_name = ? AND supplier_id = ?",
      [ngoPhone,ngo_id, food_name, supplier_id],
      (err, updateResult) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Food request added successfully!" });
      }
    );
  });
});

app.get("/fetch-requested", authenticate, (req, res) => {
  const supplierId = req.user.id;

  const sql = "SELECT requesting_ngoo_phone , food_name , quantity,ngo_id FROM food WHERE supplier_id = ? AND CHAR_LENGTH(CAST(requesting_ngoo_phone AS CHAR)) > 1"

  db.query(sql, [supplierId], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});
app.post("/approve-request",authenticate,(req,res)=>{
  const {foodname,phonenumber,quantity}=req.body;
  const Supplier_id = req.user.id;
  db.query("INSERT INTO food_distribution_table (supplier_id,food_name,quantity) VALUES (?,?,?)",[Supplier_id,foodname,quantity],(err,result)=>{
    if(err){
      res.status(500);
    }
    
  
  })
  db.query("DELETE FROM food WHERE supplier_id=? AND food_name =? AND requesting_ngoo_phone=?",[Supplier_id , foodname , phonenumber],(err,result)=>{
    if(err){
      res.status(500);
      console.log("database Error");
    }
    res.status(200).json({ message: "Request approved successfully!" });

  });

});

app.get("/add-food-history",authenticate,(req,res)=>{
  const supplier_id = req.user.id;
  db.query("SELECT food_name , quantity FROM food_distribution_table WHERE supplier_id=?",[supplier_id],(err,result)=>{
    if(err){
      console.error("Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});










server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} 🚀`));