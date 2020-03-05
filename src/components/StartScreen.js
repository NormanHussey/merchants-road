import React, { Component } from 'react';

import NewGame from './NewGame';
import LoadGame from './LoadGame';

class StartScreen extends Component {
    constructor() {
        super();
        this.state = {
            newGame: false,
            loadGame: false,
            howToPlay: false
        };
    }

    chooseNewGame = () => {
        this.setState({
            newGame: !this.state.newGame
        });
    }

    chooseLoadGame = () => {
        this.setState({
            loadGame: !this.state.loadGame
        });
    }

    chooseHowToPlay = () => {
        this.setState({
            howToPlay: !this.state.howToPlay
        });
    }

    backToMainMenu = () => {
        this.setState({
            newGame: false,
            loadGame: false,
            howToPlay: false
        });
    }

    render() {
        return(
            <div className="startScreen">
                { 
                    !this.state.newGame && !this.state.loadGame && !this.state.howToPlay ?
                    <div className="ornateContainer">
                        <h1>Merchant's Road</h1>
                        <div className="choices">
                            <button onClick={this.chooseNewGame}>New Game</button>
                            <button onClick={this.chooseLoadGame}>Load Game</button>
                            <button onClick={this.chooseHowToPlay}>How To Play</button>
                        </div>
                    </div>
                    : null 
                }
                { this.state.newGame ? <NewGame mainMenu={ this.backToMainMenu } startNewGame={ this.props.startNewGame } allPlayers={Object.keys(this.props.allPlayers)} countries={this.props.countries}/> : null}
                { this.state.loadGame ? <LoadGame mainMenu={ this.backToMainMenu } loadGame={ this.props.loadGame } allPlayers={this.props.allPlayers} /> : null}
                { this.state.howToPlay ?
                    <div className="ornateContainer howToPlay">
                        <h2>How To Play</h2>
                        <div className="instructions">
                            <p>You are a lonely merchant traveling the treacherous roads of Medieval Europe in search of fortune. Make your way from town to town buying low and selling high but be wary of the many dangers that await you on the road.</p>
                            <h3>Market</h3>
                            <p>Click items in your inventory to sell them and click items in the town's inventory to buy them. It's as simple as that.</p>
                            <h3>Travel</h3>
                            <p>Use the travel button to take you around Europe but be mindful of the expense. You cannot travel to a place unless you can afford the trip. Time only passes while traveling and scenarios of all kinds can happen along the way. </p>
                            <h3>Caravan</h3>
                            <p>Manage your caravan from the menu screen. You can purchase extra inventory slots or hire and fire armed guards to aid you in times of need. Armed guards will increase your likelihood of winning a fight or avoiding one.</p>
                            <h3>Banks</h3>
                            <p>Deposit money in a bank to keep it safe from the dangers of the road. It will accrue interest for you over time.</p>
                            <p>Borrow money from a bank by withdrawing more than you have. It will also accrue interest so be mindful of your debts.</p>
                            <p>After 10 days of debt, banks will send a debt collector after you who may turn up unexpectedly along the road. If you refuse to pay the collector, he may take more than just your debt.</p>
                            <p>Banks work independently from one another so it's up to you to keep track of where you've put your money.</p>
                        </div>
                        <button onClick={ this.backToMainMenu }>Main Menu</button>
                    </div>
                : null
                }
            </div>
        );
    }
}

export default StartScreen;