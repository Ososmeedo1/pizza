import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";
import {connectDB} from "@/lib/db";
import {SiteSettings} from "@/models/SiteSettings";
import {settingsSchema} from "@/lib/validations/settings";
import {revalidateSettingsPaths} from "@/lib/revalidate";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
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

function toSettingsView(doc) {
  if (!doc) {
    return DEFAULT_SETTINGS;
  }
  return {
    brandName: doc.brandName ?? {ar: "", en: ""},
    logo: doc.logo ?? {url: "", fileId: "", alt: {ar: "", en: ""}},
    favicon: doc.favicon ?? {url: "", fileId: "", alt: {ar: "", en: ""}},
    phone: doc.phone ?? "",
    email: doc.email ?? "",
    branches: Array.isArray(doc.branches) ? doc.branches.map(toAdminBranch) : [],
    instagram: doc.instagram ?? "",
    facebook: doc.facebook ?? "",
    openingHours: doc.openingHours ?? {ar: "", en: ""},
    contactMessage: doc.contactMessage ?? {ar: "", en: ""},
    mapEmbedUrl: doc.mapEmbedUrl ?? "",
    mapLatitude: doc.mapLatitude ?? null,
    mapLongitude: doc.mapLongitude ?? null,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    await connectDB();

    const settings = await SiteSettings.findOne({singletonKey: "site"}).lean();

    return NextResponse.json({settings: toSettingsView(settings)});
  } catch (error) {
    console.error("admin settings GET: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const parsed = settingsSchema().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({error: "INVALID_BODY"}, {status: 400});
    }

    const data = parsed.data;

    if (data.mapLatitude === undefined) {
      delete data.mapLatitude;
    }
    if (data.mapLongitude === undefined) {
      delete data.mapLongitude;
    }

    await connectDB();

    const updated = await SiteSettings.findOneAndUpdate(
      {singletonKey: "site"},
      {$set: {...data, mapEmbedUrl: data.mapEmbedUrl ?? ""}},
      {upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
    ).lean();

    revalidateSettingsPaths();

    return NextResponse.json({settings: toSettingsView(updated)});
  } catch (error) {
    console.error("admin settings PUT: unexpected error", error);
    return NextResponse.json({error: "INTERNAL_ERROR"}, {status: 500});
  }
}
