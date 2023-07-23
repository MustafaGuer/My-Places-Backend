"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(message, errorCode) {
        super(message); // Add a "message" prop
        this.code = errorCode;
    }
}
exports.default = HttpError;
