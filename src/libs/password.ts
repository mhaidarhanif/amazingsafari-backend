import { Argon2id } from "oslo/password";

export const hashPassword = async (plainTextPassword: string) => {
  const argon2id = new Argon2id();
  const hash = await argon2id.hash(plainTextPassword);
  return hash;
};

export const verifyPassword = async (
  hash: string, // from database
  plainTextPassword: string // from request body
) => {
  const argon2id = new Argon2id();
  const validPassword = await argon2id.verify(hash, plainTextPassword);
  return validPassword;
};
