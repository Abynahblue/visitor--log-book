import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import crypto from "crypto";
import { promisify } from "util";
import { IUser } from "../interface/user.interface";

const generateToken = (_id: string, role = "host"): string => {

  return jwt.sign({ _id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
};

const generateTokenForGuest = (_id: string) => {
  if (_id) {
    const accessToken = jwt.sign({
      userId: _id,
    },
      process.env.JWT_SECRET || "",
      { expiresIn: "2h" });

    return accessToken
  };
  return "";
}

const decodedToken = (token: string, env: string) => {
  return jwt.verify(token, env)
};

const encodeToken = (data: any, env: string) => {
  if (!data) return {};

  return jwt.sign({ data }, env);
};

const getHashedPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const passwordIsValid = (password: string) => {
  const re = new RegExp(
    /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^'\\"_-]).{8,}/
  );
  return re.test(password);
};

export class Crypto {
  private key: Buffer;
  private iv: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.CIPHER_KEY!, "utf-8");
    this.iv = Buffer.from(Buffer.alloc(16, 0).toString(), "utf-8");
  }

  public encryptText = (text: string) => {
    try {
      const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.iv);
      const encrypted = cipher.update(text, 'utf-8', "base64") + cipher.final("base64")
      return Buffer.from(encrypted).toString("base64")
    } catch (error) { throw error }
  }
  //Decode a given text using AES encryption
  public decryptText = (text: string) => {
    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc", this.key, this.iv);
      const textBuffer = Buffer.from(text, "base64")
      const encryptedText = textBuffer.toString("utf-8")
      return decipher.update(encryptedText, 'base64', 'utf-8') + decipher.final("utf-8")
    } catch (error) { throw error }
  }
}
export {
  decodedToken,
  encodeToken,
  getHashedPassword,
  passwordIsValid,
  generateToken,
  generateTokenForGuest
}