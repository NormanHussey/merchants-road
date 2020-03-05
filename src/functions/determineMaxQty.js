export default function determineMaxQty({ price, qty }, { money, maxInventory, inventorySize}) {
    const maxAffordable = Math.floor(money / price);
    const maxAvailableSpace = maxInventory - inventorySize;
    return Math.min(maxAffordable, maxAvailableSpace, qty);
};