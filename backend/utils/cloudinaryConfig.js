import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {Object} options - Upload options
 * @param {string} options.filename - Original filename
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.resourceType - 'image', 'raw', 'video', or 'auto'
 * @param {Object} options.metadata - Custom metadata to attach
 * @returns {Promise<Object>} Cloudinary upload result
 */
export async function uploadToCloudinary(fileBuffer, options = {}) {
  const {
    filename,
    folder = 'medisphere/health-records',
    resourceType = 'auto',
    metadata = {}
  } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: filename ? filename.split('.')[0] : undefined,
        context: metadata,
        tags: ['medisphere', 'health-record']
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    const readableStream = Readable.from(fileBuffer);
    readableStream.pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public_id of the file to delete
 * @param {string} resourceType - The resource type ('image', 'raw', etc.)
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Generate a secure signed URL for viewing a file
 * @param {string} publicId - The public_id of the file
 * @param {Object} options - Transformation options
 * @returns {string} Signed URL
 */
export function getSecureUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    ...options,
    secure: true,
    sign_url: true
  });
}

export default cloudinary;
