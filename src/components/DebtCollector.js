import React, { Component } from 'react';

import removeFromArray from '../functions/removeFromArray';
import getRandomIntInRange, { probability } from '../functions/randomizers';

class DebtCollector extends Component {
    constructor() {
        super();
        this.state = {
            bank: {
                name: '',
                debtAmount: 0
            },
            actionTaken: false,
            actionText: ''
        };
    }

    componentDidMount() {
        const player = this.props.player;
        const bank = this.props.bank;
        const interestAccrued = Math.round((bank.debtAmount * bank.interestRate * (player.day - bank.lastVisit)));
        bank.debtAmount += interestAccrued;
        this.setState({
            bank: bank
        });
    }

    payDebt = (amount) => {
        const player = this.props.player;
        const bank = this.state.bank;
        let paidInFull = false;
        let moneyPaying = Math.round(Math.abs(bank.debtAmount / amount));
        if (player.money >= moneyPaying) {
            player.money -= moneyPaying;
            bank.debtAmount += moneyPaying;
            if (bank.debtAmount >= 0) {
                paidInFull = true;
            }
        } else {
            moneyPaying = Math.round(player.money / amount);
            player.money -= moneyPaying;
            bank.debtAmount += moneyPaying;
        }
        let actionText = '';
        if (paidInFull) {
            actionText = `The collector thanks you for doing the honourable thing and clearing your name in ${bank.name}. He takes your money and rides away swiftly. You lost $${moneyPaying}.`;
        } else {
            actionText = `The collector glares at you with cold, steely eyes as he takes your pitiful offering. He warns you that he will back for the rest very soon then turns his horse and gallops away. You lost $${moneyPaying}.`;
        }

        this.setState({
            bank: bank,
            actionTaken: true,
            actionText: actionText
        },
            () => this.updateBank(player)
        );
    }

    fightHim = () => {
        const player = this.props.player;
        const bank = this.state.bank;
        let fightProbability = 0.2 * (player.armedGuards + 1);
        if (fightProbability >= 1) {
            fightProbability = 1 - Number.EPSILON;
        }
        let actionText = '';
        let paidInFull = false;
        let extraTaken = '';
        if (probability(fightProbability)) {
            actionText = `You attack the debt collector with everything you've got and it works! He flees from you in terror... but this won't be the last you've seen of him.`;
        } else {
            let moneyTaken = 0;
            if (player.money >= bank.debtAmount) {
                const leftOver = player.money - bank.debtAmount;
                const extraPercent = getRandomIntInRange(25, 50);
                const amountExtra = Math.round(leftOver * (extraPercent / 100));
                moneyTaken = bank.debtAmount + amountExtra;
                paidInFull = true;
                extraTaken = ', including a little extra for himself';
            } else {
                const percentToTake = getRandomIntInRange(50, 75);
                moneyTaken = Math.round(player.money * (percentToTake / 100));
            }
            player.money -= moneyTaken;
            if (paidInFull) {
                bank.debtAmount = 0;
            } else {
                bank.debtAmount += moneyTaken;
            }
            actionText = `He pummels you mercilessly then helps himself to the contents of your purse${extraTaken}. You lost $${moneyTaken}.`;
        }

        this.setState({
            bank: bank,
            actionTaken: true,
            actionText: actionText
        },
            () => this.updateBank(player)
        );
    }
    
    fleeFromHim = () => {
        const player = this.props.player;
        const bank = this.state.bank;
        let fleeProbability = 0.33 * (player.armedGuards + 1);
        if (fleeProbability >= 1) {
            fleeProbability = 1 - Number.EPSILON;
        }
        let actionText = '';
        let paidInFull = false;
        let extraTaken = '';
        if (probability(fleeProbability)) {
            actionText = `You pretend to dig into your purse then quickly snap the reigns and take off at breakneck pace. He chases you but you manage to lose him! You successfully got away this time but this won't be the last you've seen of him.`;
        } else {
            let moneyTaken = 0;
            if (player.money >= bank.debtAmount) {
                const leftOver = player.money - bank.debtAmount;
                const extraPercent = getRandomIntInRange(25, 50);
                const amountExtra = Math.round(leftOver * (extraPercent / 100));
                moneyTaken = bank.debtAmount + amountExtra;
                paidInFull = true;
                extraTaken = ', including a little extra for himself';
            } else {
                const percentToTake = getRandomIntInRange(25, 50);
                moneyTaken = Math.round(player.money * (percentToTake / 100));
            }
            player.money -= moneyTaken;
            if (paidInFull) {
                bank.debtAmount = 0;
            } else {
                bank.debtAmount += moneyTaken;
            }
            actionText = `He quickly halts your pathetic attempt at escaping then helps himself to the contents of your purse${extraTaken}. You lost $${moneyTaken}.`;
        }

        this.setState({
            bank: bank,
            actionTaken: true,
            actionText: actionText
        },
            () => this.updateBank(player)
        );
    }

    updateBank = (player) => {
        const currentBank = this.state.bank;
        let debtToBeRemoved = false;

        player.debts.forEach((bank) => {
            if (bank.name === currentBank.name) {
                bank.debtAmount = currentBank.debtAmount;
                if (bank.debtAmount >= 0) {
                    debtToBeRemoved = bank;
                }
            }
        });

        if (debtToBeRemoved) {
            removeFromArray(debtToBeRemoved, player.debts);
        }

        player.banks.forEach((bank) => {
            if (bank.name === currentBank.name) {
                bank.balance = currentBank.debtAmount;
                bank.lastVisit = player.day;
            }
        });
        this.props.updatePlayer(player);
    }

    render() {
        return(
            <div className="popup debtCollector">
                { !this.state.actionTaken ? 
                    <div>
                        <p>A debt collector from {this.state.bank.name} rides up and blocks your path. He is demanding you pay your outstanding debt of ${Math.abs(this.state.bank.debtAmount)}.</p>
                        <div className="choices">
                            <button onClick={ () => this.payDebt(1) } >Pay it all</button>
                            <button onClick={ () => this.payDebt(2) }>Pay half</button>
                            <button onClick={ this.fightHim }>Fight him</button>
                            <button onClick={ this.fleeFromHim }>Flee from him</button>
                        </div>
                    </div>
                : 
                    <div>
                        <p>{this.state.actionText}</p>
                        <button onClick={ this.props.close }>Continue</button>
                    </div>
                }
            </div>
        );
    }
}

export default DebtCollector;