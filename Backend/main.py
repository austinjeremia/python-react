from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from datetime import date


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Person(BaseModel):
    id: Optional[str]
    name: str
    age: int
    gender: str
    bank_name: str
    ifsc_code: str
    account_number: str
    


MONGODB_URL = "mongodb://localhost:27017/"
MONGODB_DB = "persons"
MONGODB_COLLECTION = "person_details"

client = AsyncIOMotorClient(MONGODB_URL)
db = client[MONGODB_DB]
collection = db[MONGODB_COLLECTION]

@app.post('/addPerson', status_code=201)
async def add_person(person: Person):
    result = await collection.insert_one(person.dict())
    inserted_id = str(result.inserted_id)
    person_dict = person.dict()
    person_dict["id"] = inserted_id
    return person_dict


@app.put("/changePerson/{person_id}", status_code=204)
async def change_person(person_id: str, person: Person):
    result = await collection.update_one({"_id": ObjectId(person_id)}, {"$set": dict(person)})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"Person with id {person_id} does not exist")


@app.get('/person/{p_id}', response_model=Person)
async def get_person(p_id: str):
    person = await collection.find_one({"_id": ObjectId(p_id)})
    if person:
        person["id"] = str(person["_id"])
        return person
    else:
        raise HTTPException(status_code=404, detail=f"Person with id {p_id} not found")

@app.get("/search", response_model=list[Person])
async def search_person(min_age: Optional[int] = None, max_age: Optional[int] = None, name: Optional[str] = None):
    query = {}
    if min_age is not None and max_age is not None:
        query["age"] = {"$gte": min_age, "$lte": max_age}
    elif min_age is not None:
        query["age"] = {"$gte": min_age}
    elif max_age is not None:
        query["age"] = {"$lte": max_age}
    
    cursor = collection.find(query)
    results = await cursor.to_list(length=None)
    
    # Add id field to each person dictionary
    for person in results:
        person["id"] = str(person["_id"])
    
    return results

@app.delete("/delete/{p_id}", status_code=204)
async def delete_person(p_id: str):
    result = await collection.delete_one({"_id": ObjectId(p_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Person with id {p_id} does not exist")
    
    # Return the id of the deleted person
    return {"id": p_id}

@app.get("/search/{bank_name}")
async def find_persons(bank_name: str):
    query = {"bank_name": bank_name}
    cursor = collection.find(query)
    results = await cursor.to_list(length=None)
    for result in results:
        result["_id"] = str(result["_id"])
    return results

