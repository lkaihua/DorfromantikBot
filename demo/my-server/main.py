from typing import Optional

from fastapi import FastAPI
# from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    'http://127.0.0.1:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

fake_db = {
    "timestamp": 0,
    "tiles": []
}

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/update")
def update_item(timestamp: int, q: Optional[str] = None):
    print(fake_db)
    if timestamp > fake_db["timestamp"]:
        fake_db["timestamp"] = timestamp
        fake_db["tiles"] = q.replace("sea","river").split(',')
    return {"timestamp": fake_db["timestamp"], "tile": fake_db["tiles"]}

@app.get("/read")
def read_item():
    return {"timestamp": fake_db["timestamp"], "tile": fake_db["tiles"]}
