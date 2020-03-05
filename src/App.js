import React, { Component } from 'react';
import './App.css';
import firebase from './firebase';

// Import Functions
import getRandomIntInRange, { getRandomIntInRangeExclusive, getRandomFloatInRange, probability } from './functions/randomizers';
import removeFromArray from './functions/removeFromArray';
import determineMaxQty from './functions/determineMaxQty';

// Import Components
import StartScreen from './components/StartScreen';
import MainMenu from './components/MainMenu';
import Inventory from './components/Inventory';
import Transaction from './components/Transaction';
import TravelSelection from './components/TravelSelection';
import Encounter from './components/Encounter';
import MarketEvent from './components/MarketEvent';
import DebtCollector from './components/DebtCollector';

class App extends Component {
  constructor() {
    super();
    // Initialize state
    this.state = {
      gameStarted: false,
      allPlayers: [],
      countries: [],
      userName: "",
      player: {},
      location: {},
      country: {},
      items: [],
      buying: false,
      selling: false,
      selectedItem: null,
      selectedQty: 0,
      maxQty: 0,
      traveling: false,
      menuOpen: false,
      encountersOccurring: 0,
      encounterDays: [],
      daysTraveling: 0,
      marketEvent: false,
      debtCollectorPursuing: false
    }
  }

  // Pull in and store data from firebase
  componentDidMount() {
    const dbRef = firebase.database().ref();
    dbRef.on('value', (response) => {
      const db = response.val();
      const allPlayers = db.players;
      const countries = db.countries;
      const items = db.items;

      this.setState({
        allPlayers: allPlayers,
        countries: countries,
        items: items
      });
    });

  }

  // Reset player values to initial state and start a new game
  setupNewGame = ({ userName, password, guest, countryChoice }) => {
    const playersDbRef = firebase.database().ref('players');
    const startingValues = {
      money: 1000,
      day: 1,
      maxInventory: 100,
      inventorySize: 0,
      country: countryChoice,
      location: this.state.countries[countryChoice][0],
      inventory: [{
          type: "empty"
      }],
      armedGuards: 0,
      travelCost: 25,
      banks: [{
        name: "empty"
      }],
      debts: [{
        name: "empty",
        debtAmount: 0
      }]
    };

    if (guest) {
      startingValues.name = "Nameless Merchant";
      startingValues.password = "";
      const pushedGuest = playersDbRef.push(startingValues);
      userName = pushedGuest.key;
    } else {
      startingValues.name = userName;
      startingValues.password = password;
      playersDbRef.update({
        [userName]: startingValues
      });
    }

    this.setState({
      userName: userName
    },
      this.beginGame
    );
  }

  loadGame = (userName) => {
    this.setState({
      userName: userName
    },
      this.beginGame
    );
  }

  // Load in starting values and begin the game
  beginGame = () => {
    const player = this.state.allPlayers[this.state.userName];
    const countryName = player.country;
    const locations = this.state.countries[countryName];

    let currentLocation;
    locations.forEach((location) => {
      if (location === player.location) {
        currentLocation = location;
      }
    });

    const country = {
      name: countryName,
      locations: locations
    };

    const location = {
      name: currentLocation,
      inventory: this.randomizeLocationInventory()
    };

    this.setState({
      player: player,
      country: country,
      location: location,
      gameStarted: true
    });
  }

  randomizeLocationInventory = (eventIsHappening = false) => {
    // Randomly choose how many items will be in the location inventory
    const numberOfItems = getRandomIntInRange(5, 15);

    // Randomly choose the items to be added to the location inventory
    const itemsArrayCopy = [...this.state.items];
    const newInventory = [];
    for (let i = 0; i < numberOfItems; i++) {
      const randomIndex = getRandomIntInRangeExclusive(0, itemsArrayCopy.length);
      newInventory.push(itemsArrayCopy[randomIndex]);
      removeFromArray(itemsArrayCopy[randomIndex], itemsArrayCopy);
    }

    // Randomly assign prices to each item relative to its base price
    for (let item of newInventory) {
      const priceModifier = getRandomFloatInRange(0.5, 1.5);
      item.price = Math.round(item.basePrice * priceModifier);
      const qty = getRandomIntInRange(25, 500);
      item.qty = qty;
    }

    // Choose random market event
    const marketEvent = {};
    if (eventIsHappening) {
      // Choose the item to be affected
      const itemIndex = getRandomIntInRangeExclusive(0, newInventory.length);
      marketEvent.item = newInventory[itemIndex];

      // Choose which type of event will occur and set a random price according to that event
      if (probability(0.5)) {
        marketEvent.type = 'overabundance';
        const priceModifier = getRandomFloatInRange(0.1, 0.3);
        newInventory[itemIndex].price = Math.round(marketEvent.item.basePrice * priceModifier);
        if (newInventory[itemIndex].price < 1) {
          newInventory[itemIndex].price = 1;
        }
        const qty = getRandomIntInRange(500, 999);
        newInventory[itemIndex].qty = qty;
      } else {
        marketEvent.type = 'scarcity';
        const priceModifier = getRandomFloatInRange(2.5, 5);
        newInventory[itemIndex].price = Math.round(marketEvent.item.basePrice * priceModifier);
        const qty = getRandomIntInRange(1, 20);
        newInventory[itemIndex].qty = qty;
      }

      this.setState({
        marketEvent: marketEvent
      });
    }

    return newInventory;

  }

  // When an inventory item is clicked, set it as the selected item, determine the max qty (that can be bought or sold) and set the appropriate state variable to bring up the buying or selling screen
  itemClicked = (owner, item) => {
    if (item.qty > 0 && !this.state.traveling) {
      if (owner === this.state.player) {
        this.setState({
          buying: false,
          selling: true,
          selectedItem: item,
        });
      } else {
        const maxQty = determineMaxQty(item, this.state.player);
        this.setState({
          buying: true,
          selling: false,
          selectedItem: item,
          maxQty: maxQty,
        })
      }
    }
  }

  // Process the player's chosen transaction
  processTransaction = (qty) => {
    const selectedItem = this.state.selectedItem;

    const player = {...this.state.player};
    const location = {...this.state.location};

    let playerItemFound = false;
    player.inventory.forEach((item) => {
      if (item.type === selectedItem.type) {
        if (this.state.buying) {
          const previousPrice = item.price;
          const previousQty = item.qty;
          const currentPrice = selectedItem.price;
          const averageWeightedCost = Math.round(((previousPrice * previousQty) + (currentPrice * qty)) / (previousQty + qty));
          item.qty += qty;
          item.price = averageWeightedCost;
          player.inventorySize += qty;
        } else {
          item.qty -= qty;
          player.inventorySize -= qty;
          if (item.qty <= 0) {
            removeFromArray(item, player.inventory);
          }
        }
        playerItemFound = true;
      }
    });

    if (!playerItemFound && this.state.buying) {
      player.inventory.push({
        type: selectedItem.type,
        qty: qty,
        price: selectedItem.price,
      });
      player.inventorySize += qty;
    }

    location.inventory.forEach((item) => {
      if (item.type === this.state.selectedItem.type) {
        if (this.state.buying) {
          item.qty -= qty;
          player.money -= (item.price * qty);
        } else {
          item.qty += qty;
          player.money += (item.price * qty);
        }
      }
    });

    this.setState({
      player: player,
      location: location,
      buying: false,
      selling: false,
      selectedItem: null,
      selectedQty: 0,
      maxQty: 0,
    },
      this.updateFirebase
    );

  }

  cancelTransaction = () => {
    this.setState({
      buying: false,
      selling: false,
      selectedItem: null,
      selectedQty: 0,
      maxQty: 0,
    });
  }

  // Update the player's data in firebase
  updateFirebase = () => {
    const playerDbRef = firebase.database().ref('players');
    playerDbRef.update({
      [this.state.userName]: this.state.player
    });
  }

  // Open/close travel screen
  toggleTravelSelection = () => {
    if (this.state.buying || this.state.selling) {
      this.cancelTransaction();
    }
    this.setState({
      traveling: !this.state.traveling,
      menuOpen: false
    });
  }

  closeMarketEvent = () => {
    this.setState({
      marketEvent: false
    });
  }

  // Travel to a new location
  travel = (newLocation, travelCost, travelDistance, newCountry = false) => {
    this.cancelTransaction();
    const player = {...this.state.player};
    player.money -= travelCost;
    let daysPassed = travelDistance;
    const countryToTravel = {...this.state.country};

    if (newCountry) {
      countryToTravel.name = newCountry;
      countryToTravel.locations = this.state.countries[newCountry];
      player.country = newCountry;
    }

    player.location = newLocation.name;

    // Choose whether a market event will happen
    const marketEvent = probability(0.25);

    // Randomize the location inventory (and apply market event if chosen)
    newLocation.inventory = this.randomizeLocationInventory(marketEvent);

    // Choose whether random encounters happen along the trip
    const encounterDays = this.randomEncounters(daysPassed);
    const numberOfRandomEncounters = encounterDays.length;
    if (numberOfRandomEncounters === 0) {
      player.day += daysPassed;
      daysPassed = 0;
    } else {
      player.day += encounterDays[0];
      daysPassed -= encounterDays[0];
    }

    const debtCollectorPursuing = this.checkForDebtCollectors();

    this.setState({
      country: countryToTravel,
      location: newLocation,
      traveling: false,
      player: player,
      encountersOccurring: numberOfRandomEncounters,
      encounterDays: encounterDays,
      daysTraveling: daysPassed,
      debtCollectorPursuing: debtCollectorPursuing
    },
      this.updateFirebase
    );
  }

  checkForDebtCollectors = () => {
    const player = this.state.player;
    let debtCollectorPursuing = false;
    if (player.debts.length > 1) {
      const collectorProbability = player.debts.length / 10;
      if (probability(collectorProbability)) {
        const overdueDebts = [];
        player.debts.forEach((bank)=> {
          if (player.day - bank.dayBorrowed > 10) {
            overdueDebts.push(bank);
          }
        });
        if (overdueDebts.length > 0) {
          const randomCollector = getRandomIntInRangeExclusive(0, overdueDebts.length);
          debtCollectorPursuing = overdueDebts[randomCollector];
        }
      }
    }
    return debtCollectorPursuing;
  }

  // Randomly choose whether a random encounter occurs for each travel day
  randomEncounters = (daysPassed) => {
    const encounterDays = [];
    let lastDay = 0;
    for(let i = 0; i < daysPassed; i++) {
      if (probability(0.25)) {
        encounterDays.push(i + 1 - lastDay);
        lastDay = i + 1;
      }
    }
    return encounterDays;
  }

  // Update the player state and firebase with the result of the encounter
  encounterResult = (player = {...this.state.player}) => {
    this.setState({
      player: player
    },
      this.updateFirebase
    );
  }

  // After an encounter, remove it from the encounters array and decrement the encountersOccurring state
  adjustNumberOfEncounters = (numberOfEncounters) => {
    const newEncounterDays = [...this.state.encounterDays];
    const player = {...this.state.player};
    let daysTraveling = this.state.daysTraveling;
    newEncounterDays.shift();
    if (newEncounterDays.length > 0) {
      player.day += newEncounterDays[0];
      daysTraveling -= newEncounterDays[0];
    } else {
      player.day += daysTraveling;
      daysTraveling = 0;
    }

    this.setState({
      player: player,
      encountersOccurring: numberOfEncounters,
      encounterDays: newEncounterDays,
      daysTraveling: daysTraveling
    });
  }

  // Open/close menu
  toggleMenuOpen = () => {
    if (this.state.buying || this.state.selling) {
      this.cancelTransaction();
    }
    this.setState({
      menuOpen: !this.state.menuOpen,
      traveling: false
    });
  }

  closeDebtCollector = () => {
    this.setState({
      debtCollectorPursuing: false
    });
  }

  // Start a new game with the existing account/guest
  startingNewGame = (countryChoice) => {
    let guest = false;
    if (this.state.player.name === "Nameless Merchant") {
      guest = true;
    }

    const newGameValues = {
      userName: this.state.userName,
      password: this.state.player.password,
      guest: guest,
      countryChoice: countryChoice
    };

    this.setupNewGame(newGameValues);

  }

  // Update the player state and then update it in firebase
  updatePlayer = (player) => {
    this.setState({
      player: player
    },
      this.updateFirebase
    );
  }

  // Reset all state variables to quit
  quitting = () => {
    this.setState({
      gameStarted: false,
      buying: false,
      selling: false,
      selectedItem: null,
      selectedQty: 0,
      maxQty: 0,
      traveling: false,
      menuOpen: false,
    });
  }

  render() {
    return (
      <div className="App">
        { !this.state.gameStarted ? <StartScreen startNewGame={ this.setupNewGame } loadGame={ this.loadGame } allPlayers={this.state.allPlayers} countries={Object.keys(this.state.countries)}/> 
        : 
        <div>
          <header>
            <div className="wrapper gameHeader">
              <h2>{this.state.country.name}</h2>
              <div className="darkContainer">
                <h3>Day: {this.state.player.day}</h3>
              </div>
              <div className="headerButtons">
                <button onClick={ this.toggleMenuOpen }>Menu</button>
              </div>
              { this.state.menuOpen ? <MainMenu updatePlayer={this.updatePlayer} player={this.state.player} beginGame={this.startingNewGame} countries={Object.keys(this.state.countries)} quit={ this.quitting } close={ this.toggleMenuOpen } /> : null }
            </div>
          </header>
          <main>
            <div className="wrapper gameMain">
              { this.state.player.inventory ? <Inventory owner={this.state.player} clickFunction={this.itemClicked}/> : null }
              { this.state.location.inventory ? <Inventory owner={this.state.location} clickFunction={this.itemClicked}/> : null}
            </div>
          </main>
          <footer>
            <div className="wrapper gameFooter">
              <div className="darkContainer">
                <h2>${this.state.player.money}</h2>
              </div>
              { this.state.buying ? <Transaction buyer={ this.state.player } seller={ this.state.location } type={'Buy'} item={this.state.selectedItem} cancel={this.cancelTransaction} transactionClicked={this.processTransaction} maxQty={this.state.maxQty}/> : null }
              { this.state.selling ? <Transaction buyer={ this.state.location } seller={ this.state.player } type={'Sell'} item={this.state.selectedItem} cancel={this.cancelTransaction} transactionClicked={this.processTransaction} maxQty={this.state.selectedItem.qty}/> : null }
              { this.state.marketEvent ? <MarketEvent location={this.state.location} close={this.closeMarketEvent} eventInfo={this.state.marketEvent} /> : null}
              { this.state.debtCollectorPursuing ? <DebtCollector close={this.closeDebtCollector} player={this.state.player} updatePlayer={this.updatePlayer} bank={this.state.debtCollectorPursuing} /> : null }
              { this.state.encountersOccurring ? <Encounter allItems={this.state.items} adjustNumberOfEncounters={this.adjustNumberOfEncounters} numberOfEncounters={this.state.encountersOccurring} player={this.state.player} encounterResult={this.encounterResult} /> : null }
              { this.state.traveling ? <TravelSelection player={this.state.player} locations={this.state.country.locations} currentLocation={this.state.player.location} countries={this.state.countries} currentCountry={this.state.country.name} cancel={this.toggleTravelSelection} travel={this.travel}/> : <button className="travelButton" onClick={ this.toggleTravelSelection }>Travel</button>}
            </div>
          </footer>
        </div>
        }
      </div>
    );
  }
}

export default App;
