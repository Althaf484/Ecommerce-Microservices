import express from "express";
import cookirParser from "cookie-parser";
import { createWebSocketServer } from "./websocket";
import { error } from "console";
import { startConsumer } from "./chat-message.consumer";
import router from "./routes/chatting.route";

const app = express();
app.use(express.json());
app.use(cookirParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to chatting-service!" });
});

app.use("/api", router);

const port = process.env.PORT || 6006;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

// Websocket server
createWebSocketServer(server);

//start kafka consumer
startConsumer().catch((error: any) => console.error(error));

server.on("error", console.error);
