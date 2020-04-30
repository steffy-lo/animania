import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/home.css'
import ForYou from './recommend';

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
            <div className="nav-bar">
                <div className="logoImg">
                <img className="logo-icon" alt="logo" src={require('../../images/logoTitle.png')}/>
                </div>
                
                <div className="search-div">
                    <input type="text" placeholder="Search" className="search"/>
                    <button className="search-btn" type="submit"><img className="search-icon" src ={require('../../images/Search.png')}/></button>
                </div>
                <div className="icons">
                    
                    <Link to="/settings">
                        <img className="settings" alt="settings" src={require('../../images/settings.png')}/>
                    </Link>
                    <img src={require('../../images/logOut.png')} className="log-out" onClick={()=>this.props.firebase.auth().signOut()}/>
                    <img className="user-icon" alt="profilepic" src={this.props.state.profile}/>
                </div>
            </div>
        )
    }
}

export default Home;