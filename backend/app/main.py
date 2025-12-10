import os
import base64
import json
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

# --- 1. CONFIGURATION ---
# PASTE YOUR KEY HERE FOR THE DEMO
api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    raise RuntimeError("Missing required environment variable: GOOGLE_API_KEY")

app = FastAPI()

# In-memory storage for designs (for demo purposes)
designs = {}

# Allow your Expo app (phone) to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=api_key)

# Define the structure for the furniture list
class InventoryItem(BaseModel):
    item_name: str
    category: str
    visual_description: str
    estimated_price_php: int 

class InstallmentApplication(BaseModel):
    designId: str
    items: List[dict]
    downPayment: int
    installmentMonths: int
    monthlyPayment: int
    totalAmount: int

@app.get("/")
def health_check():
    return {"status": "online", "message": "HomeVision Brain is Active"}

@app.post("/renovate")
async def renovate(file: UploadFile = File(...), style: str = Form("Modern")):
    print(f"🚀 [Step 1] User requested '{style}' renovation...")
    
    # Read image from phone
    user_image_bytes = await file.read()

    # --- PHASE A: THE PAINTER (Generate the Renovation) ---
    paint_prompt = f"""
    Renovate this room in a '{style}' style.
    CRITICAL: Keep the structural elements (walls, windows, doors, ceiling) EXACTLY as they are.
    Replace furniture and decor to match the style. 
    Output a photorealistic image.
    """

    try:
        paint_response = client.models.generate_content(
            model="gemini-2.5-flash-image", # The Fast, Stable Model
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=paint_prompt),
                        types.Part.from_bytes(data=user_image_bytes, mime_type="image/jpeg")
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"], 
                temperature=0.0
            )
        )
        
        # Extract Image
        generated_image_bytes = None
        for part in paint_response.candidates[0].content.parts:
            if part.inline_data:
                generated_image_bytes = part.inline_data.data
                break
        
        if not generated_image_bytes:
            raise ValueError("AI did not return an image.")
            
        print("✅ [Step 1] Renovation Complete. Starting Analysis...")

        # --- PHASE B: THE OBSERVER (Extract Furniture JSON) ---
        observer_prompt = """
        Analyze this renovated room.
        List the 3-5 major NEW items visible.
        For each, provide:
        - Name
        - Category
        - Visual Description
        - Estimated Price in PHP (Philippine Peso)
        """

        analysis_response = client.models.generate_content(
            model="gemini-2.5-flash", # The Multimodal Vision Model
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=observer_prompt),
                        types.Part.from_bytes(data=generated_image_bytes, mime_type="image/png")
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[InventoryItem]
            )
        )

        # Parse Data
        furniture_json = json.loads(analysis_response.candidates[0].content.parts[0].text)
        print(f"✅ [Step 2] Analysis Complete. Found {len(furniture_json)} items.")

        # Prepare Response (Base64 Image + JSON)
        b64_image = base64.b64encode(generated_image_bytes).decode("utf-8")
        
        # Store in memory
        design_id = str(uuid.uuid4())
        designs[design_id] = {
            "image": f"data:image/png;base64,{b64_image}",
            "inventory": furniture_json
        }

        return {"designId": design_id}

    except Exception as e:
        print(f"❌ Error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/design-results/{design_id}")
async def get_design_results(design_id: str):
    if design_id not in designs:
        raise HTTPException(status_code=404, detail="Design not found")
    return designs[design_id]

@app.get("/installment-items/{design_id}")
async def get_installment_items(design_id: str):
    if design_id not in designs:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Return items in the format expected by the installation page
    # The installation page expects { items: [{ id, name, price, image, specs?, description? }] }
    inventory = designs[design_id]["inventory"]
    
    # Map inventory to the expected format
    items = []
    for idx, item in enumerate(inventory):
        items.append({
            "id": str(idx),
            "name": item["item_name"],
            "price": item["estimated_price_php"],
            "description": item["visual_description"],
            "category": item["category"],
            # Since we don't have individual images, we can use a placeholder or the main design image
            "image": "https://placehold.co/400x400/png?text=Furniture" 
        })
        
    return {"items": items}

@app.post("/installment-items/apply")
async def apply_installment(application: InstallmentApplication):
    print(f"📝 Received installment application for Design {application.designId}")
    print(f"   Items: {len(application.items)}")
    print(f"   Down Payment: {application.downPayment}")
    print(f"   Monthly: {application.monthlyPayment} for {application.installmentMonths} months")
    print(f"   Total Amount: {application.totalAmount}")
    
    # In a real app, you would save this to a database
    return {"status": "success", "message": "Application received"}