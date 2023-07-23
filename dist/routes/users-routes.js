"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const users_controller_1 = __importDefault(require("../controllers/users-controller"));
const file_upload_1 = __importDefault(require("../shared/middleware/file-upload"));
const router = (0, express_1.Router)();
router.get("/", users_controller_1.default.getUsers);
router.post("/signup", file_upload_1.default.single("image"), [
    (0, express_validator_1.check)("name").not().isEmpty(),
    (0, express_validator_1.check)("email").normalizeEmail().isEmail(),
    (0, express_validator_1.check)("password").isLength({ min: 7 }),
], users_controller_1.default.postSignup);
router.post("/login", users_controller_1.default.postLogin);
exports.default = router;
