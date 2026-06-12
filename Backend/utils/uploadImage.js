import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    if (!buffer) return reject(new Error("No buffer provided"));

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profile-images",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
