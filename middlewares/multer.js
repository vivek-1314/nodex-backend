const multer = require("multer");
const path = require("path");

// Change to memoryStorage to prevent local saving
const storage = multer.memoryStorage(); 

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG, GIF) are allowed!"), false);
    }
  },
});

module.exports = upload;
