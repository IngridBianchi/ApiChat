import { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import UserModel from "../db/models/UserModel.js";

function mapUser(doc, { includeSensitive = false } = {}) {
  if (!doc) return null;

  const base = {
    id: String(doc._id),
    username: doc.username,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  if (includeSensitive) {
    return {
      ...base,
      passwordHash: doc.passwordHash,
      refreshTokenHash: doc.refreshTokenHash,
    };
  }

  return base;
}

export class UserRepository extends IUserRepository {
  async create(userEntity) {
    const user = new UserModel({
      username: userEntity.username,
      passwordHash: userEntity.passwordHash,
    });
    const saved = await user.save();
    return mapUser(saved);
  }

  async findByUsername(username) {
    const user = await UserModel.findOne({ username }).exec();
    return mapUser(user);
  }

  async findByUsernameWithCredentials(username) {
    const user = await UserModel.findOne({ username }).select("+passwordHash +refreshTokenHash").exec();
    return mapUser(user, { includeSensitive: true });
  }

  async findById(id) {
    const user = await UserModel.findById(id).exec();
    return mapUser(user);
  }

  async findByIdWithRefreshToken(id) {
    const user = await UserModel.findById(id).select("+refreshTokenHash").exec();
    return mapUser(user, { includeSensitive: true });
  }

  async saveRefreshTokenHash(userId, refreshTokenHash) {
    await UserModel.findByIdAndUpdate(userId, { refreshTokenHash }).exec();
  }

  async clearRefreshTokenHash(userId) {
    await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: null }).exec();
  }
}

export const userRepository = new UserRepository();

