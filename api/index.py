from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
async def root():
    return {"message": "Hello World from FastAPI on Vercel!"}

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from the API endpoint!"}

