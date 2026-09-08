import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_ENDPOINT;

export const imagekitConfigured = Boolean(publicKey && privateKey && urlEndpoint);

let imagekit = null;

if (imagekitConfigured) {
  imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
} else {
  console.warn(
    "[imagekit][dev] IMAGEKIT_PUBLIC_KEY / IMAGEKIT_PRIVATE_KEY / IMAGEKIT_URL_ENDPOINT are not set. Image uploads will use mock responses. Set these env vars in production."
  );
}

export {imagekit};