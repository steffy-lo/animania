import React from 'react';
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import '../CSS/settings.css';

class Settings extends React.Component {

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
                            <input type="password" id="inputPassword"  placeholder="k"/>
                            <input type="password" id="inputPasswordNew" placeholder="n"/>
                        </div>
                    </div>
                    <h5>Anime-Based Recommendation</h5>
                    <p>Finds <i>q</i> animes that are similar to a given anime.</p>
                    <p>By default, q = 10.</p>
                    <div>
                        <div>
                            <input type="password" id="inputPassword"  placeholder="q"/>
                        </div>
                    </div>
                    <p><Button variant="danger" id="save-settings" type="click">Update Values</Button></p>
                </dl>
            </div>
        )
    }
}

export default Settings;