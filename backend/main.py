import os
from typing import Optional, List, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase Client
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not set. Database calls will fail.")
    supabase: Client = None
else:
    supabase: Client = create_client(url, key)

app = FastAPI(title="Real Estate Matchmaker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class SearchCriteria(BaseModel):
    zone: str
    budget: float
    district: Optional[str] = None
    unit_type: Optional[str] = None
    min_area: Optional[float] = None
    city: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    project_name: str
    zone: str
    district: str
    status: str
    min_price_available: float
    available_units: int
    
    # Extended Fields
    amenities: Optional[str] = None
    location_link: Optional[str] = None
    brochure_link: Optional[str] = None
    project_type: Optional[str] = None
    unit_types: Optional[str] = None
    max_price_available: Optional[float] = None
    min_area_available: Optional[float] = None
    max_area_available: Optional[float] = None
    min_bedrooms: Optional[int] = None
    max_bedrooms: Optional[int] = None
    
    marketing_pitch: Optional[str] = None
    match_score: int
    sales_script: str

@app.post("/search", response_model=List[ProjectResponse])
def search_projects(criteria: SearchCriteria):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database configuration missing.")

    # Base Query
    query = supabase.table("projects").select("*").eq("zone", criteria.zone).gt("available_units", 0)
    
    # 0. City Filter
    if criteria.city:
        query = query.eq("city", criteria.city)

    # 1. Smart Budget Filtering (Allow +20% stretch)
    max_budget = criteria.budget * 1.20
    query = query.lte("min_price_available", max_budget)
    
    # 2. Strict Unit Type Filter (if provided)
    if criteria.unit_type and criteria.unit_type != "":
        query = query.ilike("unit_types", f"%{criteria.unit_type}%")

    # 3. Area Filter (if provided)
    if criteria.min_area:
        query = query.gte("max_area_available", criteria.min_area)

    try:
        response = query.execute()
        candidates = response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

    if not candidates:
        return []

    ranked_projects = []

    # Step B: Advanced Weighted Scoring Algorithm
    for project in candidates:
        score = 0
        
        # 1. Budget Score (Max 40 points)
        # We calculate how "good" the price is relative to budget.
        # If perfectly within budget = 40.
        # If slightly over, score decays proportionally.
        project_price = float(project.get("min_price_available") or 0)
        target_budget = criteria.budget
        
        if project_price <= target_budget:
            score += 40
        else:
            # Decay: If price is 20% higher (1.2x), score drops.
            # 1.0M budget, 1.2M price -> ratio 0.83 -> score 33.
            ratio = target_budget / project_price
            score += 40 * ratio

        # 2. Location & District Score (Max 30 points)
        # Since we pre-filter by Zone/City in SQL, we give base points.
        # Bonus points if the specific 'district' text matches.
        score += 15 # Base score for being in the right Zone/City
        
        if criteria.district and project.get("district"):
            # Fuzzy match check
            if criteria.district in project["district"] or project["district"] in criteria.district:
                score += 15 # Full 30 points for location

        # 3. Area Match Score (Max 20 points)
        min_area = float(project.get("min_area_available") or 0)
        target_area = criteria.min_area or 0
        
        if target_area > 0:
            if min_area >= target_area:
                score += 20
            else:
                # Proportional decay: 80% of area = 80% of points
                area_ratio = min_area / target_area
                score += 20 * area_ratio
        else:
            # If no specific area requested, give full points to not penalize
            score += 20

        # 4. Unit Type Match (Max 10 points)
        # Check if the requested unit type exists in this project
        if criteria.unit_type:
             if criteria.unit_type in str(project.get("unit_types", "")):
                 score += 10
        else:
             score += 10 # No specific unit type preference = Full points

        # Final Score Calculation
        final_score = int(min(score, 100))

        # Step C: Generate "Sales Script" in Arabic
        formatted_price = "{:,.0f}".format(project_price)
        project_name = project.get("project_name")
        zone = project.get("zone")
        
        script = f"بناءً على طلبك في {zone}، أرشح لك '{project_name}'. "
        
        if criteria.unit_type:
            script += f"يتوفر لديهم {criteria.unit_type} بمساحات تبدأ من {project.get('min_area_available')}م². "
        
        script += f"السعر يبدأ من {formatted_price} ريال. "
        
        if project_price > criteria.budget:
            script += "مشروع مميز يستحق الاستثمار بزيادة بسيطة عن الميزانية."
        elif final_score >= 80:
             script += "هذا العرض يطابق معاييرك بشكل ممتاز!"

        ranked_projects.append({
            **project,
            "match_score": final_score,
            "sales_script": script
        })

    ranked_projects.sort(key=lambda x: x["match_score"], reverse=True)
    
    return ranked_projects[:6]

@app.get("/districts", response_model=List[str])
def get_districts(zone: Optional[str] = None, city: Optional[str] = None):
    query = supabase.table("projects").select("district")
    
    if city:
        query = query.eq("city", city)
    if zone:
        query = query.eq("zone", zone)
        
    try:
        res = query.execute()
        districts = set(item['district'] for item in res.data if item.get('district'))
        return sorted(list(districts))
    except Exception as e:
        print(f"Error fetching districts: {e}")
        return []

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Real Estate Matchmaker API is running"}
