import React from 'react';
import Refinement from './refinement';
import { makeRequest } from '../Actions/dashboard'
import '../CSS/trending.css'

class Trending extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            loaded: false
        }
    }

    componentDidMount(){
        const component = this;
        makeRequest('GET', "https://api.jikan.moe/v3/top/anime/1/tv").then(function(data){
            component.setState({"results": JSON.parse(data).top}, () => {
                component.setState({"loaded": true})
            })
            
        });
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.results.map(title=>{
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
        return null;
    }
}

export default Trending;