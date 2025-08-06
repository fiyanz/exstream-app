from pydantic import BaseModel
from typing import List

class WilayahBase(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True 