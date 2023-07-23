"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_error_1 = __importDefault(require("../models/http-error"));
exports.default = (req, res, next) => {
    var _a;
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            throw new Error("Authentication failed!");
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
        req.userData = { userId: decodedToken.userId };
        next();
    }
    catch (error) {
        return next(new http_error_1.default("Authentication failed!", 403));
    }
};
