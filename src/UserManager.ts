import { connection } from "websocket";
import { OutgoingMessage } from "./messages/OutgoingMessages";

interface User {
  id: string;
  name: string;
  conn: connection;
}

interface Room {
  id: string;
  users: User[];
}

export class UserManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  addUser(roomId: string, userId: string, name: string, socket: connection) {
    if (!this.rooms.get(roomId)) {
      const newRoom = { id: roomId, users: [] };
      this.rooms.set(roomId, newRoom);
    }
    this.rooms.get(roomId)?.users.push({ id: userId, name, conn: socket });
    console.log("user added");

    socket.on("close", () => {
      this.removeUser(roomId, userId);
    });
  }

  removeUser(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.users = room.users.filter(({ id }) => id !== userId);
    console.log("user removed");
  }

  getUser(roomId: string, userId: string): User | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const user = room.users.find(({ id }) => id === userId);
    if (user) return user;
    return null;
  }

  broadcast(roomId: string, userId: string, message: OutgoingMessage) {
    const user = this.getUser(roomId, userId);
    if (!user) {
      console.error("User not found");
      return;
    }
    const room = this.rooms.get(roomId);

    room?.users.forEach(({ conn, id }) => {
      // if (id !== userId) {
      conn.sendUTF(JSON.stringify(message));
      // }
    });
  }
}
