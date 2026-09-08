import multer from "multer";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      return callback(null, true);
    }
    return callback(new Error("Only image files are allowed."));
  },
});

export const uploadVehicleImage = (req, res, next) => {
  imageUpload.single("image")(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Image must be 5 MB or smaller." });
      }
      return res.status(400).json({ success: false, message: error.message || "Invalid image upload." });
    }
    next();
  });
};