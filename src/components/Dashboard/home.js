import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/home.css';
import Button from "react-bootstrap/Button";
import Trending from './trending';
import ForYou from './recommend';
import Completed from './completed';
import ToWatch from './watch';
import AnimeInfo from './anime';
import {getUser, addUser, makeRequest} from '../Actions/dashboard';
import {Card} from "react-bootstrap";
import {uid} from "react-uid";

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: "trending",
            username: this.props.state.username,
            loaded: false,
            query: "",
            searchResults: []
        };

        this.getUserData = this.getUserData.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.getAnimes = this.getAnimes.bind(this);
    }

    getAnimes() {
        makeRequest('GET', "https://api.jikan.moe/v3/search/anime?q=" + this.state.query + "&limit=15")
            .then(info => {
                this.setState({searchResults: JSON.parse(info).results},
                    () => console.log(this.state.searchResults)
                    )
            })
            .catch(err => {
                console.log(err)
            })
    }

    handleInputChange() {
        this.setState({
            query: this.search.value
        }, () => {
            this.getAnimes()
        })
    }

    getUserData() {
        getUser(this.props.state.username).then(res => {
            this.setState({userData: res},
                () => this.setState({loaded: true}));
            console.log(res)
        })
            .catch(err => {
                if (err.stat === 404) {
                    addUser(this.props.state.username).then(res => {
                        this.setState({userData: res},
                            () => this.setState({loaded: true}));
                        console.log(res)
                    })
                        .catch(err => {
                            console.log(err)
                        })
                }
                console.log(err)
            })
    }

    componentDidMount() {
        setTimeout(this.getUserData, 0);
    }


    displaySelectedPage() {
        if (this.state.loaded) {
            if (this.state.currentPage === "trending") {
                return <Trending/>
            } else if (this.state.currentPage === "forYou") {
                return <ForYou username={this.props.state.username} animes={this.state.userData.animes}/>
            } else if (this.state.currentPage === "completed") {
                return <Completed animes={this.state.userData.animes}/>
            } else if (this.state.currentPage === "toWatch") {
                return <ToWatch watchlist={this.state.userData.toWatch}/>
            } else if (this.state.currentPage === "animeInfo") {
                return <AnimeInfo anime={this.state.title}/>
            }
        } else {
            return <Trending/>;
        }
    }

    render() {
        return(
            <div className="nav-bar">
                <div className="logoImg">
                <img className="logo-icon" alt="logo" src={require('../../images/logoTitle.png')}/>
                </div>

                <div className="search-div">
                    <input type="text" placeholder="Search" className="search" onChange={this.handleInputChange} ref={input => this.search = input}/>
                    <button className="search-btn" type="submit"><img alt="search" className="search-icon" src ={require('../../images/search.png')}/></button>
                    <div className="suggestion scroll">
                        {this.state.searchResults.map(title => {
                            return(
                                <div key={uid(title)} className="image-text-sbs" onClick={
                                    () => {
                                        this.setState({currentPage: "animeInfo"});
                                        this.search.value = "";
                                        this.setState({searchResults: []});
                                        this.setState({title: title})}
                                }>
                                    <Card style={{ width: '8rem', display: 'inline-block'}} key={uid(title)}>
                                        <Card.Img variant="top" src={title.image_url}/>
                                    </Card>
                                    <div className="text">
                                        <h6>{title.title}</h6>
                                        <h6>Score: {title.score}</h6>
                                        <p>{title.synopsis}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="icons">
                    <Link to="/settings">
                        <img className="settings" alt="settings" src={require('../../images/settings.png')}/>
                    </Link>
                    <img alt="log out" src={require('../../images/logout.png')} className="log-out" onClick={()=>this.props.firebase.auth().signOut()}/>
                    <img className="user-icon" alt="profilepic" src={this.props.state.profilePic}/>
                </div>
                <div className="top-btns">
                    <Button className="btn-top" variant="danger" onClick={() => this.setState({currentPage: "trending"})}>Trending</Button>
                    <Button className="btn-top" variant="danger" onClick={() => this.setState({currentPage: "forYou"})}>For You</Button>
                    <Button className="btn-top" variant="danger" onClick={() => this.setState({currentPage: "completed"})}>Completed</Button>
                    <Button className="btn-top" variant="danger" onClick={() => this.setState({currentPage: "toWatch"})}>To Watch</Button>
                </div>
                {this.displaySelectedPage()}
            </div>
        )
    }
}

export default Home;