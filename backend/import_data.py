import os
import csv
import re
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("ERROR: SUPABASE_URL or SUPABASE_KEY not set in .env")
    exit(1)

supabase = create_client(url, key)

def parse_number(value):
    """Parse Arabic-formatted numbers like '1٬420٬000' or '6٫00'"""
    if not value or value.strip() == '':
        return None
    # Replace Arabic thousands separator and decimal
    value = value.replace('٬', '').replace('٫', '.').replace(',', '')
    try:
        return float(value)
    except ValueError:
        return None

def parse_int(value):
    num = parse_number(value)
    return int(num) if num is not None else None

csv_path = "/Users/mac/Desktop/Sales assistant/_عقارات رداح - نصل - المشاريع.csv"

# Column mapping: CSV Arabic name -> DB column name
column_map = {
    'معرف المشروع': 'source_project_id',
    'كود المشروع': 'project_code',
    'المالك': 'owner',
    'رقم المشروع': 'project_number',
    'المشروع': 'project_name',
    'حالة المشروع': 'status',
    'نوع المشروع': 'project_type',
    'انواع الوحدات': 'unit_types',
    'موعد إفتتاح المشروع': 'launch_date',
    'الموقع': 'location_link',
    'الإتجاه': 'zone',
    'الدولة': 'country',
    'المدينة': 'city',
    'الحي': 'district',
    'بروشور المشروع': 'brochure_link',
    'فيديوهات المشروع': 'video_link',
    'صور المشروع': 'images_link',
    'المرافق': 'amenities',
    'عدد الوحدات': 'total_units',
    'عدد الوحدات المتاحة': 'available_units',
    'عدد الوحدات تحت الإنشاء': 'under_construction_units',
    'عدد الوحدات المحجوزة': 'reserved_units',
    'عدد الوحدات المباعة': 'sold_units',
    'متوسط قيمة الوحدة': 'avg_unit_price',
    'متوسط قيمة الوحدات المتاحة': 'avg_available_unit_price',
    'إجمالي قيمة المشروع': 'total_project_value',
    'نسبة بيع المشروع': 'sales_percentage',
    'السعر الأدنى': 'min_price',
    'السعر الأدنى المتاح': 'min_price_available',
    'السعر الأقصى': 'max_price',
    'السعر الأقصى المتاح': 'max_price_available',
    'نطاق السعر': 'price_range',
    'نطاق السعر المتاح': 'price_range_available',
    'المساحة الأدنى': 'min_area',
    'المساحة الأدنى المتاحة': 'min_area_available',
    'المساحة الأقصى': 'max_area',
    'المساحة الأقصى المتاحة': 'max_area_available',
    'عدد ادنى غرف نوم': 'min_bedrooms',
    'عدد اقصى غرف نوم': 'max_bedrooms',
    'عدد ادنى حمامات ': 'min_bathrooms',
    'عدد اقصى حمامات': 'max_bathrooms',
}

# Numeric columns
numeric_cols = ['source_project_id', 'project_number', 'total_units', 'available_units', 
                'under_construction_units', 'reserved_units', 'sold_units',
                'avg_unit_price', 'avg_available_unit_price', 'total_project_value',
                'min_price', 'min_price_available', 'max_price', 'max_price_available',
                'min_area', 'min_area_available', 'max_area', 'max_area_available',
                'min_bedrooms', 'max_bedrooms', 'min_bathrooms', 'max_bathrooms']

int_cols = ['source_project_id', 'total_units', 'available_units', 
            'under_construction_units', 'reserved_units', 'sold_units',
            'min_bedrooms', 'max_bedrooms', 'min_bathrooms', 'max_bathrooms']

rows_to_insert = []

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        db_row = {}
        for csv_col, db_col in column_map.items():
            value = row.get(csv_col, '').strip()
            
            if db_col in numeric_cols:
                if db_col in int_cols:
                    db_row[db_col] = parse_int(value)
                else:
                    db_row[db_col] = parse_number(value)
            else:
                db_row[db_col] = value if value else None
        
        # Handle sales_percentage separately (remove % sign)
        sp = row.get('نسبة بيع المشروع', '').replace('%', '').strip()
        db_row['sales_percentage'] = parse_number(sp)
        
        rows_to_insert.append(db_row)

print(f"Found {len(rows_to_insert)} projects to insert.")

# Insert into Supabase
try:
    response = supabase.table("projects").insert(rows_to_insert).execute()
    print(f"SUCCESS: Inserted {len(response.data)} projects into Supabase!")
except Exception as e:
    print(f"ERROR: {e}")
