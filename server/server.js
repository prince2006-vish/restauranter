import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { initOrderSocket } from "./sockets/orderSocket.js";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://restauranter-project.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as health checks
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Socket.IO configuration
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);
initOrderSocket(io);

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
    service: "Meetha Pani Restaurant API",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/upload", uploadRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
connectDB();

server.listen(PORT, () => {
  console.log(
    `[Meetha Pani API] Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`,
  );

  console.log("[CORS] Allowed origins:", allowedOrigins);
});
