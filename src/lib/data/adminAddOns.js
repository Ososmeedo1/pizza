import mongoose from "mongoose";
import {connectDB} from "@/lib/db";
import {AddOn} from "@/models/AddOn";

export function toAddOnView(addOn) {
  return {
    id: String(addOn._id),
    name: addOn.name,
    priceMode: addOn.priceMode,
    price: typeof addOn.price === "number" ? addOn.price : null,
    sizePrices: {
      S: typeof addOn.sizePrices?.S === "number" ? addOn.sizePrices.S : null,
      M: typeof addOn.sizePrices?.M === "number" ? addOn.sizePrices.M : null,
      L: typeof addOn.sizePrices?.L === "number" ? addOn.sizePrices.L : null,
    },
    isActive: addOn.isActive !== false,
    sortOrder: addOn.sortOrder ?? 0,
  };
}

export async function getAdminAddOns() {
  try {
    await connectDB();

    const addOns = await AddOn.find({})
      .sort({sortOrder: 1, createdAt: -1, _id: 1})
      .lean();

    return addOns.map(toAddOnView);
  } catch (error) {
    console.warn(
      `getAdminAddOns: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return [];
  }
}

export function isValidAddOnId(id) {
  return mongoose.isValidObjectId(id);
}

export async function getAdminAddOnById(id) {
  if (!isValidAddOnId(id)) {
    return null;
  }

  try {
    await connectDB();

    const addOn = await AddOn.findById(id).lean();

    return addOn ? toAddOnView(addOn) : null;
  } catch (error) {
    console.warn(
      `getAdminAddOnById: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return null;
  }
}