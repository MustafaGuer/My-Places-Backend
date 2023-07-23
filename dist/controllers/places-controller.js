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
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = require("mongoose");
const express_validator_1 = require("express-validator");
const http_error_1 = __importDefault(require("../shared/models/http-error"));
const location_1 = __importDefault(require("../shared/util/location"));
const place_1 = __importDefault(require("../shared/models/place"));
const user_1 = __importDefault(require("../shared/models/user"));
const getPlaceById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const placeId = req.params.pid;
    let place;
    try {
        place = yield place_1.default.findById(placeId).populate("creator");
    }
    catch (error) {
        return next(new http_error_1.default("Something went wrong, could not find a place.", 500));
    }
    if (!place) {
        return next(new http_error_1.default("Could not find a place for the provided id!", 404));
    }
    res.json({ place: place.toObject({ getters: true }) });
});
const getPlacesByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.uid;
    let places;
    try {
        places = yield place_1.default.find({ creator: userId }).populate("creator");
    }
    catch (error) {
        return next(new http_error_1.default("Fetching places failed, please try again later.", 500));
    }
    if (!places || places.length === 0) {
        return next(new http_error_1.default("Could not find places for the provided user id!", 404));
    }
    res.json({ places: places.map((p) => p.toObject({ getters: true })) });
});
const postCreatePlace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new http_error_1.default("Invalid inputs passed, please check your data.", 422));
    }
    const { title, description, address } = req.body;
    let coordinatesFromGoogle;
    try {
        coordinatesFromGoogle = yield (0, location_1.default)(address);
    }
    catch (error) {
        return next(error);
    }
    const createdPlace = new place_1.default({
        title,
        description,
        image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path,
        address,
        location: coordinatesFromGoogle,
        creator: req.userData.userId,
    });
    let user;
    try {
        user = yield user_1.default.findById(req.userData.userId);
    }
    catch (error) {
        return next(new http_error_1.default("Creating place failed, please try again", 500));
    }
    if (!user) {
        return next(new http_error_1.default("Could not find user for provided id.", 404));
    }
    try {
        const session = yield (0, mongoose_1.startSession)();
        session.startTransaction();
        yield createdPlace.save({ session: session });
        user.places.push(createdPlace.id);
        yield user.save({ session: session });
        yield session.commitTransaction();
    }
    catch (error) {
        return next(new http_error_1.default("Creating place failed, please try again", 500));
    }
    res.status(201).json({ place: createdPlace });
});
const patchUpdatePlace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new http_error_1.default("Invalid inputs passed, please check your data.", 422));
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;
    let place;
    try {
        place = yield place_1.default.findById(placeId);
    }
    catch (error) {
        return next(new http_error_1.default("Updating place failed, please try again later.", 500));
    }
    if (!place) {
        return next(new http_error_1.default("Could not find place data, please try again later", 500));
    }
    if (place.creator.toString() !== req.userData.userId) {
        return next(new http_error_1.default("You are not allowed to edit this place.", 401));
    }
    place.title = title;
    place.description = description;
    try {
        yield place.save();
    }
    catch (error) {
        return next(new http_error_1.default("Something went wrong, could not update place.", 500));
    }
    res.status(200).json({ place: place.toObject({ getters: true }) });
});
const deletePlace = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const placeId = req.params.pid;
    let place;
    try {
        place = yield place_1.default.findById(placeId).populate("creator");
    }
    catch (error) {
        return next(new http_error_1.default("Something went wrong, could not delete place.", 500));
    }
    if (!place) {
        return next(new http_error_1.default("Could not find place for this id.", 404));
    }
    if (place.creator.id.toString() !== req.userData.userId) {
        return next(new http_error_1.default("You are not allowed to delete this place.", 401));
    }
    const imagePath = place.image;
    try {
        yield place_1.default.findByIdAndRemove(placeId);
        const userId = place.creator.id;
        yield user_1.default.findByIdAndUpdate(userId, { $pull: { places: placeId } }, { new: true });
    }
    catch (error) {
        new http_error_1.default("Something went wrong, could not delete place.", 500);
    }
    fs_1.default.unlink(imagePath, (err) => {
        console.log(err);
    });
    res.json({ message: "Deleted place." });
});
exports.default = {
    getPlaceById,
    getPlacesByUserId,
    postCreatePlace,
    patchUpdatePlace,
    deletePlace,
};
