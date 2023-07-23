import multer from "multer";
import { v1 as uuidv1 } from "uuid";

const MIME_TYPE_MAP: { [key: string]: string } = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const fileUpload = multer({
  limits: { fileSize: 1000000 },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv1() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    // const error = isValid ? null : new Error("Invalid mime type!");
    // if(isValid) cb(null, true);
    // if(!isValid) cb(error)
    cb(null, isValid);
  },
});

export default fileUpload;
