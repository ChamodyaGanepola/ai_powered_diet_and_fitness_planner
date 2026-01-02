const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

//  Middleware to parse JSON
app.use(express.json());

app.use(cors());
app.use("/api/users", userRoutes);
app.use("/api/user-profiles", userProfileRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    // Start the server after DB connection
    app.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log(`Error connecting to MongoDB: ${error}`));