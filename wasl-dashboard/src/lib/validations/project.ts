import { z } from "zod";

export const projectPayloadSchema = z.object({
    name: z.coerce.string().min(1, "اسم المشروع مطلوب"),
    projectCode: z.coerce.string().optional(),
    developer: z.coerce.string().optional(),
    projectNumber: z.coerce.string().optional(),
    projectStatus: z.coerce.string().optional(),
    projectType: z.coerce.string().optional(),
    unitTypes: z.coerce.string().optional(),
    openingDate: z.coerce.string().optional(),
    country: z.coerce.string().optional(),
    city: z.coerce.string().min(1, "المدينة مطلوبة"),
    district: z.coerce.string().min(1, "الحي/المنطقة مطلوبة"),
    direction: z.coerce.string().min(1, "الاتجاه مطلوب"),
    locationUrl: z.coerce.string().optional(),
    amenities: z.array(z.string()).default([]),
    mapCoordinates: z.object({
        lat: z.number().optional().or(z.string().transform((val) => Number(val) || undefined)),
        lng: z.number().optional().or(z.string().transform((val) => Number(val) || undefined)),
    }).optional(),
    marketingPitch: z.coerce.string().optional(),
    manychat: z.coerce.string().optional(),

    // unit counts
    totalUnits: z.coerce.number().optional(),
    availableUnits: z.coerce.number().optional(),
    underConstructionUnits: z.coerce.number().optional(),
    reservedUnits: z.coerce.number().optional(),
    soldUnits: z.coerce.number().optional(),

    // prices & values
    avgUnitPrice: z.coerce.number().optional(),
    avgAvailableUnitPrice: z.coerce.number().optional(),
    totalProjectValue: z.coerce.number().optional(),
    soldPercentage: z.coerce.number().optional(),
    totalUnderConstructionValue: z.coerce.number().optional(),
    totalAvailableValue: z.coerce.number().optional(),
    totalReservedValue: z.coerce.number().optional(),
    totalSoldValue: z.coerce.number().optional(),

    minPrice: z.coerce.number().optional(),
    minAvailablePrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    maxAvailablePrice: z.coerce.number().optional(),

    minArea: z.coerce.number().optional(),
    minAvailableArea: z.coerce.number().optional(),
    maxArea: z.coerce.number().optional(),
    maxAvailableArea: z.coerce.number().optional(),

    minBedrooms: z.coerce.number().optional(),
    minAvailableBedrooms: z.coerce.number().optional(),
    maxBedrooms: z.coerce.number().optional(),
    maxAvailableBedrooms: z.coerce.number().optional(),

    minBathrooms: z.coerce.number().optional(),
    minAvailableBathrooms: z.coerce.number().optional(),
    maxBathrooms: z.coerce.number().optional(),
    maxAvailableBathrooms: z.coerce.number().optional(),

    // Ranges
    priceRange: z.coerce.string().optional(),
    availablePriceRange: z.coerce.string().optional(),
    areaRange: z.coerce.string().optional(),
    availableAreaRange: z.coerce.string().optional(),
    bedroomsRange: z.coerce.string().optional(),
    availableBedroomsRange: z.coerce.string().optional(),
    bathroomsRange: z.coerce.string().optional(),
    availableBathroomsRange: z.coerce.string().optional(),

    brochureUrl: z.string().url("يجب أن يكون رابطاً صحيحاً").optional().or(z.literal("")),
    videoUrl: z.string().url("يجب أن يكون رابطاً صحيحاً").optional().or(z.literal("")),
    photos: z.array(z.string().url("يجب أن يكون رابطاً صحيحاً")).default([]),

    // Dynamic Custom Fields
    customFields: z.record(z.any()).optional(),
});

export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
