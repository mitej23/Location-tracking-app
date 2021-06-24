const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:19006",
      "http://192.168.2.8:19006",
      "http://192.168.43.43:19000/",
    ],
  },
});

app.get("/api", (req, res) => {
  res.send("hellow world");
});

app.get("/", (req, res) => {
  res.send("hello world");
});

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("join-driver", () => {
    socket.join("drivers");
  });

  socket.on("order-placed", (name, orderId, userId) => {
    console.log("order placed ", name, orderId);
    socket.to("drivers").emit("order", { name, orderId, userId });
  });

  socket.on("order-taken", (id, name) => {
    console.log("inside server " + id + " " + name);
    socket.to("drivers").emit("orders-changed", id, name);
  });
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});
