import React, { Component } from 'react';

class Transaction extends Component {
    constructor() {
      super();
      this.state = {
        qty: 0
      };
    }
  
    inputChange = (e) => {
      this.setState({
        qty: parseInt(e.target.value)
      });
    }
  
    handleFormSubmit = (e) => {
      e.preventDefault();
      this.props.transactionClicked(this.state.qty);
    }
  
    render() {
      let priceDisplay = this.props.item.price;
      let ableToSell = true;
      let quantityDisplay = `Max Qty: ${this.props.maxQty}`;
      if (this.props.type === 'Sell') {
        quantityDisplay = `Qty: ${this.props.item.qty}`;
        let found = false;
        this.props.buyer.inventory.forEach((item)=> {
          if (item.type === this.props.item.type) {
            found = true;
            priceDisplay = item.price;
          }
        });
        ableToSell = found;
      }
      
      return(
        <div className="popup transactionScreen">
        { ableToSell ?
          <div>
            <div>
              <h2>{this.props.item.type}</h2>
              <h3>Price: ${priceDisplay}</h3>
              <h4>{quantityDisplay}</h4>
            </div>
            <form onSubmit={ this.handleFormSubmit }>
              <input type="number" onChange={ this.inputChange } min="0" max={this.props.maxQty}/>
              <button type="submit">{this.props.type}</button>
            </form>
          </div>
            : <h3>{this.props.buyer.name} is not buying any {this.props.item.type}.</h3>
          }
            <button onClick={this.props.cancel}>Cancel</button>
        </div>
      );
    }
  }

  export default Transaction;