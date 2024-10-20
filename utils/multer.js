const multer = require("multer");
const path = require("path");
const DataUri = require("datauri/parser");

const storage = multer.memoryStorage();

const imageUploads = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 20 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      )
    );
  },
}).array("image", 6);

const dUri = new DataUri();

// Helper function to process individual files and return data URI
const dataUri = (file) =>
  dUri.format(path.extname(file.originalname).toString(), file.buffer);

// Middleware to ensure at least 4 images are uploaded
const ensureMinImages = (req, res, next) => {
  if (!req.files || req.files.length < 4) {
    return res.status(400).json({
      status: "fail",
      message: "At least 4 images are required.",
    });
  }
  next();
};

module.exports = { dataUri, imageUploads, ensureMinImages };
