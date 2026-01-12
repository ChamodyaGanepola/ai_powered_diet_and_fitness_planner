// server.js (ES Module)
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import workoutPlanRoutes from "./routes/workoutPlanRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
export const io = new Server(httpServer, {
  cors: { origin: "*" }, // allow all origins or specify your frontend
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for "join" event from client with user id
  socket.on("join", (userId) => {
    console.log(`User ${userId} joined their room`);
    socket.join(`user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/user-profiles", userProfileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/meal-plan", mealPlanRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/workout-plan", workoutPlanRoutes);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");

    // Use httpServer instead of app.listen for socket.io
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log(`Error connecting to MongoDB: ${error}`));
