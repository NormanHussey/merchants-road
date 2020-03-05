import React, { Component } from 'react';

import encounterScenarios from '../data/encounterScenarios';
import getRandomIntInRange, { getRandomIntInRangeExclusive, probability } from '../functions/randomizers';
import removeFromArray from '../functions/removeFromArray';

class Encounter extends Component {
    constructor() {
        super();
        this.state = {
            encounters: [],
            currentEncounter: 0
        };
    }

    componentDidMount() {
        const encountersArray = [];
        for (let i = 0; i < this.props.numberOfEncounters; i++) {
            const choice = getRandomIntInRangeExclusive(0, encounterScenarios.length);
            encountersArray.push(encounterScenarios[choice]);
        }
        this.setState({
            encounters: encountersArray
        });
    }

    processPlayerChoice = (choice) => {
        const scenario = this.state.encounters[this.state.currentEncounter];
        const player = this.props.player;
        const fightProbability = 0.2 * (player.armedGuards + 1);
        const fleeProbability = 0.33 * (player.armedGuards + 1);
        const allItems = this.props.allItems;
        const outcome = {
            type: 'resolved',
            text: scenario.outcomes[choice]
        };
        if (scenario.type === 'robbery') {
            switch (choice) {
                case 0:
                    // Give him money
                    const percentToSteal = getRandomIntInRange(1, 25);
                    const moneyStolen = Math.round(player.money * (percentToSteal / 100));
                    player.money -= moneyStolen;
                    outcome.text = `
                        ${outcome.text}
                        You lost $${moneyStolen}.
                    `;
                    break;

                case 1:
                    // Give him wares
                    if (player.inventory.length > 1) {
                        const itemToSteal = getRandomIntInRange(1, player.inventory.length - 1);
                        const stolenItem = player.inventory[itemToSteal];
                        const qtyToSteal = getRandomIntInRange(1, stolenItem.qty);
                        player.inventory[itemToSteal].qty -= qtyToSteal;
                        player.inventorySize -= qtyToSteal;
                        if (player.inventory[itemToSteal].qty <= 0) {
                            removeFromArray(stolenItem, player.inventory);
                        }
                        outcome.text = `
                            ${outcome.text}
                            You lost ${qtyToSteal} x ${stolenItem.type}.
                        `;
                    } else {
                        const percentToSteal = getRandomIntInRange(1, 50);
                        const moneyStolen = Math.round(player.money * (percentToSteal / 100));
                        player.money -= moneyStolen;
                        outcome.text = `
                            Nice try, you don't have any wares.
                            You lost $${moneyStolen}.
                        `;
                    }
                    break;

                case 2:
                    // Try to fight
                    let successfulFight = false;
                    if (probability(fightProbability)) {
                        successfulFight = true;
                    }
                    if (successfulFight) {
                        outcome.text = outcome.text.positive;
                    } else {
                        const percentToSteal = getRandomIntInRange(1, 50);
                        const moneyStolen = Math.round(player.money * (percentToSteal / 100));
                        player.money -= moneyStolen;
                        let itemsStolenMessage = '';
                        if (player.inventory.length > 1) {
                            const itemToSteal = getRandomIntInRange(1, player.inventory.length - 1);
                            const stolenItem = player.inventory[itemToSteal];
                            const qtyToSteal = getRandomIntInRange(1, stolenItem.qty);
                            player.inventory[itemToSteal].qty -= qtyToSteal;
                            player.inventorySize -= qtyToSteal;
                            if (player.inventory[itemToSteal].qty <= 0) {
                                removeFromArray(stolenItem, player.inventory);
                            }
                            itemsStolenMessage = ` and ${qtyToSteal} x ${stolenItem.type}`;
                        }
                        outcome.text = `
                            ${outcome.text.negative}
                            You lost $${moneyStolen}${itemsStolenMessage}.
                        `;
                    }
                    break;

                case 3:
                    // Try to flee
                    let successfulFlee = false;
                    if (probability(fleeProbability)) {
                        successfulFlee = true;
                    }
                    if (successfulFlee) {
                        outcome.text = outcome.text.positive;
                    } else {
                        const percentToSteal = getRandomIntInRange(1, 25);
                        const moneyStolen = Math.round(player.money * (percentToSteal / 100));
                        player.money -= moneyStolen;
                        let itemsStolenMessage = '';
                        if (player.inventory.length > 1) {
                            const itemToSteal = getRandomIntInRange(1, player.inventory.length - 1);
                            const stolenItem = player.inventory[itemToSteal];
                            const qtyToSteal = getRandomIntInRange(1, stolenItem.qty);
                            player.inventory[itemToSteal].qty -= qtyToSteal;
                            player.inventorySize -= qtyToSteal;
                            if (player.inventory[itemToSteal].qty <= 0) {
                                removeFromArray(stolenItem, player.inventory);
                            }
                            itemsStolenMessage = ` and ${qtyToSteal} x ${stolenItem.type}`;
                        }
                        outcome.text = `
                            ${outcome.text.negative}
                            You lost $${moneyStolen}${itemsStolenMessage}.
                        `;
                    }
                    break;

                default:
                    break;

            }
        } else if (scenario.type === 'looting') {
            switch(choice) {
                case 0:
                    // Loot the caravan
                    if (probability(0.4)) {
                        if (player.inventorySize >= player.maxInventory) {
                            outcome.text = `
                                ${outcome.text.positive}
                                But unfortunately, you have no space in your inventory.
                            `;
                        } else {
                            const itemToLoot = getRandomIntInRangeExclusive(0, allItems.length);
                            const lootedItem = allItems[itemToLoot];
                            let maxBasedOnValue = 0;
                            if (lootedItem.basePrice >= 1500) {
                                maxBasedOnValue = 5;
                            } else if (lootedItem.basePrice >= 500) {
                                maxBasedOnValue = 10;
                            } else if (lootedItem.basePrice >= 75) {
                                maxBasedOnValue = 20;
                            } else if (lootedItem.basePrice >= 25) {
                                maxBasedOnValue = 35;
                            } else {
                                maxBasedOnValue = 50;
                            }
                            const maxQty = Math.min(maxBasedOnValue, (player.maxInventory - player.inventorySize));
                            const qtyToLoot = getRandomIntInRange(1, maxQty);
                            lootedItem.qty = qtyToLoot;
                            lootedItem.price = 0;
                            player.inventorySize += qtyToLoot;
                            let playerHasItem = false;
                            player.inventory.forEach((item)=> {
                                if (item.type === lootedItem.type) {
                                    const previousPrice = item.price;
                                    const previousQty = item.qty;
                                    const averageWeightedCost = Math.round((previousPrice * previousQty) / (previousQty + lootedItem.qty));
                                    item.price = averageWeightedCost;
                                    item.qty += lootedItem.qty;
                                    playerHasItem = true;
                                }
                            })
                            if (!playerHasItem) {
                                player.inventory.push(lootedItem);
                            }
                            outcome.text = `
                                ${outcome.text.positive}
                                You find ${qtyToLoot} x ${lootedItem.type}.
                            `;
                        }
                    } else {
                        outcome.text = outcome.text.negative;
                    }
                    break;

                case 1:
                    // Loot the owner
                    if (probability(0.4)) {
                        const lootPercent = getRandomIntInRange(1, 25);
                        const moneyLooted = Math.round(player.money * (lootPercent / 100));
                        player.money += moneyLooted;
                        outcome.text = `
                            ${outcome.text.positive}
                            You found $${moneyLooted}.
                        `;
                    } else {
                        outcome.text = outcome.text.negative;
                    }
                    break;

                case 2:
                    // Try to help the owner
                    if (probability(0.49)) {
                        const rewardPercent = getRandomIntInRange(1, 75);
                        const moneyRewarded = Math.round(player.money * (rewardPercent / 100));
                        player.money += moneyRewarded;
                        outcome.text = `
                            ${outcome.text.positive}
                            You get $${moneyRewarded}.
                        `;
                    } else {
                        const percentToSteal = getRandomIntInRange(1, 75);
                        const moneyStolen = Math.round(player.money * (percentToSteal / 100));
                        player.money -= moneyStolen;
                        outcome.text = `
                            ${outcome.text.negative}
                            You lost $${moneyStolen}.
                        `;
                    }
                    break;

                default:
                    break;

            }
        } else if (scenario.type === 'saviour') {
            switch(choice) {
                case 0:
                    // Pay off
                    if (probability(0.49)) {
                        let rewardText = '';
                        if (player.inventorySize < player.maxInventory) {
                            const itemReward = getRandomIntInRangeExclusive(0, allItems.length);
                            const rewardedItem = allItems[itemReward];
                            let maxBasedOnValue = 0;
                            if (rewardedItem.basePrice >= 1500) {
                                maxBasedOnValue = 5;
                            } else if (rewardedItem.basePrice >= 500) {
                                maxBasedOnValue = 10;
                            } else if (rewardedItem.basePrice >= 75) {
                                maxBasedOnValue = 20;
                            } else if (rewardedItem.basePrice >= 25) {
                                maxBasedOnValue = 35;
                            } else {
                                maxBasedOnValue = 50;
                            }
                            const maxQty = Math.min(maxBasedOnValue, (player.maxInventory - player.inventorySize));
                            const qtyReward = getRandomIntInRange(1, maxQty);
                            rewardedItem.qty = qtyReward;
                            rewardedItem.price = 0;
                            player.inventorySize += qtyReward;
                            let playerHasItem = false;
                            player.inventory.forEach((item)=> {
                                if (item.type === rewardedItem.type) {
                                    const previousPrice = item.price;
                                    const previousQty = item.qty;
                                    const averageWeightedCost = Math.round((previousPrice * previousQty) / (previousQty + rewardedItem.qty));
                                    item.price = averageWeightedCost;
                                    item.qty += rewardedItem.qty;
                                    playerHasItem = true;
                                }
                            })
                            if (!playerHasItem) {
                                player.inventory.push(rewardedItem);
                            }
                            rewardText = `You get ${qtyReward} x ${rewardedItem.type}.`;
                        } else {
                            rewardText = `But unfortunately, you have no space in your inventory.`;
                        }
                        outcome.text = `
                            ${outcome.text.positive}
                            ${rewardText}
                        `;

                    } else {
                        const paymentPercent = getRandomIntInRange(1, 25);
                        const moneyPaid = Math.round(player.money * (paymentPercent / 100));
                        player.money -= moneyPaid;
                        outcome.text = `
                            ${outcome.text.negative}
                            You lost $${moneyPaid}.
                        `;
                    }
                    break;

                case 1:
                    // Fight off
                    if (probability(fightProbability)) {
                        const rewardPercent = getRandomIntInRange(1, 50);
                        const moneyRewarded = Math.round(player.money * (rewardPercent / 100));
                        player.money += moneyRewarded;
                        let rewardText = `You get $${moneyRewarded}`;
                        if (player.inventorySize < player.maxInventory) {
                            const itemReward = getRandomIntInRangeExclusive(0, allItems.length);
                            const rewardedItem = allItems[itemReward];
                            let maxBasedOnValue = 0;
                            if (rewardedItem.basePrice >= 1500) {
                                maxBasedOnValue = 5;
                            } else if (rewardedItem.basePrice >= 500) {
                                maxBasedOnValue = 10;
                            } else if (rewardedItem.basePrice >= 75) {
                                maxBasedOnValue = 20;
                            } else if (rewardedItem.basePrice >= 25) {
                                maxBasedOnValue = 35;
                            } else {
                                maxBasedOnValue = 50;
                            }
                            const maxQty = Math.min(maxBasedOnValue, (player.maxInventory - player.inventorySize));
                            const qtyReward = getRandomIntInRange(1, maxQty);
                            rewardedItem.qty = qtyReward;
                            rewardedItem.price = 0;
                            player.inventorySize += qtyReward;
                            let playerHasItem = false;
                            player.inventory.forEach((item)=> {
                                if (item.type === rewardedItem.type) {
                                    const previousPrice = item.price;
                                    const previousQty = item.qty;
                                    const averageWeightedCost = Math.round((previousPrice * previousQty) / (previousQty + rewardedItem.qty));
                                    item.price = averageWeightedCost;
                                    item.qty += rewardedItem.qty;
                                    playerHasItem = true;
                                }
                            });
                            if (!playerHasItem) {
                                player.inventory.push(rewardedItem);
                            }
                            rewardText += ` and ${qtyReward} x ${rewardedItem.type}`;
                        }
                        outcome.text = `
                            ${outcome.text.positive}
                            ${rewardText}.
                        `;
                    } else {
                        const percentToSteal = getRandomIntInRange(1, 50);
                        const moneyStolen = Math.round(player.money * (percentToSteal / 100));
                        player.money -= moneyStolen;
                        let itemsStolenMessage = '';
                        if (player.inventory.length > 1) {
                            const itemToSteal = getRandomIntInRange(1, player.inventory.length - 1);
                            const stolenItem = player.inventory[itemToSteal];
                            const qtyToSteal = getRandomIntInRange(1, stolenItem.qty);
                            player.inventory[itemToSteal].qty -= qtyToSteal;
                            player.inventorySize -= qtyToSteal;
                            if (player.inventory[itemToSteal].qty <= 0) {
                                removeFromArray(stolenItem, player.inventory);
                            }
                            itemsStolenMessage = ` and ${qtyToSteal} x ${stolenItem.type}`;
                        }
                        outcome.text = `
                            ${outcome.text.negative}
                            You lost $${moneyStolen}${itemsStolenMessage}.
                        `;
                    }
                    break;

                case 2:
                    // Help the enemy
                    if (probability(0.49)) {
                        const rewardPercent = getRandomIntInRange(1, 50);
                        const moneyRewarded = Math.round(player.money * (rewardPercent / 100));
                        player.money += moneyRewarded;
                        let rewardText = `You get $${moneyRewarded}`;
                        if (player.inventorySize < player.maxInventory) {
                            const itemReward = getRandomIntInRangeExclusive(0, allItems.length);
                            const rewardedItem = allItems[itemReward];
                            let maxBasedOnValue = 0;
                            if (rewardedItem.basePrice >= 1500) {
                                maxBasedOnValue = 5;
                            } else if (rewardedItem.basePrice >= 500) {
                                maxBasedOnValue = 10;
                            } else if (rewardedItem.basePrice >= 75) {
                                maxBasedOnValue = 20;
                            } else if (rewardedItem.basePrice >= 25) {
                                maxBasedOnValue = 35;
                            } else {
                                maxBasedOnValue = 50;
                            }
                            const maxQty = Math.min(maxBasedOnValue, (player.maxInventory - player.inventorySize));
                            const qtyReward = getRandomIntInRange(1, maxQty);
                            rewardedItem.qty = qtyReward;
                            rewardedItem.price = 0;
                            player.inventorySize += qtyReward;
                            let playerHasItem = false;
                            player.inventory.forEach((item)=> {
                                if (item.type === rewardedItem.type) {
                                    const previousPrice = item.price;
                                    const previousQty = item.qty;
                                    const averageWeightedCost = Math.round((previousPrice * previousQty) / (previousQty + rewardedItem.qty));
                                    item.price = averageWeightedCost;
                                    item.qty += rewardedItem.qty;
                                    playerHasItem = true;
                                }
                            });
                            if (!playerHasItem) {
                                player.inventory.push(rewardedItem);
                            }
                            rewardText += ` and ${qtyReward} x ${rewardedItem.type}`;
                        }
                        outcome.text = `
                            ${outcome.text.positive}
                            ${rewardText}.
                        `;
                    } else {
                        const percentToSteal = getRandomIntInRange(1, 75);
                        const moneyStolen = Math.round(player.money * (percentToSteal / 100));
                        player.money -= moneyStolen;
                        let itemsStolenMessage = '';
                        if (player.inventory.length > 1) {
                            const itemToSteal = getRandomIntInRange(1, player.inventory.length - 1);
                            const stolenItem = player.inventory[itemToSteal];
                            const qtyToSteal = getRandomIntInRange(1, stolenItem.qty);
                            player.inventory[itemToSteal].qty -= qtyToSteal;
                            player.inventorySize -= qtyToSteal;
                            if (player.inventory[itemToSteal].qty <= 0) {
                                removeFromArray(stolenItem, player.inventory);
                            }
                            itemsStolenMessage = ` and ${qtyToSteal} x ${stolenItem.type}`;
                        }
                        outcome.text = `
                            ${outcome.text.negative}
                            You lost $${moneyStolen}${itemsStolenMessage}.
                        `;
                    }
                    break;

                default:
                    break;

            }
        }

        this.props.encounterResult(player);
        this.showOutcome(outcome);
    }

    showOutcome = (outcome) => {
        const encountersArray = [...this.state.encounters];
        encountersArray[0] = outcome;
        this.setState({
            encounters: encountersArray
        });
    }

    nextEncounter = () => {
        const encountersArray = [...this.state.encounters];
        encountersArray.shift();
        this.setState({
            encounters: encountersArray
        });
        this.props.adjustNumberOfEncounters(encountersArray.length);
    }

    render() {
        const scenario = this.state.encounters[this.state.currentEncounter];
        return(
            <div className="popup encounter">
                { this.state.encounters.length > 0 ?
                    <div key={scenario.type + Math.random()}>
                        <p>{scenario.text}</p>
                        <div className="choices">
                            {
                                scenario.type !== 'resolved' ?
                                scenario.options.map((option, index)=> {
                                    return(
                                        <button onClick={
                                            ()=> { this.processPlayerChoice(index) }
                                        } key={scenario.type + index}>{option}</button>
                                    );
                                })
                                :
                                <button onClick={this.nextEncounter} key={scenario.text + Math.random()}>Continue</button>
                            }
                        </div>
                    </div>
                    : null
                }
            </div>
        );
    }
}

export default Encounter;