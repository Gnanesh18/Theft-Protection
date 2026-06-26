const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Local Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure Cloudinary if keys are provided
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                              process.env.CLOUDINARY_API_KEY && 
                              process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Upload Service: Cloudinary configured successfully.');
} else {
  console.log('Upload Service: Cloudinary variables missing. Using Local Storage Fallback.');
}

const handleFileUpload = async (file, host) => {
  if (!file) return null;

  let fileType = 'document';
  if (file.mimetype.startsWith('image/')) fileType = 'image';
  else if (file.mimetype.startsWith('video/')) fileType = 'video';

  if (isCloudinaryConfigured) {
    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: fileType === 'document' ? 'raw' : fileType,
        folder: 'theft_protection_evidence'
      });
      
      // Delete local file after upload
      fs.unlinkSync(file.path);
      
      return {
        url: result.secure_url,
        type: fileType,
        name: file.originalname
      };
    } catch (error) {
      console.error('Cloudinary upload error, keeping local file:', error);
      // Fallback to local url if upload fails
    }
  }

  // Local file serving URL
  const serverUrl = `${host}/uploads/${file.filename}`;
  return {
    url: serverUrl,
    type: fileType,
    name: file.originalname
  };
};

module.exports = {
  upload,
  handleFileUpload
};
