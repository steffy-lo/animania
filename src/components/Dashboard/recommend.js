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
        }
    }

    componentDidMount() {
        getRecommendations(this.props.username, "user")
            .then(recs => {
                console.log(recs)
                if (recs.length > 0) {
                    this.setState({recommendations: recs},
                        () => {
                            this.setState({loaded: true})
                        })
                }
            })
            .catch(err => {
                console.log(err)
            })

    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.results.map(title => {
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
                <div className="no-recs">
                    <h1>Getting your personalized Anime recommendations list...</h1>
                    <h3>Please check back again later. This might take up to a few minutes.</h3>
                </div>
            )
        } else {
            return (
                <div className="no-recs">
                    <h1>Getting Started...</h1>
                    <h3>To get started with your personalized Anime recommendation list, please add a few animes to
                    your completed list by heading over to the "Completed" tab.</h3>
                </div>
            )
        }
    }
}

export default Recommend;