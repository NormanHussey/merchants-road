import React, { Component } from 'react';

import InventoryItem from './InventoryItem';

class Inventory extends Component {
    render() {
        const owner = this.props.owner;
        const sortedInventory = [...owner.inventory];
        sortedInventory.sort((a, b) => {
          const itemA = a.type;
          const itemB = b.type;
          let comparison = 0;
          if (itemA > itemB) {
            comparison = 1;
          } else if (itemA < itemB) {
            comparison = -1;
          }
          return comparison;
        });
        return(
            <div className = "ornateContainer inventory">
            <h3>{owner.name}</h3>
            { owner.maxInventory ? <h4>{owner.inventorySize} / {owner.maxInventory}</h4> : null}
            {
              sortedInventory.map((item, index) => {
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