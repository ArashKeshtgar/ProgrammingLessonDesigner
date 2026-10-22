package portfolio;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.FindOneAndUpdateOptions;
import com.mongodb.client.model.Projections;
import com.mongodb.client.model.ReturnDocument;
import java.util.NoSuchElementException;
import org.bson.Document;

public final class Orders {
    private Orders() {}

    // #region transition
    // Moves an order pending -> processing. Returns "won" for the one caller that did it,
    // otherwise the status it already had (another request got there first).
    public static String finalizeOrder(MongoCollection<Document> orders, String orderId) {
        // One conditional update: the filter and the change happen as one atomic step on the server.
        var won = orders.findOneAndUpdate(
                and(eq("_id", orderId), eq("status", "pending")),
                set("status", "processing"),
                new FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER));
        if (won != null) return "won";
        var current = orders.find(eq("_id", orderId)).projection(Projections.include("status")).first();
        if (current == null) throw new NoSuchElementException("Order " + orderId + " not found");
        return current.getString("status");
    }
    // #endregion
}
