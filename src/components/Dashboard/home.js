import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/home.css';
import ForYou from './recommend';
import Trending from './trending.js';

class Home extends React.Component {

    constructor(props) {
        super(props);
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
                <div className="top-btns">
                    <Button className="btn-top"variant="danger">For You</Button>
                    <Button className="btn-top"variant="danger">Trending</Button>
                    <Button className="btn-top"variant="danger">Completed</Button>
                </div>
                <Trending/>
            </div>
        )
    }
}

export default Home;