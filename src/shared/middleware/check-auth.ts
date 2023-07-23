import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import HttpError from "../models/http-error";
import { CustomRequest } from "../../../custom";

export default (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(
      token,
      `${process.env.JWT_SECRET}`
    ) as JwtPayload;
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError("Authentication failed!", 403));
  }
};
