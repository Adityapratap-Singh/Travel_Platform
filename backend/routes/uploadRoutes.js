const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadToCloudinary(buffer, folder, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

router.post('/image', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const result = await uploadToCloudinary(req.file.buffer, 'travel_app/images', 'image');
    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/video', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const result = await uploadToCloudinary(req.file.buffer, 'travel_app/videos', 'video');
    res.json({
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      duration: result.duration,
      format: result.format
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
