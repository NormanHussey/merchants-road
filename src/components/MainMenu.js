import React, { Component } from 'react';

import ChooseCountry from './ChooseCountry';
import getRandomIntInRange, { getRandomFloatInRange } from '../functions/randomizers';
import removeFromArray from '../functions/removeFromArray';

class MainMenu extends Component {
    constructor() {
        super();
        this.state = {
            player: {},
            startNewGame: false,
            quitGame: false,
            chooseNewCountry: false,
            upgradeScreen: false,
            bankScreen: false,
            depositScreen: false,
            withdrawScreen: false,
            ledgerScreen: false,
            moneyAmount: 0,
            bankIndex: 0,
            accountBalance: 0,
            interestRate: 0,
            maxLoanAmount: 0,
            lastVisit: 0,
            properties: [],
            propertyScreen: false,
            localProperty: {},
            localPropertyOwned: false,
            propertyIndex: 0,
            collectingScreen: false,
            collectAmount: 0,
            showBankLedger: true,
            showPropertyLedger: false,
            addedInventoryCost: 10000
        }
    }

    componentDidMount() {
        const player = {...this.props.player};
        const properties = this.props.properties;
        let bankFound = false;
        let accountBalance = 0;
        let interestRate = 0;
        let maxLoanAmount = 0;
        player.banks.forEach((town, index) => {
            if (town.name !== "empty") {
                const interestAccrued = Math.round((town.balance * town.interestRate * (player.day - town.lastVisit)));
                town.balance += interestAccrued;
                town.lastVisit = player.day;
                if (town.name === player.location) {
                    maxLoanAmount = town.maxLoanAmount;
                    accountBalance = town.balance;
                    interestRate = town.interestRate;
                    bankFound = index;
                }
            }
        });

        if (!bankFound) {
            const unRoundedInterestRate = getRandomFloatInRange(0.001, 0.015);
            interestRate = Math.round((unRoundedInterestRate + Number.EPSILON) * 1000) / 1000;
            maxLoanAmount = getRandomIntInRange(1000, 10000);
            player.banks.push({
                name: player.location,
                balance: accountBalance, 
                interestRate: interestRate,
                maxLoanAmount: maxLoanAmount,
                lastVisit: player.day
            });
            bankFound = player.banks.length - 1;
        }

        let localPropertyOwned = false;
        let propertyFound = false;
        let localProperty = {};
        player.properties.forEach((property, index) => {
            if (property.town !== "empty") {
                if (property.owned) {
                    property.qty += (player.day - property.lastVisit) * property.production;
                    property.lastVisit = player.day;
                }
                if (property.town === player.location) {
                    propertyFound = index;
                    localPropertyOwned = property.owned;
                    localProperty = property;
                }
            }
        });

        if (!propertyFound) {
            this.props.properties.forEach((property) => {
                if (property.town === player.location) {
                    localProperty = property;
                    localProperty.lastVisit = player.day;
                }
            });
            player.properties.push(localProperty);
            propertyFound = player.properties.length - 1;
        }

        this.props.updatePlayer(player);

        const addedInventoryCost = (player.maxInventory * 0.1) * 1000;

        this.setState({
            properties: properties,
            bankIndex: bankFound,
            accountBalance: accountBalance,
            interestRate: interestRate,
            maxLoanAmount: maxLoanAmount,
            lastVisit: player.day,
            player: player,
            localProperty: localProperty,
            propertyIndex: propertyFound,
            localPropertyOwned: localPropertyOwned,
            addedInventoryCost: addedInventoryCost
        });
    }

    confirmNewGame = () => {
        this.setState({
          menuOpen: false,
          startNewGame: !this.state.startNewGame
        });
      }

    chooseNewCountry = () => {
        this.setState({
          chooseNewCountry: true,
          startNewGame: false,
          quitGame: false
        });
      }

    confirmQuit = () => {
        this.setState({
          quitGame: !this.state.quitGame
        });
      }

    closeMenu = () => {
        this.setState({
            chooseNewCountry: false,
            startNewGame: false,
            quitGame: false,
            upgradeScreen: false,
            bankScreen: false,
            depositScreen: false,
            withdrawScreen: false,
            propertyScreen: false
        },
            this.props.close
        );
    }

    closeCountryMenu = (countryChoice) => {
        this.closeMenu();
        this.props.beginGame(countryChoice);
    }

    toggleUpgradeScreen = () => {
        this.setState({
            upgradeScreen: !this.state.upgradeScreen
        });
    }

    addInventorySlots = () => {
        const player = {...this.state.player};
        player.money -= this.state.addedInventoryCost;
        player.maxInventory += 10;
        this.props.updatePlayer(player);
        this.setState({
            player: player
        });
    }

    hireArmedGuard = () => {
        const player = {...this.state.player};
        player.money -= 5000;
        player.armedGuards++;
        player.travelCost = 25 * (player.armedGuards + 1);
        this.props.updatePlayer(player);
        this.setState({
            player: player
        });
    }

    fireArmedGuard = () => {
        const player = {...this.state.player};
        player.armedGuards--;
        player.travelCost = 25 * (player.armedGuards + 1);
        this.props.updatePlayer(player);
        this.setState({
            player: player
        });
    }

    toggleBankScreen = () => {
        this.setState({
            bankScreen: !this.state.bankScreen
        });
    }

    toggleDepositScreen = () => {
        this.setState({
            depositScreen: !this.state.depositScreen,
        });
    }

    toggleWithdrawScreen = () => {
        this.setState({
            withdrawScreen: !this.state.withdrawScreen
        });
    }

    toggleLedgerScreen = () => {
        this.setState({
            ledgerScreen: !this.state.ledgerScreen
        });
    }

    togglePropertyScreen = () => {
        this.setState({
            propertyScreen: !this.state.propertyScreen
        });
    }

    showBankLedger = () => {
        this.setState({
            showBankLedger: true,
            showPropertyLedger: false
        });
    }

    showPropertyLedger = () => {
        this.setState({
            showBankLedger: false,
            showPropertyLedger: true
        });
    }

    moneyInput = (e) => {
        this.setState({
            moneyAmount: parseInt(e.target.value)
        });
    }

    depositMoney = (e) => {
        e.preventDefault();
        const player = {...this.state.player};
        const depositAmount = this.state.moneyAmount;
        const currentBank = player.banks[this.state.bankIndex];
        currentBank.balance += depositAmount;
        player.money -= depositAmount;
        let debtToBeRemoved = false;
        player.debts.forEach((bank) => {
            if (bank.name === currentBank.name) {
                bank.debtAmount = currentBank.balance;
                if (bank.debtAmount >= 0) {
                    debtToBeRemoved = bank;
                }
            }
        });
        if (debtToBeRemoved) {
            removeFromArray(debtToBeRemoved, player.debts);
        }
        this.props.updatePlayer(player);
        this.setState({
            accountBalance: this.state.accountBalance + depositAmount,
            moneyAmount: 0,
            player: player
        },
            this.toggleDepositScreen
        );

    }

    withdrawMoney = (e) => {
        e.preventDefault();
        const player = {...this.state.player};
        const withdrawAmount = this.state.moneyAmount;
        const currentBank = player.banks[this.state.bankIndex];
        currentBank.balance -= withdrawAmount;
        player.money += withdrawAmount;
        if (currentBank.balance < 0) {
            let bankFound = false;
            player.debts.forEach((bank)=> {
                if (bank.name === currentBank.name) {
                    bank.debtAmount = currentBank.balance;
                    bank.lastVisit = player.day;
                    bankFound = true;
                }
            });
            if (!bankFound) {
                const newDebt = {
                    name: currentBank.name,
                    debtAmount: currentBank.balance,
                    interestRate: currentBank.interestRate,
                    dayBorrowed: player.day,
                    lastVisit: player.day
                };
                player.debts.push(newDebt);
            }
        }
        this.props.updatePlayer(player);
        this.setState({
            accountBalance: this.state.accountBalance - withdrawAmount,
            moneyAmount: 0,
            player: player
        },
            this.toggleWithdrawScreen
        );

    }

    purchaseProperty = () => {
        const player = {...this.state.player};
        const property = player.properties[this.state.propertyIndex];
        player.money -= property.cost;
        property.owned = true;
        property.lastVisit = player.day;
        this.props.updatePlayer(player);
        this.setState({
            player: player,
            localPropertyOwned: true
        });
    }

    toggleCollectingScreen = () => {
        this.setState({
            collectingScreen: !this.state.collectingScreen
        });
    }

    collectInput = (e) => {
        this.setState({
            collectAmount: parseInt(e.target.value)
        });
    }

    collectItems = (e) => {
        e.preventDefault();
        const player = {...this.state.player};
        const property = player.properties[this.state.propertyIndex];
        let itemFound = false;
        player.inventory.forEach((item)=> {
            if (item.type === property.item) {
                itemFound = true;
                const previousPrice = item.price;
                const previousQty = item.qty;
                const currentPrice = 0;
                const averageWeightedCost = Math.round(((previousPrice * previousQty) + (currentPrice * this.state.collectAmount)) / (previousQty + this.state.collectAmount));
                item.price = averageWeightedCost;
                item.qty += this.state.collectAmount;
                player.inventorySize += this.state.collectAmount;
            }
        });

        if (!itemFound) {
            player.inventory.push({
                type: property.item,
                qty: this.state.collectAmount,
                price: 0,
              });
              player.inventorySize += this.state.collectAmount;
        }

        property.qty -= this.state.collectAmount;

        this.setState({
            player: player,
            localProperty: property
        });

        this.props.updatePlayer(player);
        this.toggleCollectingScreen();
    }

    render() {
        const player = this.state.player;
        let disabled = false;
        const maxDeposit = player.money;
        let maxWithdraw = this.state.accountBalance + this.state.maxLoanAmount;
        if (maxWithdraw < 0) {
            maxWithdraw = 0;
        }
        const interestRateToDisplay = (this.state.interestRate * 100).toFixed(2);

        const property = this.state.localProperty;
        const maxCollect = Math.min(property.qty, (player.maxInventory - player.inventorySize));
        let ledgerType;
        if (this.state.showPropertyLedger){
            ledgerType = 'Property';
        } else {
            ledgerType = 'Bank';
        }
        let banksToShow = false;
        let propertiesToShow = false;

        return(
            <div>
                <div className="popup mainMenu">
                    <div className="choices">
                        <button onClick={ this.toggleUpgradeScreen }>Manage Caravan</button>
                        <button onClick={ this.toggleBankScreen }>Local Bank</button>
                        <button onClick={ this.togglePropertyScreen }>Local Property</button>
                        <button onClick={ this.toggleLedgerScreen }>Ledger</button>
                        <button onClick={ this.confirmNewGame }>New Game</button>
                        <button onClick={ this.confirmQuit }>Quit Game</button>
                        <button onClick={ this.closeMenu }>Close Menu</button>
                    </div>
                </div>
                { this.state.startNewGame ? 
                <div className="popup">
                    <h3>Are you sure you want to start a new game?</h3>
                    <p>(All of your current progress will be lost)</p>
                    <div className="choices">
                        <button onClick={ this.chooseNewCountry }>Yes</button>
                        <button onClick={ this.confirmNewGame }>No</button>
                    </div>
                </div>
                : null
                }
                { this.state.quitGame ? 
                <div className="popup">
                    <h3>Are you sure you want to quit?</h3>
                    { player.name === "Nameless Merchant" ? <p>(All of your current progress will be lost)</p> : <p>(Your game is saved)</p>}
                    <div className="choices">
                        <button onClick={ () => {
                            this.closeMenu();
                            this.props.quit();
                            } }>Yes</button>
                        <button onClick={ this.confirmQuit }>No</button>
                    </div>
                </div>
                : null
                }
                {
                    this.state.bankScreen ?
                    <div className="popup bank">
                        <h3>Bank of {player.location}</h3>
                        <h4>Interest Rate: {interestRateToDisplay} %</h4>
                        <h4>Maximum Loan: ${this.state.maxLoanAmount}</h4>
                        <h4>Your balance:</h4>
                        <div className="darkContainer bankBalance">
                            <h3>${this.state.accountBalance}</h3>
                        </div>
                        <div className="choices">
                            <button onClick={ this.toggleDepositScreen }>Deposit</button>
                            <button onClick={ this.toggleWithdrawScreen }>Withdraw</button>
                        </div>
                        <button onClick={ this.toggleBankScreen }>Back to Menu</button>
                    </div>
                    : null
                }
                {
                    this.state.depositScreen ?
                    <div className="popup depositScreen">
                        <h3>How much to deposit?</h3>
                        <form onSubmit={ this.depositMoney } action="submit">
                            <label htmlFor="depositAmount">Max: ${maxDeposit}<span className="sr-only">Enter deposit amount</span></label>
                            <input onChange={ this.moneyInput } type="number" id="depositAmount" min="0" max={maxDeposit} />
                            <button type="submit">Deposit</button>
                        </form>
                        <button onClick={ this.toggleDepositScreen }>Cancel</button>
                    </div>
                    : null
                }
                {
                    this.state.withdrawScreen ?
                    <div className="popup withdrawScreen">
                        <h3>How much to withdraw?</h3>
                        <form onSubmit={ this.withdrawMoney } action="submit">
                            <label htmlFor="withdrawAmount">Max: ${maxWithdraw}<span className="sr-only">Enter withdraw amount</span></label>
                            <input onChange={ this.moneyInput } type="number" id="withdrawAmount" min="0" max={maxWithdraw} />
                            <button type="submit">Withdraw</button>
                        </form>
                        <button onClick={ this.toggleWithdrawScreen }>Cancel</button>
                    </div>
                    : null
                }
                { this.state.upgradeScreen ?
                    <div className="popup upgradeMenu">
                        <div className="choices">
                            <h3>Your caravan: </h3>
                            <h4>Inventory Slots: {player.maxInventory}</h4>
                            <h4>Armed Guards: {player.armedGuards}</h4>
                            { player.money < this.state.addedInventoryCost ? disabled = true : disabled = false}
                            <button disabled={disabled} onClick={this.addInventorySlots}>Add 10 Inventory Slots (${this.state.addedInventoryCost})</button>
                            { player.money < 5000 ? disabled = true : disabled = false}
                            <button onClick={this.hireArmedGuard} disabled={disabled}>Hire an Armed Guard ($5000 + $25/day)</button>
                            { player.armedGuards < 1 ? disabled = true : disabled = false}
                            <button onClick={this.fireArmedGuard} disabled={disabled}>Fire an Armed Guard</button>
                            <button onClick={ this.toggleUpgradeScreen }>Back to Menu</button>
                        </div>
                    </div>
                    : null
                }
                {
                    this.state.ledgerScreen ?
                        <div className="popup ledgerScreen">
                            <h3>{ledgerType} Ledger</h3>
                            {
                                this.state.showBankLedger ?
                                <div className="ledgerItemList">
                                    {
                                        player.banks.map((bank, index)=> {
                                            if (bank.name !== "empty" && bank.balance !== 0) {
                                                banksToShow = true;
                                                return(
                                                    <div key={bank.name + index} className="ledgerItem">
                                                        <h4>{bank.name}</h4>
                                                        <div className="darkContainer">
                                                            <h3>${bank.balance}</h3>
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                return false;
                                            }
                                        })
                                    }
                                    {
                                        !banksToShow ?
                                        <p>No current investments</p>
                                        : null
                                    }
                                </div>
                                :
                                <div className="ledgerItemList">
                                    {
                                        player.properties.map((property, index)=> {
                                            if (property.owned) {
                                                propertiesToShow = true;
                                                return(
                                                    <div key={property.name + index} className="ledgerItem">
                                                        <h4>{property.name} of {property.town}</h4>
                                                        <div className="darkContainer">
                                                            <h3>{property.qty}</h3>
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                return false;
                                            }
                                        })
                                    }
                                    {
                                        !propertiesToShow ?
                                        <p>No owned properties</p>
                                        : null
                                    }
                                </div>
                            }
                        <div className="choices">
                            <button onClick={ this.showBankLedger }>Banks</button>
                            <button onClick={ this.showPropertyLedger }>Properties</button>
                            <button onClick={ this.toggleLedgerScreen }>Close</button>
                        </div>
                    </div>
                    : null
                }
                {
                    this.state.propertyScreen ?
                    <div className="popup propertyScreen">
                        <h2>{property.name} of {property.town}</h2>
                        {
                            this.state.localPropertyOwned ?
                            <div className="propertyInfo">
                                <h4>Produces {property.production} x {property.item} per day</h4>
                                <div className="darkContainer propertyQty">
                                    <h3>Qty: {property.qty}</h3>
                                </div>
                                <div className="choices">
                                    <button onClick={ this.toggleCollectingScreen }>Collect Items</button>     
                                </div>
                            </div>
                            :
                            <div className="propertyInfo">
                                { player.money < property.cost ? disabled = true : disabled = false}
                                <h3>Cost: ${property.cost}</h3>
                                <h4>Produces {property.production} x {property.item} per day</h4>
                                <div className="choices">
                                    <button onClick={ this.purchaseProperty } disabled={disabled}>Purchase</button>
                                </div>
                            </div>
                        }
                        <button onClick={ this.togglePropertyScreen }>Close</button>
                    </div>
                    : null
                }
                {
                    this.state.collectingScreen ?
                    <div className="popup withdrawScreen">
                        <h3>How much to collect?</h3>
                        <form onSubmit={ this.collectItems } action="submit">
                            <label htmlFor="collectAmount">Max: {maxCollect}<span className="sr-only">Enter amount to collect</span></label>
                            <input onChange={ this.collectInput } type="number" id="collectAmount" min="0" max={maxCollect} />
                            <button type="submit">Collect</button>
                        </form>
                        <button onClick={ this.toggleCollectingScreen }>Cancel</button>
                    </div>
                    : null
                }
                { this.state.chooseNewCountry ? 
                <div className="popup">
                    <ChooseCountry beginGame={ this.closeCountryMenu } countries={this.props.countries} />
                </div>
                : null }
            </div>
        );
    }
}

export default MainMenu;