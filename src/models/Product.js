import mongoose from "mongoose";
import {localizedString} from "./utils.js";

const productImageSchema = new mongoose.Schema({
  url: {type: String, required: true, trim: true},
  fileId: {type: String, trim: true},
  alt: localizedString(),
  isPrimary: {type: Boolean, default: false},
  sortOrder: {type: Number, default: 0},
});

const measuringUnitOptionSchema = new mongoose.Schema({
  name: localizedString({required: true}),
  price: {type: Number, required: true, min: 0},
  key: {type: String, enum: ["S", "M", "L", ""], default: ""},
  isActive: {type: Boolean, default: true},
  sortOrder: {type: Number, default: 0},
});

const ingredientSchema = new mongoose.Schema(
  {
    ar: {type: String, trim: true},
    en: {type: String, trim: true},
  },
  {_id: false}
);

const productSchema = new mongoose.Schema(
  {
    name: localizedString({required: true}),
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be kebab-case (e.g. cheese-pizza)",
      ],
    },
    description: localizedString(),
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {type: Number, required: true, min: 0},
    isActive: {type: Boolean, default: true},
    isAvailable: {type: Boolean, default: true},
    isFeatured: {type: Boolean, default: false},
    isNewItem: {type: Boolean, default: false},
    ingredients: {type: [ingredientSchema], default: []},
    sortOrder: {type: Number, default: 0},
    images: {type: [productImageSchema], default: []},
    hasMeasuringUnit: {type: Boolean, default: false},
    measuringUnit: {
      unitType: {
        type: String,
        enum: ["weight", "pieces", "size"],
        required: function () {
          return this.hasMeasuringUnit;
        },
      },
      options: {
        type: [measuringUnitOptionSchema],
        default: [],
      },
    },
  },
  {timestamps: true}
);

productSchema.index({slug: 1}, {unique: true});
productSchema.index({category: 1});
productSchema.index({isActive: 1});
productSchema.index({isAvailable: 1});
productSchema.index({isFeatured: 1});
productSchema.index({sortOrder: 1});
productSchema.index({isActive: 1, sortOrder: 1, createdAt: -1});
productSchema.index({category: 1, isActive: 1, sortOrder: 1});
productSchema.index({isFeatured: 1, isActive: 1, sortOrder: 1});

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);