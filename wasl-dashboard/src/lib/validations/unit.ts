import { z } from "zod";

// Shared common Enums based on the prompt
export const UnitStatusEnum = z.enum(["Available", "Reserved", "Sold", "Under Construction"]);
export const UnitTypeEnum = z.enum(["Apartment", "Villa", "Duplex", "Office", "Retail", "Other"]);

export const unitPayloadSchema = z.object({
    // Tab 1: Basic Info (المعلومات الأساسية)
    projectId: z.coerce.string().min(1, "المشروع مطلوب"),
    projectCode: z.coerce.string().optional(),
    projectName: z.coerce.string().optional(),
    projectNumber: z.coerce.string().optional(),
    unitCode: z.coerce.string().min(1, "كود الوحدة مطلوب"),
    unitTypeCode: z.coerce.string().optional(),
    unitModel: z.coerce.string().min(1, "نموذج الوحدة مطلوب"),
    developer: z.coerce.string().min(1, "المطور مطلوب"),
    status: UnitStatusEnum.default("Available"),
    type: UnitTypeEnum.default("Apartment"),
    floor: z.coerce.string().optional(),
    elevatorStatus: z.coerce.string().optional(),
    netArea: z.coerce.number().min(0, "المساحة يجب أن تكون رقم إيجابي").optional(),
    privateArea: z.coerce.number().min(0).optional(),
    totalArea: z.coerce.number().min(0).optional(),
    price: z.coerce.number().min(0, "السعر مطلوب ويجب أن يكون رقم إيجابي"),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().int().min(0).optional(),
    components: z.array(z.string()).default([]),
    amenities: z.array(z.string()).default([]),

    // Tab 2: Location (الموقع)
    country: z.coerce.string().optional(),
    city: z.coerce.string().optional(),
    district: z.coerce.string().optional(),
    location: z.coerce.string().optional(),
    direction: z.coerce.string().optional(),
    facade: z.coerce.string().optional(),

    // Tab 3: Additional Info (معلومات إضافية)
    projectOpeningDate: z.coerce.string().optional(), // Could be date string ISO
    unitNumber: z.coerce.string().optional(),
    buildingNumber: z.coerce.string().optional(),
    farzNumber: z.coerce.string().optional(), // رقم الفرز
    patioArea: z.coerce.number().min(0).optional(),
    titleDeedArea: z.coerce.number().min(0).optional(), // مساحة الصك

    // Tab 4: Media
    photos: z.array(z.string().url("يجب أن يكون رابطاً صحيحاً")).default([]),
    videoUrl: z.string().url("يجب أن يكون رابطاً صحيحاً").optional().or(z.literal("")),
    virtualTourUrl: z.string().url("يجب أن يكون رابطاً صحيحاً").optional().or(z.literal("")),
    brochureUrl: z.string().url("يجب أن يكون رابطاً صحيحاً").optional().or(z.literal("")),
    projectBrochure: z.string().url("يجب أن يكون رابطاً صحيحاً").optional().or(z.literal("")),

    // Dynamic Custom Fields
    customFields: z.record(z.any()).optional(),
});

export type UnitPayload = z.infer<typeof unitPayloadSchema>;
