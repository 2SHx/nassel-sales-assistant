-- Create the projects table with all columns from Excel
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_project_id BIGINT, -- معرف المشروع
    project_code TEXT, -- كود المشروع
    owner TEXT, -- المالك
    project_number NUMERIC, -- رقم المشروع
    project_name TEXT NOT NULL, -- المشروع
    status TEXT NOT NULL, -- حالة المشروع
    project_type TEXT, -- نوع المشروع
    unit_types TEXT, -- انواع الوحدات
    launch_date TEXT, -- موعد إفتتاح المشروع
    location_link TEXT, -- الموقع
    zone TEXT NOT NULL, -- الإتجاه
    country TEXT, -- الدولة
    city TEXT, -- المدينة
    district TEXT NOT NULL, -- الحي
    brochure_link TEXT, -- بروشور المشروع
    video_link TEXT, -- فيديوهات المشروع
    images_link TEXT, -- صور المشروع
    amenities TEXT, -- المرافق
    
    -- Unit Counts
    total_units INTEGER, -- عدد الوحدات
    available_units INTEGER NOT NULL, -- عدد الوحدات المتاحة
    under_construction_units INTEGER, -- عدد الوحدات تحت الإنشاء
    reserved_units INTEGER, -- عدد الوحدات المحجوزة
    sold_units INTEGER, -- عدد الوحدات المباعة
    
    -- Values
    avg_unit_price NUMERIC, -- متوسط قيمة الوحدة
    avg_available_unit_price NUMERIC, -- متوسط قيمة الوحدات المتاحة
    total_project_value NUMERIC, -- إجمالي قيمة المشروع
    sales_percentage NUMERIC, -- نسبة بيع المشروع
    
    -- Price Ranges
    min_price NUMERIC, -- السعر الأدنى
    min_price_available NUMERIC NOT NULL, -- السعر الأدنى المتاح
    max_price NUMERIC, -- السعر الأقصى
    max_price_available NUMERIC, -- السعر الأقصى المتاح
    price_range TEXT, -- نطاق السعر
    price_range_available TEXT, -- نطاق السعر المتاح
    
    -- Area Ranges
    min_area NUMERIC, -- المساحة الأدنى
    min_area_available NUMERIC, -- المساحة الأدنى المتاحة
    max_area NUMERIC, -- المساحة الأقصى
    max_area_available NUMERIC, -- المساحة الأقصى المتاحة
    
    -- Room Counts
    min_bedrooms INTEGER, -- عدد ادنى غرف نوم
    max_bedrooms INTEGER, -- عدد اقصى غرف نوم
    min_bathrooms INTEGER, -- عدد ادنى حمامات
    max_bathrooms INTEGER, -- عدد اقصى حمامات
    
    -- Extra
    marketing_pitch TEXT -- Optional override
);

-- Create indexes for performance
CREATE INDEX idx_projects_zone ON projects (zone);
CREATE INDEX idx_projects_min_price ON projects (min_price_available);
CREATE INDEX idx_projects_district ON projects (district);
