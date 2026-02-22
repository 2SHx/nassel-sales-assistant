"use server";

import { revalidatePath } from "next/cache";
import { projectPayloadSchema, type ProjectPayload } from "@/lib/validations/project";
import { supabase } from "@/lib/supabase";

export async function createProjectAction(data: ProjectPayload) {
    try {
        // 1. Validate payload
        const parsedData = projectPayloadSchema.safeParse(data);
        if (!parsedData.success) {
            return { success: false, error: parsedData.error.flatten().fieldErrors };
        }

        const payload = parsedData.data;

        // 2. Map payload to DB schema
        const projectData = {
            project_code: payload.projectCode || null,
            developer: payload.developer || null,
            project_number: payload.projectNumber || null,
            project_name: payload.name,
            project_status: payload.projectStatus || 'متاح',
            project_type: payload.projectType || null,
            unit_types: payload.unitTypes || null,
            opening_date: payload.openingDate || null,
            location_url: payload.locationUrl || null,
            country: payload.country || null,
            city: payload.city,
            district: payload.district,
            direction: payload.direction,
            facilities: payload.amenities ? payload.amenities.join(',') : null,
            marketing_pitch: payload.marketingPitch || null,
            manychat: payload.manychat || null,

            total_units: payload.totalUnits || 0,
            available_units: payload.availableUnits || 0,
            under_construction_units: payload.underConstructionUnits || 0,
            reserved_units: payload.reservedUnits || 0,
            sold_units: payload.soldUnits || 0,

            avg_unit_price: payload.avgUnitPrice || 0,
            avg_available_unit_price: payload.avgAvailableUnitPrice || 0,
            total_project_value: payload.totalProjectValue || 0,
            sold_percentage: payload.soldPercentage || 0,
            total_under_construction_value: payload.totalUnderConstructionValue || 0,
            total_available_value: payload.totalAvailableValue || 0,
            total_reserved_value: payload.totalReservedValue || 0,
            total_sold_value: payload.totalSoldValue || 0,

            price_range: payload.priceRange || null,
            available_price_range: payload.availablePriceRange || null,
            area_range: payload.areaRange || null,
            available_area_range: payload.availableAreaRange || null,
            bedrooms_range: payload.bedroomsRange || null,
            available_bedrooms_range: payload.availableBedroomsRange || null,
            bathrooms_range: payload.bathroomsRange || null,
            available_bathrooms_range: payload.availableBathroomsRange || null,

            min_price: payload.minPrice || 0,
            min_available_price: payload.minAvailablePrice || 0,
            max_price: payload.maxPrice || 0,
            max_available_price: payload.maxAvailablePrice || 0,
            min_area: payload.minArea || 0,
            min_available_area: payload.minAvailableArea || 0,
            max_area: payload.maxArea || 0,
            max_available_area: payload.maxAvailableArea || 0,
            min_bedrooms: payload.minBedrooms || 0,
            min_available_bedrooms: payload.minAvailableBedrooms || 0,
            max_bedrooms: payload.maxBedrooms || 0,
            max_available_bedrooms: payload.maxAvailableBedrooms || 0,
            min_bathrooms: payload.minBathrooms || 0,
            min_available_bathrooms: payload.minAvailableBathrooms || 0,
            max_bathrooms: payload.maxBathrooms || 0,
            max_available_bathrooms: payload.maxAvailableBathrooms || 0,

            lat: payload.mapCoordinates?.lat?.toString() || null,
            lng: payload.mapCoordinates?.lng?.toString() || null,
            brochure_url: payload.brochureUrl || null,
            video_url: payload.videoUrl || null,
            images: payload.photos || [],
        };

        // 3. Perform DB operation using Supabase
        const { error } = await supabase
            .from('projects')
            .insert(projectData);

        if (error) {
            console.error("Database Error creating project:", error);
            // Check for specific constraint errors if needed
            return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
        }

        // 4. Revalidate and Return
        revalidatePath("/projects");
        return { success: true, message: "تمت إضافة المشروع بنجاح" };
    } catch (error) {
        console.error("Catch Error creating project:", error);
        return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
    }
}

export async function updateProjectAction(id: string, data: ProjectPayload) {
    try {
        const parsedData = projectPayloadSchema.safeParse(data);
        if (!parsedData.success) {
            return { success: false, error: parsedData.error.flatten().fieldErrors };
        }

        const payload = parsedData.data;

        // Map payload to DB schema
        const projectData = {
            project_code: payload.projectCode || null,
            developer: payload.developer || null,
            project_number: payload.projectNumber || null,
            project_name: payload.name,
            project_status: payload.projectStatus || 'متاح',
            project_type: payload.projectType || null,
            unit_types: payload.unitTypes || null,
            opening_date: payload.openingDate || null,
            location_url: payload.locationUrl || null,
            country: payload.country || null,
            city: payload.city,
            district: payload.district,
            direction: payload.direction,
            facilities: payload.amenities ? payload.amenities.join(',') : null,
            marketing_pitch: payload.marketingPitch || null,
            manychat: payload.manychat || null,

            total_units: payload.totalUnits || 0,
            available_units: payload.availableUnits || 0,
            under_construction_units: payload.underConstructionUnits || 0,
            reserved_units: payload.reservedUnits || 0,
            sold_units: payload.soldUnits || 0,

            avg_unit_price: payload.avgUnitPrice || 0,
            avg_available_unit_price: payload.avgAvailableUnitPrice || 0,
            total_project_value: payload.totalProjectValue || 0,
            sold_percentage: payload.soldPercentage || 0,
            total_under_construction_value: payload.totalUnderConstructionValue || 0,
            total_available_value: payload.totalAvailableValue || 0,
            total_reserved_value: payload.totalReservedValue || 0,
            total_sold_value: payload.totalSoldValue || 0,

            price_range: payload.priceRange || null,
            available_price_range: payload.availablePriceRange || null,
            area_range: payload.areaRange || null,
            available_area_range: payload.availableAreaRange || null,
            bedrooms_range: payload.bedroomsRange || null,
            available_bedrooms_range: payload.availableBedroomsRange || null,
            bathrooms_range: payload.bathroomsRange || null,
            available_bathrooms_range: payload.availableBathroomsRange || null,

            min_price: payload.minPrice || 0,
            min_available_price: payload.minAvailablePrice || 0,
            max_price: payload.maxPrice || 0,
            max_available_price: payload.maxAvailablePrice || 0,
            min_area: payload.minArea || 0,
            min_available_area: payload.minAvailableArea || 0,
            max_area: payload.maxArea || 0,
            max_available_area: payload.maxAvailableArea || 0,
            min_bedrooms: payload.minBedrooms || 0,
            min_available_bedrooms: payload.minAvailableBedrooms || 0,
            max_bedrooms: payload.maxBedrooms || 0,
            max_available_bedrooms: payload.maxAvailableBedrooms || 0,
            min_bathrooms: payload.minBathrooms || 0,
            min_available_bathrooms: payload.minAvailableBathrooms || 0,
            max_bathrooms: payload.maxBathrooms || 0,
            max_available_bathrooms: payload.maxAvailableBathrooms || 0,

            lat: payload.mapCoordinates?.lat?.toString() || null,
            lng: payload.mapCoordinates?.lng?.toString() || null,
            brochure_url: payload.brochureUrl || null,
            video_url: payload.videoUrl || null,
            images: payload.photos || [],
        };

        const { error } = await supabase
            .from('projects')
            .update(projectData)
            .eq('project_id', id);

        if (error) {
            console.error(`Database Error updating project ${id}:`, error);
            return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
        }

        revalidatePath("/projects");
        revalidatePath(`/projects/${id}`);
        return { success: true, message: "تم تعديل المشروع بنجاح" };
    } catch (error) {
        console.error(`Catch Error updating project ${id}:`, error);
        return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
    }
}

export async function archiveProjectAction(id: string) {
    try {
        // Soft delete equivalent logic based on status or deleted flag. Assuming a project_status update for now since there's no archive column verified yet
        const { error } = await supabase
            .from('projects')
            .update({ project_status: 'مؤرشف' }) // Set status to archived as soft delete
            .eq('project_id', id);

        if (error) {
            console.error(`Database Error archiving project ${id}:`, error);
            return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
        }

        revalidatePath("/projects");
        return { success: true, message: "تمت أرشفة المشروع بنجاح" };
    } catch (error) {
        console.error(`Catch Error archiving project ${id}:`, error);
        return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
    }
}
