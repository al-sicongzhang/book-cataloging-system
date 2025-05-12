const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const userListRoutes = require('./routes/UserListRoutes');
app.use('/api/userlist', userListRoutes);

const reviewRoutes =require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  });
