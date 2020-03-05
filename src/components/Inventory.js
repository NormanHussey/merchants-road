import React, { Component } from 'react';

import InventoryItem from './InventoryItem';

class Inventory extends Component {
    render() {
        const owner = this.props.owner;
        return(
            <div className = "ornateContainer inventory">
            <h3>{owner.name}</h3>
            { owner.maxInventory ? <h4>{owner.inventorySize} / {owner.maxInventory}</h4> : null}
            {
              owner.inventory.map((item, index) => {
                if (item.type !== "empty") {
                  return(
                    <InventoryItem item={item} key={index} clickFunction={(item) => { this.props.clickFunction(owner, item) }}/>
                  );
                } else {
                  return false;
                }
              })
            }
          </div>
        );
    }
}

export default Inventory;