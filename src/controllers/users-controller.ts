import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import HttpError from "../shared/models/http-error";
import User from "../shared/models/user";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  let users;
  try {
    users = await User.find({}, "-password");
    // users = await User.find({}, 'email name');
  } catch (error) {
    return next(
      new HttpError("Could not fetch users, please try again later.", 500)
    );
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const postSignup = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return new HttpError("Invalid input passed, please check your data.", 422);
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  if (existingUser) {
    return next(
      new HttpError("User exists already, please login instead", 422)
    );
  }

  let hashedPw;
  try {
    hashedPw = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPw,
    image: req.file?.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    return next(new HttpError("Signing up failed, please try again...", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      `${process.env.JWT_SECRET}`,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Signing up failed, please try again...", 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError("Logging up failed, please try again later.", 500)
    );
  }

  if (!existingUser) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 401)
    );
  }

  let isValidPw = false;
  try {
    isValidPw = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(
      new HttpError(
        "Could not log you in, please check your credentials and try again.",
        500
      )
    );
  }

  if (!isValidPw) {
    return next(
      new HttpError(
        "Could not log you in, please check your credentials and try again.",
        403
      )
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      `${process.env.JWT_SECRET}`,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError(
        "Could not log you in, please check your credentials and try again.",
        403
      )
    );
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};

export default { getUsers, postSignup, postLogin };
