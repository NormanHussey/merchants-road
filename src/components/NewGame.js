import React, { Component } from 'react';

import ChooseCountry from './ChooseCountry';

class NewGame extends Component {
    constructor() {
        super();
        this.state = {
            userName: '',
            password: '',
            chooseACountry: false,
            countryChoice: '',
            uniqueUserName: true,
            guest: false
        };
    }

    enteringUserName = (e) => {
        const entry = e.target.value;
        let uniqueUserName = true;
        this.props.allPlayers.forEach((username)=> {
            if (entry === username) {
                uniqueUserName = false;
            }
        });

        this.setState({
            userName: entry,
            uniqueUserName: uniqueUserName
        });
    }

    enteringPassword = (e) => {
        this.setState({
            password: e.target.value
        });
    }

    createNewAccount = (e) => {
        e.preventDefault();
        if (this.state.uniqueUserName) {
            this.setState({
                guest: false,
                chooseACountry: true,
                countryChoice: this.props.countries[0]
            });
        }
    }

    playAsGuest = () => {
        this.setState({
            guest: true,
            chooseACountry: true,
            countryChoice: this.props.countries[0]
        });
    }

    beginGame = (countryChoice) => {
        this.props.startNewGame({
            userName: this.state.userName,
            password: this.state.password,
            guest: this.state.guest,
            countryChoice: countryChoice
        });
    }

    render() {
        return(
            <div className="startNewGame">
                { 
                    !this.state.chooseACountry ? 
                    <div className="ornateContainer">
                        <div>
                            <h3>Create an account:</h3>
                            <p>(An account will save your game automatically)</p>
                            <form onSubmit={ this.createNewAccount } action="submit" className="newGameForm">
                                <label htmlFor="newUserName">Choose your user name (alphanumeric characters only): </label>
                                <input onChange={ this.enteringUserName } type="text" name="newUserName" id="newUserName" minLength="2" pattern="^[a-zA-Z0-9_ -]*$" required />
                                { !this.state.uniqueUserName ? <p>Username already exists</p> : null }
                                <label htmlFor="newPassword">Choose a password (at least 4 characters): </label>
                                <input onChange={ this.enteringPassword } type="password" name="newPassword" id="newPassword" minLength="4" required />
                                <button type="submit">Create Account</button>
                            </form>
                        </div>
                        <div>
                            <h3>Or play as a guest:</h3>
                            <button onClick={ this.playAsGuest } type="submit">Play as Guest</button>
                        </div>
                        <button onClick={ this.props.mainMenu }>Main Menu</button>
                    </div>
                    :
                    <ChooseCountry beginGame={ this.beginGame } countries={ this.props.countries } />
                }
            </div>
        );
    }
}

export default NewGame;