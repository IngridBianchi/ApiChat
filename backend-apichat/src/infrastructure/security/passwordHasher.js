import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const passwordHasher = {
  hash(plainText) {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  },
  compare(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  },
};
