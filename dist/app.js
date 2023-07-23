"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const mongoose_1 = require("mongoose");
// import "dotenv/config";
const places_routes_1 = __importDefault(require("./routes/places-routes"));
const users_routes_1 = __importDefault(require("./routes/users-routes"));
const http_error_1 = __importDefault(require("./shared/models/http-error"));
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use("/uploads/images", express_1.default.static(path_1.default.join("uploads", "images")));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
});
app.use("/api/places", places_routes_1.default);
app.use("/api/users", users_routes_1.default);
app.use(() => {
    throw new http_error_1.default("Could not find this route.", 404);
});
app.use((error, req, res, next) => {
    if (req.file) {
        fs_1.default.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occurred!" });
});
(0, mongoose_1.connect)(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hsqg5qy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
    // app.listen(process.env.PORT);
    app.listen(5000);
})
    .catch((err) => {
    console.log(err);
});
