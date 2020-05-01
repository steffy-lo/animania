import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/home.css';
import Button from "react-bootstrap/Button";
import Trending from './trending';
import ForYou from './recommend';

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: "trending"
        }
    }

    displaySelectedPage() {
        if (this.state.currentPage === "trending") {
            return <Trending/>
        }
        else if (this.state.currentPage === "forYou") {
            return <ForYou/>
        }
        // else if (this.state.currentPage === "completed"){
        //     return <Completed/>
        // }
    }

    render() {
        return(
            <div className="nav-bar">
                <div className="logoImg">
                <img className="logo-icon" alt="logo" src={require('../../images/logoTitle.png')}/>
                </div>
                
                <div className="search-div">
                    <input type="text" placeholder="Search" className="search"/>
                    <button className="search-btn" type="submit"><img className="search-icon" src ={require('../../images/search.png')}/></button>
                </div>
                <div className="icons">
                    <Link to="/settings">
                        <img className="settings" alt="settings" src={require('../../images/settings.png')}/>
                    </Link>
                    <img src={require('../../images/logout.png')} className="log-out" onClick={()=>this.props.firebase.auth().signOut()}/>
                    <img className="user-icon" alt="profilepic" src={this.props.state.profile}/>
                </div>
                <div className="top-btns">
                    <Button className="btn-top"variant="danger" onClick={() => this.setState({currentPage: "forYou"})}>For You</Button>
                    <Button className="btn-top"variant="danger" onClick={() => this.setState({currentPage: "trending"})}>Trending</Button>
                    <Button className="btn-top"variant="danger" onClick={() => this.setState({currentPage: "completed"})}>Completed</Button>
                </div>
                {this.displaySelectedPage()}
            </div>
        )
    }
}

export default Home;