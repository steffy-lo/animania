import React from 'react';
import {uid} from "react-uid";
import {Button, Card, Modal} from "react-bootstrap";
import {makeRequest, removeFromCompleted, addCompleted} from "../Actions/dashboard";

class Completed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            completed: [],
            editPrompt: false,
            editAnime: {
                title: "",
                mal_id: ""
            }
        };
        this.getAnimes = this.getAnimes.bind(this)
        this.removeFromList = this.removeFromList.bind(this);
        this.editReviewPrompt = this.editReviewPrompt.bind(this);
        this.editReview = this.editReview.bind(this);
    }

    getAnimes() {
        if (this.props.animes != null) {
            for (let [key, value] of Object.entries(this.props.animes)) {
                makeRequest('GET', "https://api.jikan.moe/v3/anime/" + key)
                    .then(info => {
                        const res = JSON.parse(info);
                        res.your_score = value;
                        this.setState({completed: [...this.state.completed, res]})
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        }
        this.setState({loaded: true})
    }

    componentDidMount() {
        setTimeout(this.getAnimes, 1000);
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.animes !== prevProps.animes) {
            this.getAnimes()
        }
    }

    removeFromList(anime_id) {
        removeFromCompleted(this.props.username, anime_id)
            .then(res => {
                console.log(res);
                this.setState({completed: []},
                    () => this.props.updateData());
            })
            .catch(err => {
                console.log(err)
            })
    }

    editReview(anime_id) {
        if (this.score.value !== "" ) {
            const score = parseInt(this.score.value);
            if (score > 0 && score < 11) {
                this.setState({editPrompt: false});
                addCompleted(this.props.username, anime_id, score)
                    .then(res => {
                        console.log(res)
                        this.setState({completed: []},
                            () => this.props.updateData());
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        }
    }

    editReviewPrompt() {
        if (this.state.editPrompt) {
            console.log(this.state.editAnime)
            return (
                <div className="add-prompt">
                    <Modal.Dialog>
                        <Modal.Header>
                            <Modal.Title>{this.state.editAnime.title} Edit Review</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <p>Please enter a number between 1 and 10 for your score of the anime.</p>
                            <input type="number" id="score" min="1" max="10" placeholder="score" ref={input => this.score = input}/>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => this.setState({editPrompt: false})}>Cancel</Button>
                            <Button variant="danger" onClick={() => this.editReview(this.state.editAnime.mal_id)}>Done</Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </div>
            )
        }
        return null;
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.completed.map(title => {
                return(
                    <Card style={{ width: '17rem', textAlign: 'center' }} key={uid(title)}>
                        <Card.Img variant="top" src={title.image_url}/>
                        <Card.Title className="titleName">{title.title}</Card.Title>
                        <Card.Text>Score: {title.your_score}</Card.Text>
                        <Button className="btn-card" variant="danger" onClick={() => {
                            this.setState({editPrompt: true});
                            this.setState({editAnime: {
                                    title: title.title,
                                    mal_id: title.mal_id
                                }})
                        }}>Edit Review</Button>
                        <Button className="btn-card" variant="danger" onClick={() => this.removeFromList(title.mal_id)}>Remove</Button>
                    </Card>
                )
            });
            if (animeTitles.length > 0) {
                return (
                    <div className="scroll">
                        <div className="titles-container">
                            {animeTitles}
                        </div>
                        {this.editReviewPrompt()}
                    </div>
                )
            } else {
                return (
                    <div className="loading-msg">
                        <h1>Getting Started...</h1>
                        <h3>Start by adding an anime to your completed list as follows:</h3>
                        <h3>Step 1. Search up an anime using the search bar.</h3>
                        <h3>Step 2. Click '+ Completed List', and you're done!</h3>
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