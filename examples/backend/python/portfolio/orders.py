from pymongo import ReturnDocument
from pymongo.collection import Collection


# #region transition
def finalize_order(orders: Collection, order_id: str) -> str:
    """Moves an order pending -> processing. Returns "won" for the one caller that did it,
    otherwise the status it already had (another request got there first)."""
    # One conditional update: the filter and the change happen as one atomic step on the server.
    won = orders.find_one_and_update(
        {"_id": order_id, "status": "pending"},
        {"$set": {"status": "processing"}},
        return_document=ReturnDocument.AFTER,
    )
    if won is not None:
        return "won"
    current = orders.find_one({"_id": order_id}, {"status": 1})
    if current is None:
        raise LookupError(f"Order {order_id} not found")
    return current["status"]
# #endregion
