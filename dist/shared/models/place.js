"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const placeSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    creator: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
});
const Place = (0, mongoose_1.model)("Place", placeSchema);
exports.default = Place;
