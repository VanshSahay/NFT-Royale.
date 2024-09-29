import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
//                     roomNumber:    0     1   ...
let players: any = []; // schema: [ [{}], [{}], ... ]
let playerCount = 0;
let roomNumber: number;

io.on("connection", (socket) => {
    console.log("New User connected with Socket ID:", socket.id);

    if (playerCount % 2 == 0) {
        roomNumber = playerCount / 2;
        players.push([]);
    }

    playerCount++;
    socket
        .to(`roomId-${roomNumber}`)
        .emit("other-player", `Player ${socket.id} joined!`);

    const playerNumber =
        players[roomNumber].length == 0 ? "player1" : "player2";

    socket.emit("playerNumber", playerNumber);

    socket.on("getPlayerNumber", () => {
        socket.emit("playerNumber", playerNumber);
    });

    players[roomNumber].push({
        username: socket.id,
        sid: socket.id,
        playerNumber,
        healthPoint: 1000,
        cards: ["fireball", "holylight"],
        lastPlayed: false,
    });
    console.log(players);
    socket.join(`roomId-${roomNumber}`);

    socket.on("startGame", async (arg) => {
        const socketRoomNumber = Number([...socket.rooms][1].split("-")[1]);
        io.to(players[socketRoomNumber][0].sid).emit(
            "gameAlert",
            "Game has Started! You have 1 minute to solve the puzzle"
        );
        io.to(players[socketRoomNumber][1].sid).emit(
            "gameAlert",
            "Game has Started! You have 1 minute to solve the puzzle"
        );
        setTimeout(() => {
            io.to(players[socketRoomNumber][0].sid).emit(
                "gameOver",
                "Game Over!"
            );
            io.to(players[socketRoomNumber][1].sid).emit(
                "gameOver",
                "Game Over!"
            );
        }, 60000);
        console.log("SUB ARRRRR: ", players[socketRoomNumber]);
    });
});

httpServer.listen(8080, () => {
    console.log("Listening on PORT 8080");
});
