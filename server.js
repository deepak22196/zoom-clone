const express = require("express");
const app = express();
const http = require("http");
const { ExpressPeerServer } = require("peer");
const server = http.Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");

app.use(express.static("./public"));

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

const port = process.env.PORT || 3030;
server.listen(port, () => console.log(`server started on port ${port}`));
