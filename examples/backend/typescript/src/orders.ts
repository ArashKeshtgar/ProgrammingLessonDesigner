import type { Collection } from 'mongodb';

export interface OrderDoc {
  _id: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
}

// #region transition
// Moves an order pending -> processing. Returns "won" for the one caller that did it,
// otherwise the status it already had (another request got there first).
export async function finalizeOrder(orders: Collection<OrderDoc>, orderId: string): Promise<string> {
  // One conditional update: the filter and the change happen as one atomic step on the server.
  const won = await orders.findOneAndUpdate(
    { _id: orderId, status: 'pending' },
    { $set: { status: 'processing' } },
    { returnDocument: 'after' },
  );
  if (won) return 'won';
  const current = await orders.findOne({ _id: orderId }, { projection: { status: 1 } });
  if (!current) throw new Error(`Order ${orderId} not found`);
  return current.status;
}
// #endregion
