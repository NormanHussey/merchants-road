import React, { Component } from 'react';

class ChooseCountry extends Component {
    constructor() {
        super();
        this.state = {
            countryChoice: ''
        };
    }

    componentDidMount() {
        this.setState({
            countryChoice: this.props.countries[0]
        });
    }

    choosingCountry = (e) => {
        this.setState({
            countryChoice: e.target.value
        });
    }

    handleFormSubmit = (e) => {
        e.preventDefault();
        this.props.beginGame(this.state.countryChoice);
    }

    render() {
        return(
            <div className="ornateContainer">
                <form onSubmit={ this.handleFormSubmit } action="submit" className="countryChoiceForm">
                    <label htmlFor="countryChoice">Choose a starting country:</label>
                    <select onChange={ this.choosingCountry } id="countryChoice">
                        {
                            this.props.countries.map((country, index)=> {
                                const key = `countryChoice${index}`;
                                return(
                                    <option key={key} value={country}>{country}</option>
                                );
                            })
                        }
                    </select>
                    <button type="submit">Begin</button>
                </form>
            </div>
        );
    }
}

export default ChooseCountry;