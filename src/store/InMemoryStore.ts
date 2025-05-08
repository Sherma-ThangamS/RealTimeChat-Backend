import { Chat, Store, UserId } from "./Store";

let globleChatId = 0;

interface Room {
  roomId: string;
  chats: Chat[];
}

export class InMemoryStore implements Store {
  private store: Map<string, Room>;
  constructor() {
    this.store = new Map<string, Room>();
  }

  initRoom(roomId: string) {
    this.store.set(roomId, { roomId: roomId, chats: [] });
  }

  getChat(roomId: string, limit: number, offSet: number) {
    const room = this.store.get(roomId);
    if (!room) return [];
    return room.chats.reverse().slice(offSet).slice(0, limit);
  }

  addChat(roomId: string, userId: UserId, name: string, message: string) {
    if (!this.store.get(roomId)) {
      this.initRoom(roomId);
    }
    const room = this.store.get(roomId);
    if (!room) {
      return;
    }
    const chat = {
      id: (globleChatId++).toString(),
      userId,
      name,
      message,
      upVotes: [],
    };
    room.chats.push(chat);
    return chat;
  }

  upVote(roomId: string, chatId: string, userId: UserId) {
    const room = this.store.get(roomId);
    if (!room) {
      console.error("Upvote error Room Not Found");
      return null;
    }

    const chat = room.chats.find(({ id }) => {
      return String(id) === String(chatId);
    });

    if (!chat) {
      console.error("Upvote error Chat Not Found");
      return null;
    }

    if (chat.upVotes.find((ele) => ele === userId)) return;

    chat.upVotes.push(userId);

    return chat;
  }
}
