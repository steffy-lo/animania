import React from 'react';
import '../CSS/completed.css'

class Completed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            completed: []
        }
        this.getAnimes = this.getAnimes.bind(this)
    }

    getAnimes() {
        const anime_ids = Object.keys(this.props.animes)
        if (anime_ids.length === 0) {
            this.setState({loaded: true})
        } else {
            // get anime titles from the anime ids and update state
        }
    }

    componentDidMount() {
        setTimeout(this.getAnimes, 0)
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.completed.map(title => {
                return(
                    <div className = "anime-container">
                        <img className="anime-img" src = {title.image_url}/>
                        <div className="titles">{title.title}</div>
                    </div>
                )
            });
            return(
                <div>
                    <div className="trend-container">
                        {animeTitles}
                    </div>
                </div>
            )
        }
        return (
            <div className="loading-msg">
                <h1>Fetching...</h1>
                <h3>Please wait.</h3>
            </div>
        );
    }
}

export default Completed;