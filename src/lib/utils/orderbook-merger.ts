import { OrderLevel, OrderBookData, IncrementalUpdate } from "../types/orderbook";

export function mergeOrderBookUpdate( currentOrderbook :  OrderBookData,
    updates :  IncrementalUpdate) : OrderBookData{

        if (!currentOrderbook || !updates.isIncremental) {
            const asks = updates.askUpdates || [];
            const bids = updates.bidUpdates || [];
            const bestAsk = asks[0]?.price || 0;
            const bestBid = bids[0]?.price || 0;
            const spread = bestAsk - bestBid;
            const spreadPercent = spread / bestAsk;
            
            return {
                symbol: currentOrderbook?.symbol || 'UNKNOWN',
                asks,
                bids,
                spread,
                spreadPercent,
                lastUpdate: updates.lastUpdate || Date.now(),
            };
        }

        //  Merge asks 
  let mergedAsks = [...currentOrderbook.asks];
  if (updates.askUpdates) {
      updates.askUpdates.forEach(update => {
      const existingIndex = mergedAsks.findIndex(ask => ask.price === update.price);
      
      if (update.quantity === 0) {
        // Remove price level if quantity = 0
        if (existingIndex !== -1) {
          mergedAsks.splice(existingIndex, 1);
        }
      } else if (existingIndex !== -1) {
        // Update existing price level
        mergedAsks[existingIndex] = update;
      } else {
        // Add new price level
        mergedAsks.push(update);
      }
    });
  }

   // Merge bids 
   let mergedBids = [...currentOrderbook.bids];
   if (updates.bidUpdates) {
     updates.bidUpdates.forEach(update => {
       const existingIndex = mergedBids.findIndex(bid => bid.price === update.price);
       
       if (update.quantity === 0) {
         // Remove price level if quantity is 0
         if (existingIndex !== -1) {
           mergedBids.splice(existingIndex, 1);
         }
       } else if (existingIndex !== -1) {
         // Update existing price level
         mergedBids[existingIndex] = update;
       } else {
         // Add new price level
         mergedBids.push(update);
       }
     });
   }
 


  mergedAsks.sort((a, b) => a.price - b.price); 
  mergedBids.sort((a, b) => b.price - a.price);

  // Limit to 15 levels each
  mergedAsks = mergedAsks.slice(0, 15);
  mergedBids = mergedBids.slice(0, 15);

   // Calculate new spread
  const bestAsk = mergedAsks[0]?.price || 0;
  const bestBid = mergedBids[0]?.price || 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = spread / bestAsk;

  return {
    ...currentOrderbook,
    asks: mergedAsks,
    bids: mergedBids,
    spread,
    spreadPercent,
    lastUpdate: updates.lastUpdate || currentOrderbook.lastUpdate,
  };
   
}