export type UserId = string;

export interface Chat {
  id: string;
  userId: UserId;
  name: string;
  message: string;
  upVotes: UserId[];
}

export abstract class Store {
  constructor() {}

  initRoom(roomId: string) {}

  getChat(room: string, limit: number, offSet: number) {}

  addChat(roomId: string, userId: UserId, name: string, message: string) {}

  upVote(roomId: string, chatId: string, userId: UserId) {}
}
