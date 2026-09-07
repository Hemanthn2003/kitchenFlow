import { Server } from "socket.io";

let io = null;

/*
|--------------------------------------------------------------------------
| Initialize Socket.IO
|--------------------------------------------------------------------------
*/

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    /*
    |--------------------------------------------------------------------------
    | Join role room
    |--------------------------------------------------------------------------
    |
    | Frontend sends:
    |
    | socket.emit("joinRole", "MANAGER")
    |
    | Then the socket joins:
    |
    | role:MANAGER
    |
    */

    socket.on("joinRole", (role) => {
      const normalizedRole = String(role || "")
        .trim()
        .toUpperCase();

      if (!normalizedRole) {
        return;
      }

      socket.join(`role:${normalizedRole}`);

      console.log(
        `🔔 ${socket.id} joined role:${normalizedRole}`
      );
    });

    /*
    |--------------------------------------------------------------------------
    | Join user-specific room
    |--------------------------------------------------------------------------
    */

    socket.on("joinUser", (userId) => {
      if (!userId) {
        return;
      }

      socket.join(`user:${userId}`);

      console.log(
        `👤 ${socket.id} joined user:${userId}`
      );
    });

    /*
    |--------------------------------------------------------------------------
    | Disconnect
    |--------------------------------------------------------------------------
    */

    socket.on("disconnect", (reason) => {
      console.log(
        "🔌 Socket disconnected:",
        socket.id,
        reason
      );
    });
  });

  console.log("✅ Socket.IO initialized");

  return io;
};

/*
|--------------------------------------------------------------------------
| Get Socket.IO instance
|--------------------------------------------------------------------------
*/

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized yet."
    );
  }

  return io;
};

/*
|--------------------------------------------------------------------------
| Emit to a role
|--------------------------------------------------------------------------
*/

export const emitToRole = (
  role,
  event,
  data = {}
) => {
  if (!io) {
    console.warn(
      "Socket.IO not initialized. Event skipped:",
      event
    );

    return;
  }

  const normalizedRole = String(role || "")
    .trim()
    .toUpperCase();

  if (!normalizedRole) {
    return;
  }

  io.to(`role:${normalizedRole}`).emit(
    event,
    data
  );
};

/*
|--------------------------------------------------------------------------
| Emit to a specific user
|--------------------------------------------------------------------------
*/

export const emitToUser = (
  userId,
  event,
  data = {}
) => {
  if (!io || !userId) {
    return;
  }

  io.to(`user:${userId}`).emit(
    event,
    data
  );
};

/*
|--------------------------------------------------------------------------
| Emit globally
|--------------------------------------------------------------------------
*/

export const emitGlobal = (
  event,
  data = {}
) => {
  if (!io) {
    return;
  }

  io.emit(event, data);
};