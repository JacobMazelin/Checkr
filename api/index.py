from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get base URL from environment or use default
BASE_URL = os.getenv("NEXTAUTH_URL", "http://localhost:3000")
CALENDAR_API = f"{BASE_URL}/api/calendar"
SEARCH_API = f"{BASE_URL}/api/search"

# Request models
class FindFreeTimesRequest(BaseModel):
    phone_number: str

class CreateEventRequest(BaseModel):
    phone_number: str
    date: str
    time: str

class SendConfirmationRequest(BaseModel):
    phone_number: str
    date: str
    time: str

class SearchRequest(BaseModel):
    query: str

@app.get("/api")
async def root():
    return {"message": "Calendar API Bridge - Use /api/calendar/* endpoints"}

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from the API endpoint!"}

@app.post("/api/calendar/find-free-times")
async def find_free_times(request: FindFreeTimesRequest):
    """Find available time slots for the next 7 days"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CALENDAR_API}/find-free-times",
                json={"phone_number": request.phone_number},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Calendar API error: {str(e)}")

@app.post("/api/calendar/create-event")
async def create_event(request: CreateEventRequest):
    """Create a new therapy session event"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CALENDAR_API}/create-event",
                json={
                    "phone_number": request.phone_number,
                    "date": request.date,
                    "time": request.time
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Calendar API error: {str(e)}")

@app.post("/api/calendar/send-confirmation")
async def send_confirmation(request: SendConfirmationRequest):
    """Generate confirmation message for scheduled session"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CALENDAR_API}/send-confirmation",
                json={
                    "phone_number": request.phone_number,
                    "date": request.date,
                    "time": request.time
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Calendar API error: {str(e)}")

@app.post("/api/search/image")
async def search_image(request: SearchRequest):
    """Search for images using Brave Image Search"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SEARCH_API}/image",
                json={"query": request.query},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Search API error: {str(e)}")

@app.post("/api/search/web-image")
async def search_web_image(request: SearchRequest):
    """Search for images and web results combined"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SEARCH_API}/web-image",
                json={"query": request.query},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Search API error: {str(e)}")

