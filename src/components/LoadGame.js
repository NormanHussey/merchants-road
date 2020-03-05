import React, { Component } from 'react';

class LoadGame extends Component {
    constructor() {
        super();
        this.state = {
            allUserNames: [],
            userName: '',
            password: '',
            validUserName: true,
            validPassword: true
        };
    }

    componentDidMount() {
        this.setState({
            allUserNames: Object.keys(this.props.allPlayers)
        });
    }

    inputUserName = (e) => {
        this.setState({
            userName: e.target.value
        });
    }

    inputPassword = (e) => {
        this.setState({
            password: e.target.value
        });
    }

    accountValidation = (e) => {
        e.preventDefault();
        let validUserName = false;
        this.state.allUserNames.forEach((storedUserName) => {
            if (this.state.userName === storedUserName) {
                validUserName = true;
            }
        });

        this.setState({
            validUserName: validUserName
        });

        if (validUserName && this.props.allPlayers[this.state.userName].password === this.state.password) {
            this.setState({
                validPassword: true
            },
                () => { this.props.loadGame(this.state.userName); }
            );
        } else {
            this.setState({
                validPassword: false
            });
        }
    }

    render() {
        return (
            <div className="ornateContainer login">
                <form onSubmit={ this.accountValidation } action="submit" className="loadGame">
                    <label htmlFor="loadUserName">Username:</label>
                    <input onChange={ this.inputUserName } type="text" name="loadUserName" id="loadUserName" />
                    { !this.state.validUserName ? <p>Invalid Username</p> : null }
                    <label htmlFor="loadPassword">Password:</label>
                    <input onChange={ this.inputPassword } type="password" name="loadPassword" id="loadPassword" />
                    { !this.state.validPassword ? <p>Invalid Password</p> : null }
                    <button type="submit">Load Game</button>
                    <button onClick={ this.props.mainMenu }>Main Menu</button>
                </form>
            </div>
        );
    }
}

export default LoadGame;