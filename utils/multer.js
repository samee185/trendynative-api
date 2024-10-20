const multer = require("multer");
const path = require("path");
const DataUri = require("datauri/parser");
const { console } = require("inspector");

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
}).array("image", 4);

const dUri = new DataUri();


const dataUri = (file) =>
  dUri.format(path.extname(file.originalname).toString(), file.buffer);

// Middleware to ensure at least 4 images are uploaded
const ensureMinImages = (req, res, next) => {
  console.log(req.files);
  if (!req.files || req.files.length < 4) {
    return res.status(400).json({
      status: "fail",
      message: "At least 4 images are required.",
    });
  }
  next();
};

module.exports = { dataUri, imageUploads, ensureMinImages };
