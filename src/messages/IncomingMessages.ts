import z from 'zod';


export enum SupportedMessage{
    JoinRoom="JOIN_ROOM",
    SendMessage="SEND_MESSAGE",
    UpvoteMessage="UPVOTE_MESSAGE"
}

export type IncomingMessage ={
    type:SupportedMessage.JoinRoom,
    payload:InitMessage
} | {
    type:SupportedMessage.SendMessage,
    payload:UserMessage
} | {
    type:SupportedMessage.UpvoteMessage,
    payload:UpvoteMessage
}

export const InitMessage=z.object({
    name:z.string(),
    roomId:z.string(),
    userId:z.string(),
})

export type InitMessage = z.infer<typeof InitMessage>;

export const UserMessage=z.object({
    userId:z.string(),
    roomId:z.string(),
    message:z.string()
})

export type UserMessage = z.infer<typeof UserMessage>;


export const UpvoteMessage = z.object({
    userId:z.string(),
    roomId:z.string(),
    chatId:z.string()
})

export type UpvoteMessage = z.infer<typeof UpvoteMessage>;
