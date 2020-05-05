import React from 'react';
import '../CSS/recommend.css'
import Refinement from "./refinement";
import {makeRequest, getRecommendations} from '../Actions/dashboard';
import {uid} from "react-uid";

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
    }
    componentDidMount() {
        setTimeout(this.loadRecommendations, 0);
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.recommendations.map(title => {
                return(
                    <div className = "anime-container" key={uid(title)}>
                        <img alt="" className="anime-img" src = {title.image_url}/>
                        <div className="titles">{title.title}</div>
                    </div>
                )
            });
            return(
                <div>
                    <Refinement/>
                    <div className="trend-container">
                        {animeTitles}
                    </div>
                </div>
            )
        }
        if (Object.keys(this.props.animes).length > 0) {
            return (
                <div className="loading-msg">
                    <h1>Getting your personalized Anime recommendations list...</h1>
                    <h3>Please wait or check back again later. This might take up to a few minutes.</h3>
                </div>
            )
        } else {
            return (
                <div className="loading-msg">
                    <h1>Getting Started...</h1>
                    <h3>To get started with your personalized Anime recommendation list, please add a few animes to your completed list.</h3>
                </div>
            )
        }
    }
}

export default Recommend;