import { Router } from "express";
import { check } from "express-validator";

import usersController from "../controllers/users-controller";
import fileUpload from "../shared/middleware/file-upload";

const router = Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 7 }),
  ],
  usersController.postSignup
);

router.post("/login", usersController.postLogin);

export default router;
