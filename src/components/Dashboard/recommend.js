import React from 'react';
import '../CSS/recommend.css'
import Refinement from "./refinement";
import { getRecommendations } from '../Actions/dashboard';

class Recommend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recommendations: [],
            loaded: false
        };
        this.fetching = false;
        this.loadRecommendations = this.loadRecommendations.bind(this);
    }

    loadRecommendations() {
        if (!this.fetching) {
            this.fetching = true;
            getRecommendations(this.props.username, "user")
                .then(recs => {
                    console.log(recs);
                    this.setState({recommendations: recs}, () => this.fetching = false)
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
    componentDidMount() {
        setTimeout(this.loadRecommendations, 0);
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.recommendations.map(title => {
                return(
                    <div className = "anime-container">
                        <img className="anime-img" src = {title.image_url}/>
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