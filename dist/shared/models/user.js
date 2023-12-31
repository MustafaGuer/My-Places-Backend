"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    places: [{ type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Place" }],
});
userSchema.plugin(mongoose_unique_validator_1.default);
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
