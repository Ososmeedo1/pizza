import mongoose from "mongoose";
import {localizedString} from "./utils.js";

const addOnSchema = new mongoose.Schema(
  {
    name: localizedString({required: true}),
    priceMode: {
      type: String,
      enum: ["flat", "bySize"],
      required: true,
    },
    price: {type: Number, min: 0},
    sizePrices: {
      type: {
        S: {type: Number, min: 0},
        M: {type: Number, min: 0},
        L: {type: Number, min: 0},
      },
      _id: false,
      default: {},
    },
    isActive: {type: Boolean, default: true},
    sortOrder: {type: Number, default: 0},
  },
  {timestamps: true}
);

addOnSchema.index({isActive: 1, sortOrder: 1});

export const AddOn =
  mongoose.models.AddOn || mongoose.model("AddOn", addOnSchema);