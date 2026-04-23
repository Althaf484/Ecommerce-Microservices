import { kafka } from "@packages/utils/kafka";
import { WebSocketServer, WebSocket } from "ws";
import redis from "@packages/libs/redis";
import { Server as HttpServer } from "http";

const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  await producer.connect();
  console.log("Kafka producer connected");

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection established");

    let registeredUserId: string | null = null;

    ws.on("message", async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();

        // Register the user on first plain message (non-JSON)
        if (!registeredUserId && !messageStr.startsWith("{")) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);
          console.log(`User ${registeredUserId} registered with WebSocket`);

          const isSeller = registeredUserId.startsWith("seller_");
          const redisKey = isSeller
            ? `online:seller:${registeredUserId.replace("seller_", "")}`
            : `online:user:${registeredUserId}`;
          await redis.set(redisKey, "1");
          await redis.expire(redisKey, 300);
          return;
        }

        // process the JSON message
        const data: IncomingMessage = JSON.parse(messageStr);

        // if it's seen update, reset unseen count and skip Kafka
        if (data.type === "MARK_AS_SEEN" && registeredUserId) {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);
          console.log(
            `User ${registeredUserId} marked conversation ${data.conversationId} as seen`,
          );
          return;
        }

        // regular message, send to Kafka
        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
        } = data;

        if (!toUserId || !messageBody || !conversationId || !senderType) {
          console.warn("Invalid message format, missing required fields", data);
          return;
        }

        const now = new Date().toISOString();
        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const recieverKey =
          senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`;

        // update unseen count for receiver dynamically
        const unseenKey = `${recieverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        // send new message to receiver
        const receiverSocket = connectedUsers.get(recieverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);

          // also notify unseen count
          receiverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            }),
          );
          console.log(
            `Sent message to ${recieverKey} and updated unseen count to ${
              prevCount + 1
            }`,
          );
        } else {
          console.log(
            `Receiver ${recieverKey} is not connected, message will be delivered when they come online . Message queued in Kafka`,
          );
        }

        // echo to sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message back to sender ${senderKey}`);
        }

        // push to Kafka for persistence and offline delivery
        await producer.send({
          topic: "chat.new_message",
          messages: [
            { key: conversationId, value: JSON.stringify(messagePayload) },
          ],
        });
        console.log(`Message sent to Kafka topic 'chat.new_message'`);
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("close", async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        console.log(
          `User ${registeredUserId} disconnected and removed from registry`,
        );
        const isSeller = registeredUserId.startsWith("seller_");
        const redisKey = isSeller
          ? `online:seller:${registeredUserId.replace("seller_", "")}`
          : `online:user:${registeredUserId}`;
        await redis.del(redisKey);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  console.log("WebSocket server is running");
}
