import mongoose from "mongoose";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository.js";
import MessageModel from "../db/models/MessageModel.js";
import { PaginationCursor } from "../../shared/utils/pagination.js";

function mapMessage(doc) {
  if (!doc) return null;

  return {
    id: String(doc._id),
    roomId: doc.roomId,
    userId: doc.userId,
    username: doc.username,
    message: doc.message,
    reactions: doc.reactions || [],
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

    if (cursor) {
      try {
        const decoded = PaginationCursor.decode(cursor);
        query._id = { $lt: new mongoose.Types.ObjectId(decoded.id) };
      } catch (err) {
        // Silently fallback to no cursor if invalid
      }
    }

    const docs = await MessageModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .exec();

    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;
    const data = pageDocs.map(mapMessage);

    return {
      items: data,
      hasMore,
      nextCursor: hasMore ? PaginationCursor.createNextCursor(pageDocs) : null,
      count: data.length,
    };
  }

  async addReaction(messageId, reaction) {
    // Primero removemos si el mismo usuario ya reaccionó con el mismo emoji (deduplicación)
    await MessageModel.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { userId: reaction.userId, emoji: reaction.emoji } } }
    );
    
    const updated = await MessageModel.findByIdAndUpdate(
      messageId,
      { $push: { reactions: reaction } },
      { new: true }
    );
    
    return mapMessage(updated);
  }

  async removeReaction(messageId, userId, emoji) {
    const updated = await MessageModel.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { userId, emoji } } },
      { new: true }
    );
    return mapMessage(updated);
  }
}

export const messageRepository = new MessageRepository();
