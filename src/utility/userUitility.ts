import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import {promisify} from "util";
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

  return jwt.sign({data}, env);
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


export {
  decodedToken,
  encodeToken,
  getHashedPassword,
  passwordIsValid,
  generateToken,
  generateTokenForGuest
}