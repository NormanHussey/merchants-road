import React, { Component } from 'react';

class TravelSelection extends Component {

    render() {
        const player = this.props.player;
        const locations = this.props.locations;
        const currentLocation = this.props.currentLocation;
        const startingIndex = locations.indexOf(currentLocation);

        const countries = this.props.countries;
        const countryNames = Object.keys(countries);
        const currentCountryIndex = countryNames.indexOf(this.props.currentCountry);

        let nextCountry = countryNames[currentCountryIndex + 1];
        let previousCountry = countryNames[currentCountryIndex - 1];
        let travelTimeToNextCountry = 6 + (locations.length - 1) - startingIndex;
        let travelTimeToPreviousCountry = 6 + startingIndex;

        if (currentCountryIndex >= countryNames.length - 1) {
            nextCountry = countryNames[0];
            travelTimeToNextCountry += 6;
        }

        if (currentCountryIndex <= 0) {
            previousCountry = countryNames[countryNames.length - 1];
            travelTimeToPreviousCountry += 6;
        }

        const nextCountryLocationName = countries[nextCountry][0];
        const nextCountryLocation = {
            name: nextCountryLocationName,
            inventory: []
        };
        const travelCostToNextCountry = travelTimeToNextCountry * player.travelCost;
        let travelToNextCountryDisabled = false;
        if (travelCostToNextCountry > player.money) {
            travelToNextCountryDisabled = true;
        }
        
        const lastLocationIndex = countries[previousCountry].length - 1;
        const previousCountryLocationName = countries[previousCountry][lastLocationIndex];
        const previousCountryLocation = {
            name: previousCountryLocationName,
            inventory: []
        };
        const travelCostToPreviousCountry = travelTimeToPreviousCountry * player.travelCost;
        let travelToPreviousCountryDisabled = false;
        if (travelCostToPreviousCountry > player.money) {
            travelToPreviousCountryDisabled = true;
        }
        
        return(
            <div className="popup travelScreen">
                <h4>Travel Cost: ${player.travelCost} / day</h4>
                <div className="travelDestinations"> 
                    <button key={previousCountry + travelCostToPreviousCountry} onClick={
                        () => { this.props.travel(previousCountryLocation, travelCostToPreviousCountry, travelTimeToPreviousCountry, previousCountry) }
                    }
                    disabled={travelToPreviousCountryDisabled}>{previousCountry} ({travelTimeToPreviousCountry} days)</button>
                    {
                        locations.map((location, index) => {
                            const key = 'travelKey' + index;
                            if (location !== currentLocation) {
                                const newLocation = {
                                    name: location,
                                    inventory: []
                                };
                                const travelDistance = Math.abs(index - startingIndex);
                                const travelCost = travelDistance * player.travelCost;
                                let disabled = false;
                                if (travelCost > player.money) {
                                    disabled=true;
                                }
                                return(
                                    <button key={key} onClick={
                                        () => { this.props.travel(newLocation, travelCost, travelDistance) }
                                    } disabled={disabled}>{location} ({travelDistance} days)</button>
                                );
                            } else {
                                return (
                                <button key={key} disabled>{location}</button>
                                );
                            }
                        })
                    }
                    <button key={nextCountry + travelCostToNextCountry} onClick={
                        () => { this.props.travel(nextCountryLocation, travelCostToNextCountry, travelTimeToNextCountry, nextCountry) }
                    } disabled={travelToNextCountryDisabled}>{nextCountry} ({travelTimeToNextCountry} days)</button>
                </div>
                <button onClick={this.props.cancel}>Cancel</button>
            </div>
        );
    }
}

export default TravelSelection;