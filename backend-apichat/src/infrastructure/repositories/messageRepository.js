import mongoose from "mongoose";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository.js";
import MessageModel from "../db/models/MessageModel.js";

function mapMessage(doc) {
  if (!doc) return null;

  return {
    id: String(doc._id),
    roomId: doc.roomId,
    userId: doc.userId,
    username: doc.username,
    message: doc.message,
    createdAt: doc.createdAt,
  };
}

export class MessageRepository extends IMessageRepository {
  async create(messageEntity) {
    const message = new MessageModel({
      roomId: messageEntity.roomId,
      userId: messageEntity.userId,
      username: messageEntity.username,
      message: messageEntity.message,
    });

    const saved = await message.save();
    return mapMessage(saved);
  }

  async findByRoom(roomId, cursor, limit) {
    const query = { roomId };

    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const docs = await MessageModel.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;
    const data = pageDocs.map(mapMessage);

    return {
      data,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1]?.id || null : null,
    };
  }
}

export const messageRepository = new MessageRepository();
