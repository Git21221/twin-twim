import { Server } from "socket.io";
import { app } from "./src/app.js";
import { connectDB } from "./src/db/connectDB.js";
import { connectSocket } from "./src/socket/websocket.js";

let ser;
connectDB()
  .then(() => {
    ser = app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });

    const io = new Server(ser, {
      methods: ["GET", "POST"],
      pingTimeout: 60000, // Adjusted for a more standard timeout
      pingInterval: 25000, // Default value
      cors: {
        origin: process.env.CORS_ORIGIN, // Secure for production
        credentials: true,
      },
    });

    // Attach io to Express app for access in routes
    app.set("io", io);

    // Initialize WebSocket connections
    connectSocket(io);
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the process if DB connection fails
  });

export { ser };
