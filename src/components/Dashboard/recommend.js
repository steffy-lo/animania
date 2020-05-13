import React from 'react';
import '../CSS/recommend.css'
import Refinement from "./refinement";
import {makeRequest, getRecommendations} from '../Actions/dashboard';
import {uid} from "react-uid";
import {Button, Card, Modal} from "react-bootstrap";

class Recommend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            showanimeInfo: false,
            animeInfo: {
                title: "",
                score: "",
                episodes: "",
                synopsis: ""
            }
        };
        this.getAnimeInfo = this.getAnimeInfo.bind(this);
        this.loadRecommendations = this.loadRecommendations.bind(this);
        this.showModal = this.showModal.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
    }

    getAnimeInfo(anime_id) {
        makeRequest('GET', "https://api.jikan.moe/v3/anime/" + anime_id)
            .then(info => {
                this.state.recommendations.sort((a, b) => (a.score < b.score) ? 1 : -1);
                const res = JSON.parse(info);
                this.setState({recommendations: [...this.state.recommendations, res]});
                this.setState({noFilter: [...this.state.noFilter, res]})
            })
            .catch(err => {
                console.log(err)
            })
    }

    loadRecommendations() {
        if (this.props.completed != null) {
            this.setState({noFilter: []});
            this.setState({recommendations: []},
            () => {
                getRecommendations(this.props.username, "user")
                    .then(recs => {
                        console.log(recs);
                        for (let i = 0; i < recs.length; i++) {
                            this.getAnimeInfo(recs[i]);
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
                    .finally(() => {
                        this.setState({loaded: true})
                    })
            })
        } else {
            this.setState({loaded: true})
        }
    }

    componentDidMount() {
        setTimeout(this.loadRecommendations, 1000);
    }

    applyFilter(newResults) {
        this.setState({recommendations: newResults});
    }

    showModal() {
        if(this.state.showAnimeInfo){
            return(
                <div className="info-prompt">
                    <Modal.Dialog size="lg" centered>

                        <Modal.Body>
                            <h6>{this.state.animeInfo.title}</h6>
                            <p>Score: {this.state.animeInfo.score}
                                <br/>Episodes: {this.state.animeInfo.episodes}
                                <br/>
                                <br/>{this.state.animeInfo.synopsis}
                            </p>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => this.setState({showAnimeInfo: false})}>Close</Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </div>

            )
        }
        return null;
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.recommendations.map(title => {
                return(
                    <Card style={{ width: '17rem', textAlign: 'center' }} key={uid(title)}>
                        <Card.Img variant="top" src={title.image_url}/>
                        <Card.Title className="titleName">{title.title}</Card.Title>
                        <Button className="btn-card" variant="danger"
                                onClick={() => this.props.addToWatch(this.props.username, title.mal_id, title.title, title.image_url)}>+ Watch List</Button>
                        <Button className="btn-card" variant="danger" onClick={()=> {
                            this.setState({animeInfo: {
                                    title: title.title,
                                    score: title.score,
                                    episodes: title.episodes,
                                    synopsis: title.synopsis
                                }});
                            this.setState({showAnimeInfo: true})
                        }}>See Info</Button>
                    </Card>
                )
            });
            if (animeTitles.length > 0) {
                return (
                    <div className="scroll">
                        <Refinement results={this.state.recommendations} noFilter={this.state.noFilter} applyFilter={this.applyFilter} completed={this.props.completed} filters={[false, true]}/>
                        <div className="titles-container">
                            {animeTitles}
                        </div>
                        {this.showModal()}
                    </div>
                )
            } else {
                return (
                    <div className="loading-msg">
                        <h1>Getting Started...</h1>
                        <h3>To get started with your personalized Anime recommendation list, please add a few animes to your completed list.</h3>
                    </div>
                );
            }
        }
        return (
            <div className="loading-msg">
                <h1>Getting your personalized Anime recommendations list...</h1>
                <h3>Please wait or check back again later. This might take up to a few minutes.</h3>
            </div>
        );
    }
}

export default Recommend;