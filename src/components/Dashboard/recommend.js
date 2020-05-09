import React from 'react';
import '../CSS/recommend.css'
import Refinement from "./refinement";
import {makeRequest, getRecommendations} from '../Actions/dashboard';
import {uid} from "react-uid";
import {Button, Card} from "react-bootstrap";

class Recommend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recommendations: [],
            loaded: false
        };
        this.getAnimeInfo = this.getAnimeInfo.bind(this);
        this.loadRecommendations = this.loadRecommendations.bind(this);
    }

    getAnimeInfo(anime_id) {
        makeRequest('GET', "https://api.jikan.moe/v3/anime/" + anime_id)
            .then(info => {
                this.setState({recommendations: [...this.state.recommendations, JSON.parse(info)]})
            })
            .catch(err => {
                console.log(err)
            })
    }

    loadRecommendations() {
        if (this.props.animes != null) {
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
        } else {
            this.setState({loaded: true})
        }
    }

    componentDidMount() {
        setTimeout(this.loadRecommendations, 1000);
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
                    </Card>
                )
            });
            if (animeTitles.length > 0) {
                return (
                    <div className="scroll">
                        <Refinement/>
                        <div className="titles-container">
                            {animeTitles}
                        </div>
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