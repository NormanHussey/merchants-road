import React, { Component } from 'react';

class InventoryItem extends Component {
    render() {
        const item = this.props.item;
        return(
            <div className="inventoryItem" tabIndex="0" onClick={() => { this.props.clickFunction(item) }}>
            <p>{item.type}</p>
            <p>Qty: {item.qty}</p>
            <p><span className="moneySymbol">$</span>{item.price}</p>
            </div>
        );
    }
}

export default InventoryItem;