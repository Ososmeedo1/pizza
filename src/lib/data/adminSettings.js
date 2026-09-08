import {connectDB} from "@/lib/db";
import {SiteSettings} from "@/models/SiteSettings";

const EMPTY_SETTINGS = {
  brandName: {ar: "", en: ""},
  logo: {url: "", fileId: "", alt: {ar: "", en: ""}},
  favicon: {url: "", fileId: "", alt: {ar: "", en: ""}},
  phone: "",
  email: "",
  branches: [],
  instagram: "",
  facebook: "",
  openingHours: {ar: "", en: ""},
  contactMessage: {ar: "", en: ""},
  mapEmbedUrl: "",
  mapLatitude: null,
  mapLongitude: null,
};

function toAdminBranch(branch) {
  return {
    name: {ar: branch?.name?.ar ?? "", en: branch?.name?.en ?? ""},
    address: {ar: branch?.address?.ar ?? "", en: branch?.address?.en ?? ""},
    phone: branch?.phone ?? "",
    mapUrl: branch?.mapUrl ?? "",
  };
}

export async function getAdminSettings() {
  try {
    await connectDB();

    const settings = await SiteSettings.findOne({singletonKey: "site"}).lean();

    if (!settings) {
      return EMPTY_SETTINGS;
    }

    return {
      brandName: settings.brandName ?? {ar: "", en: ""},
      logo: settings.logo ?? {url: "", fileId: "", alt: {ar: "", en: ""}},
      favicon: settings.favicon ?? {url: "", fileId: "", alt: {ar: "", en: ""}},
      phone: settings.phone ?? "",
      email: settings.email ?? "",
      branches: Array.isArray(settings.branches)
        ? settings.branches.map(toAdminBranch)
        : [],
      instagram: settings.instagram ?? "",
      facebook: settings.facebook ?? "",
      openingHours: settings.openingHours ?? {ar: "", en: ""},
      contactMessage: settings.contactMessage ?? {ar: "", en: ""},
      mapEmbedUrl: settings.mapEmbedUrl ?? "",
      mapLatitude: settings.mapLatitude ?? null,
      mapLongitude: settings.mapLongitude ?? null,
    };
  } catch (error) {
    console.warn(
      `getAdminSettings: database unavailable (${error instanceof Error ? error.message : String(error)})`
    );
    return EMPTY_SETTINGS;
  }
}
