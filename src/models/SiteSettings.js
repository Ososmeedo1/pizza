import mongoose from "mongoose";
import {localizedString} from "./utils.js";

const siteSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "site",
      unique: true,
    },
    brandName: localizedString(),
    logo: {
      url: {type: String, trim: true},
      fileId: {type: String, trim: true},
      alt: localizedString(),
      _id: false,
    },
    favicon: {
      url: {type: String, trim: true},
      fileId: {type: String, trim: true},
      alt: localizedString(),
      _id: false,
    },
    phone: {type: String, trim: true},
    email: {type: String, trim: true},
    instagram: {type: String, trim: true},
    facebook: {type: String, trim: true},
    branches: {
      type: [
        {
          name: localizedString(),
          address: localizedString(),
          phone: {type: String, trim: true},
          mapUrl: {type: String, trim: true},
          _id: false,
        },
      ],
      default: [],
    },
    openingHours: localizedString(),
    contactMessage: localizedString(),
    mapEmbedUrl: {type: String, trim: true},
    mapLatitude: {type: Number, default: null},
    mapLongitude: {type: Number, default: null},
  },
  {timestamps: true}
);

export const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);