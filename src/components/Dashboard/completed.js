import React from 'react';
import '../CSS/completed.css'
import {uid} from "react-uid";
import {Button, Card} from "react-bootstrap";
import {makeRequest} from "../Actions/dashboard";

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
        for (let key of Object.keys(this.props.animes)) {
            makeRequest('GET', "https://api.jikan.moe/v3/anime/" + key)
            .then(info => {
                this.setState({completed: [...this.state.completed, JSON.parse(info)]})
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {
                this.setState({loaded: true})
            })
        }
    }

    componentDidMount() {
        setTimeout(this.getAnimes, 0)
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.completed.map(title => {
                return(
                    <Card style={{ width: '17rem' }} key={uid(title)}>
                        <Card.Img variant="top" src={title.image_url}/>
                        <Card.Title className="titleName">{title.title}</Card.Title>
                        <Button className="btn-card" variant="danger">Edit Review</Button>
                    </Card>
                )
            });
            if (animeTitles.length > 0) {
                return (
                    <div className="scroll">
                        <div className="titles-container">
                            {animeTitles}
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="loading-msg">av
                        <h1>Getting Started...</h1>
                        <h3>Start by adding an anime to your completed list.</h3>
                    </div>
                );
            }
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