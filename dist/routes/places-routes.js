"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const places_controller_1 = __importDefault(require("../controllers/places-controller"));
const file_upload_1 = __importDefault(require("../shared/middleware/file-upload"));
const check_auth_1 = __importDefault(require("../shared/middleware/check-auth"));
const router = (0, express_1.Router)();
router.get("/:pid", places_controller_1.default.getPlaceById);
router.get("/user/:uid", places_controller_1.default.getPlacesByUserId);
router.use(check_auth_1.default);
router.post("/", file_upload_1.default.single("image"), [
    (0, express_validator_1.check)("title").not().isEmpty(),
    (0, express_validator_1.check)("description").isLength({ min: 5 }),
    (0, express_validator_1.check)("address").not().isEmpty(),
], places_controller_1.default.postCreatePlace);
router.patch("/:pid", [(0, express_validator_1.check)("title").not().isEmpty(), (0, express_validator_1.check)("description").isLength({ min: 5 })], places_controller_1.default.patchUpdatePlace);
router.delete("/:pid", places_controller_1.default.deletePlace);
exports.default = router;
