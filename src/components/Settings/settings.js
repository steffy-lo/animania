import React from 'react';
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import '../CSS/settings.css';
import {patchSettings} from '../Actions/settings';

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.updateSettings = this.updateSettings.bind(this);
        this.message = this.message.bind(this);
        this.state = {
            numError: false,
            success: false,
        }
    }

    message() {
        if (this.state.numError) {
            return <div className="message">
                <p>Please enter a number between 1 and 10 for k, n, and q and try again.</p>
                <p>At least one of k, n, or q is not a valid value.</p></div>
        }
        if (this.state.success) {
            return <div className="message"><p>Your settings have been successfully updated!</p></div>
        }
        return null;
    }

    updateSettings() {
        const values = {};
        const k = document.querySelector("#k").value;
        const n = document.querySelector("#n").value;
        const q = document.querySelector("#q").value;
        if (k !== "") {
            values.k = parseInt(k);
        }
        if (n !== "") {
            values.n = parseInt(n);
        }
        if (q !== "") {
            values.q = parseInt(q);
        }
        for (let val of Object.values(values)) {
            if (val < 1 || val > 10) {
                this.setState({numError: true});
            }
        }
        patchSettings(this.props.state.username, values)
            .then(res => {
                console.log(res);
                this.setState({success: true})
            })

    }

    render() {
        return(
            <div className="nav-bar full-scroll">
                <div className="logoImg">
                    <img className="logo-icon" alt="logo" src={require('../../images/logoTitle.png')}/>
                </div>
                <div className="search-div">
                </div>
                <div className="icons">
                    <Link to="/">
                        <img className="home" alt="home" src={require('../../images/home.png')}/>
                    </Link>
                    <img alt="log out" src={require('../../images/logout.png')} className="log-out" onClick={()=>this.props.firebase.auth().signOut()}/>
                    <img className="user-icon" alt="profilepic" src={this.props.state.profilePic}/>
                </div>
                <dl className="settings-form">
                    <h3>Modify the Recommendation Algorithm</h3>
                    <br/>
                    <h5>User-Based Recommendation</h5>
                    <p>Finds <i>k</i> users who are most similar to you and then picks out <i>n</i> of their most favourite animes. This matches k * n animes that you might like to try out!</p>
                    <p> By default, k = 5 and n = 5. You can change the value of <i>n</i> and <i>k</i> by entering their new values below.</p>
                    <p> Warning: Increasing k or n might result in longer waiting times for your curated recommendations list to appear.</p>
                    <div>
                        <div>
                            <input type="number" min="1" max="10" id="k"  placeholder="k"/>
                            <input type="number" min="1" max="10" id="n" placeholder="n"/>
                        </div>
                    </div>
                    <h5>Anime-Based Recommendation</h5>
                    <p>Finds <i>q</i> animes that are similar to a given anime.</p>
                    <p>By default, q = 10.</p>
                    <div>
                        <div>
                            <input type="number" id="q" min="1" max="15" placeholder="q"/>
                        </div>
                    </div>
                    <p><Button variant="danger" id="save-settings" type="click" onClick={this.updateSettings}>Update Values</Button></p>
                    {this.message()}
                </dl>
            </div>
        )
    }
}

export default Settings;