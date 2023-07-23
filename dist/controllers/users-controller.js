"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_error_1 = __importDefault(require("../shared/models/http-error"));
const user_1 = __importDefault(require("../shared/models/user"));
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let users;
    try {
        users = yield user_1.default.find({}, "-password");
        // users = await User.find({}, 'email name');
    }
    catch (error) {
        return next(new http_error_1.default("Could not fetch users, please try again later.", 500));
    }
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
});
const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return new http_error_1.default("Invalid input passed, please check your data.", 422);
    }
    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = yield user_1.default.findOne({ email: email });
    }
    catch (error) {
        return next(new http_error_1.default("Signing up failed, please try again later.", 500));
    }
    if (existingUser) {
        return next(new http_error_1.default("User exists already, please login instead", 422));
    }
    let hashedPw;
    try {
        hashedPw = yield bcryptjs_1.default.hash(password, 12);
    }
    catch (error) {
        return next(new http_error_1.default("Could not create user, please try again.", 500));
    }
    const createdUser = new user_1.default({
        name,
        email,
        password: hashedPw,
        image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path,
        places: [],
    });
    try {
        yield createdUser.save();
    }
    catch (error) {
        return next(new http_error_1.default("Signing up failed, please try again...", 500));
    }
    let token;
    try {
        token = jsonwebtoken_1.default.sign({ userId: createdUser.id, email: createdUser.email }, `${process.env.JWT_SECRET}`, { expiresIn: "1h" });
    }
    catch (error) {
        return next(new http_error_1.default("Signing up failed, please try again...", 500));
    }
    res
        .status(201)
        .json({ userId: createdUser.id, email: createdUser.email, token });
});
const postLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = yield user_1.default.findOne({ email: email });
    }
    catch (error) {
        return next(new http_error_1.default("Logging up failed, please try again later.", 500));
    }
    if (!existingUser) {
        return next(new http_error_1.default("Invalid credentials, could not log you in.", 401));
    }
    let isValidPw = false;
    try {
        isValidPw = yield bcryptjs_1.default.compare(password, existingUser.password);
    }
    catch (error) {
        return next(new http_error_1.default("Could not log you in, please check your credentials and try again.", 500));
    }
    if (!isValidPw) {
        return next(new http_error_1.default("Could not log you in, please check your credentials and try again.", 403));
    }
    let token;
    try {
        token = jsonwebtoken_1.default.sign({ userId: existingUser.id, email: existingUser.email }, `${process.env.JWT_SECRET}`, { expiresIn: "1h" });
    }
    catch (error) {
        return next(new http_error_1.default("Could not log you in, please check your credentials and try again.", 403));
    }
    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token,
    });
});
exports.default = { getUsers, postSignup, postLogin };
