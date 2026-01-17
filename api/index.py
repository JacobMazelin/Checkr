from fastapi import FastAPI

# Create FastAPI instance with custom docs
app = FastAPI(docs_url="/api/py/docs")


@app.get("/api/hello")
async def hello_world():
    return {"message": "Hello, World!"}

