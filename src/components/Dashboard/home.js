import React from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import '../CSS/home.css'

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.signout = this.signout.bind(this);
    }

    signout() {
        this.props.firebase.auth().signOut();
        console.log("YEAH");
    }

    render() {
        return(
            <div>
                <img className="user-icon" alt="profilepic" src={this.props.state.profile}/>
                <img className="logo-icon" alt="logo" src={require('../../logo.png')}/>
                <img src={require('../../logOut.png')} className="log-out" onClick={()=>this.props.firebase.auth().signOut()}/>
                <Link to="/settings">
                    <img className="settings" alt="settings" src={require('../../settings.png')}/>
                </Link>
            </div>
        )
    }
}

export default Home;