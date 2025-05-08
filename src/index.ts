import http from "http";
import { connection, server as WebSocketServer } from "websocket";
import { IncomingMessage, SupportedMessage } from "./messages/IncomingMessages";
import {
  OutgoingMessage,
  SupportedMessage as OutgoingSupportedMessage,
} from "./messages/OutgoingMessages";
import { InMemoryStore } from "./store/InMemoryStore";
import { UserManager } from "./UserManager";

var server = http.createServer(function (request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});

const userManager = new UserManager();
const store = new InMemoryStore();

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  var connection = request.accept("echo-protocol", request.origin);
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      handleMessage(connection, JSON.parse(message.utf8Data));
      // console.log('Received Message: ' + message.utf8Data);
      // connection.sendUTF(message.utf8Data);
    }
  });
  connection.on("close", function (reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
  });
});

function handleMessage(ws: connection, message: IncomingMessage) {
  console.log(message);
  const type = message.type;
  if (type === SupportedMessage.JoinRoom) {
    const payload = message.payload;
    userManager.addUser(payload.roomId, payload.userId, payload.name, ws);
  }
  if (type === SupportedMessage.SendMessage) {
    const payload = message.payload;
    const user = userManager.getUser(payload.roomId, payload.userId);
    if (!user) {
      console.error("Error user not found");
      return;
    }
    const chat = store.addChat(
      payload.roomId,
      payload.userId,
      user.name,
      payload.message
    );
    if (!chat) {
      console.error("Error chat was not added");
      return;
    }
    const outgoingPayload = {
      type: OutgoingSupportedMessage.AddChat,
      payload: {
        roomId: payload.roomId,
        chatId: chat.id,
        message: payload.message,
        name: user.name,
        upvotes: 0,
      },
    };
    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }
  if (type === SupportedMessage.UpvoteMessage) {
    const payload = message.payload;
    const chat = store.upVote(payload.roomId, payload.chatId, payload.userId);
    if (!chat) {
      return;
    }
    const outgoingPayload: OutgoingMessage = {
      type: OutgoingSupportedMessage.UpdateChat,
      payload: {
        roomId: payload.roomId,
        chatId: payload.chatId,
        upvotes: chat.upVotes.length,
      },
    };
    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }
}

module.exports = server;
