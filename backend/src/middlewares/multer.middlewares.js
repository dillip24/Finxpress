import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";  // For unique filenames

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // Append unique ID to filename to avoid overwrites
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WEBP files are allowed"), false);
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB max
    },
    fileFilter,
});

