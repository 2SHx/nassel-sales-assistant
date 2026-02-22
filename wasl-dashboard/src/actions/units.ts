"use server";

import { revalidatePath } from "next/cache";
import { unitPayloadSchema, type UnitPayload } from "@/lib/validations/unit";
import { supabase } from "@/lib/supabase";

export async function createUnitAction(data: UnitPayload) {
    try {
        const parsedData = unitPayloadSchema.safeParse(data);
        if (!parsedData.success) {
            return { success: false, error: parsedData.error.flatten().fieldErrors };
        }

        const payload = parsedData.data;

        // Map payload to DB schema (camelCase -> snake_case)
        const unitData = {
            project_id: payload.projectId,
            project_code: payload.projectCode || null,
            project_name: payload.projectName || null,
            project_number: payload.projectNumber || null,
            unit_code: payload.unitCode,
            unit_type_code: payload.unitTypeCode || null,
            unit_model: payload.unitModel,
            developer: payload.developer,
            unit_status: payload.status === 'Available' ? 'متاح' : payload.status === 'Sold' ? 'مباع' : payload.status === 'Under Construction' ? 'تحت الإنشاء' : 'محجوز', // Mapping enum back to Arabic DB value
            unit_type: payload.type,
            floor: payload.floor ? Number(payload.floor) : null,
            elevator_status: payload.elevatorStatus === 'يوجد' || payload.elevatorStatus === 'true' ? true : false,
            unit_area: payload.netArea || 0,
            special_area: payload.privateArea || 0,
            total_area: payload.totalArea || 0,
            total_price: payload.price,
            bedrooms: payload.bedrooms || 0,
            bathrooms: payload.bathrooms || 0,
            unit_components: payload.components ? payload.components.join(',') : null,
            features: payload.amenities ? payload.amenities.join(',') : null,

            country: payload.country || null,
            city: payload.city || null,
            district: payload.district || null,
            location: payload.location || null,
            direction: payload.direction || payload.facade || null,

            project_opening_date: payload.projectOpeningDate || null,
            unit_number_in_project: payload.unitNumber || null,
            building_number: payload.buildingNumber || null,
            unit_number_in_sorting: payload.farzNumber || null,
            yard_area: payload.patioArea || 0,
            dead_area: payload.titleDeedArea || 0,

            project_brochure: payload.projectBrochure || null,
            unit_brochure: payload.brochureUrl || null,
        };

        const { error } = await supabase
            .from('units')
            .insert(unitData);

        if (error) {
            console.error("Database Error creating unit:", error);
            // Catch Foreign Key constraint
            if (error.code === '23503') {
                return { success: false, error: "حدث خطأ: تأكد من أن المشروع المختار موجود فعلياً." };
            }
            return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
        }

        revalidatePath("/units");
        revalidatePath(`/projects/${payload.projectId}`);
        return { success: true, message: "تمت إضافة الوحدة بنجاح" };
    } catch (error) {
        console.error("Catch Error creating unit:", error);
        return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
    }
}

export async function updateUnitAction(id: string, data: UnitPayload) {
    try {
        const parsedData = unitPayloadSchema.safeParse(data);
        if (!parsedData.success) {
            return { success: false, error: parsedData.error.flatten().fieldErrors };
        }

        const payload = parsedData.data;

        // Map payload to DB schema
        const unitData = {
            project_id: payload.projectId,
            project_code: payload.projectCode || null,
            project_name: payload.projectName || null,
            project_number: payload.projectNumber || null,
            unit_code: payload.unitCode,
            unit_type_code: payload.unitTypeCode || null,
            unit_model: payload.unitModel,
            developer: payload.developer,
            unit_status: payload.status === 'Available' ? 'متاح' : payload.status === 'Sold' ? 'مباع' : payload.status === 'Under Construction' ? 'تحت الإنشاء' : 'محجوز',
            unit_type: payload.type,
            floor: payload.floor ? Number(payload.floor) : null,
            elevator_status: payload.elevatorStatus === 'يوجد' || payload.elevatorStatus === 'true' ? true : false,
            unit_area: payload.netArea || 0,
            special_area: payload.privateArea || 0,
            total_area: payload.totalArea || 0,
            total_price: payload.price,
            bedrooms: payload.bedrooms || 0,
            bathrooms: payload.bathrooms || 0,
            unit_components: payload.components ? payload.components.join(',') : null,
            features: payload.amenities ? payload.amenities.join(',') : null,

            country: payload.country || null,
            city: payload.city || null,
            district: payload.district || null,
            location: payload.location || null,
            direction: payload.direction || payload.facade || null,

            project_opening_date: payload.projectOpeningDate || null,
            unit_number_in_project: payload.unitNumber || null,
            building_number: payload.buildingNumber || null,
            unit_number_in_sorting: payload.farzNumber || null,
            yard_area: payload.patioArea || 0,
            dead_area: payload.titleDeedArea || 0,

            project_brochure: payload.projectBrochure || null,
            unit_brochure: payload.brochureUrl || null,
        };

        const { error } = await supabase
            .from('units')
            .update(unitData)
            .eq('id', id);

        if (error) {
            console.error(`Database Error updating unit ${id}:`, error);
            if (error.code === '23503') {
                return { success: false, error: "حدث خطأ: تأكد من أن المشروع المختار موجود فعلياً." };
            }
            return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
        }

        revalidatePath("/units");
        revalidatePath(`/units/${id}`);
        revalidatePath(`/projects/${payload.projectId}`);
        return { success: true, message: "تم تعديل الوحدة بنجاح" };
    } catch (error) {
        console.error(`Catch Error updating unit ${id}:`, error);
        return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
    }
}

export async function archiveUnitAction(id: string) {
    try {
        const { error } = await supabase
            .from('units')
            .update({ unit_status: 'مؤرشف' }) // Soft delete
            .eq('id', id);

        if (error) {
            console.error(`Database Error archiving unit ${id}:`, error);
            return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
        }

        revalidatePath("/units");
        return { success: true, message: "تمت أرشفة الوحدة بنجاح" };
    } catch (error) {
        console.error(`Catch Error archiving unit ${id}:`, error);
        return { success: false, error: "حدث خطأ أثناء حفظ البيانات. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى." };
    }
}
