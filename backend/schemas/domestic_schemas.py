from pydantic import BaseModel


class DomesticCostRequest(BaseModel):
    destination: int
    weight: int
    courier: str = "jne:sicepat:ide:sap:jnt:ninja:tiki:lion:anteraja:pos:ncs:rex:rpx:sentral:star:wahana:dse"
    price: str = "lowest"