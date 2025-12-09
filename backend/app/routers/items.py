from fastapi import APIRouter, Depends, HTTPException
from ..dependencies import get_token_header

router = APIRouter(
    prefix="/items",
    tags=["items"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def read_items():
    return [{"name": "Item Foo"}, {"name": "Item Bar"}]

@router.get("/{item_id}")
async def read_item(item_id: str):
    return {"name": "Item Foo", "item_id": item_id}
