using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace Portfolio;

public class OrderDoc
{
    [BsonId] public string Id { get; set; } = "";
    [BsonElement("status")] public string Status { get; set; } = "pending";
}

public static class Orders
{
    // #region transition
    // Moves an order pending -> processing. Returns "won" for the one caller that did it,
    // otherwise the status it already had (another request got there first).
    public static async Task<string> FinalizeOrderAsync(IMongoCollection<OrderDoc> orders, string orderId)
    {
        // One conditional update: the filter and the change happen as one atomic step on the server.
        var won = await orders.FindOneAndUpdateAsync(
            o => o.Id == orderId && o.Status == "pending",
            Builders<OrderDoc>.Update.Set(o => o.Status, "processing"),
            new FindOneAndUpdateOptions<OrderDoc> { ReturnDocument = ReturnDocument.After });
        if (won is not null) return "won";
        var current = await orders.Find(o => o.Id == orderId).FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"Order {orderId} not found");
        return current.Status;
    }
    // #endregion
}
