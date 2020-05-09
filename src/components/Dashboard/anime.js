import React from 'react';
import {uid} from "react-uid";
import {Button, Card, Col, Row} from "react-bootstrap";
import {makeRequest} from "../Actions/dashboard";

class AnimeInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
        this.getAnimeInfo = this.getAnimeInfo.bind(this);
    }

    getAnimeInfo() {
        makeRequest('GET', "https://api.jikan.moe/v3/anime/" + this.props.anime.mal_id)
            .then(info => {
                console.log(JSON.parse(info));
                this.setState({anime: JSON.parse(info)},
                    () => this.setState({loaded: true}))
            })
            .catch(err => {
                console.log(err)
            })
    }

    componentDidMount() {
        setTimeout(this.getAnimeInfo, 0)
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.anime.mal_id !== prevProps.anime.mal_id) {
            this.getAnimeInfo()
        }
    }

    render() {
        if (this.state.loaded) {
            return (
                <div className="anime-info scroll">
                    <Row>
                        <Col className="img-search" md = "auto">
                        <Card><Card.Img variant="top" src={this.state.anime.image_url}/>
                        <Card.Title className="titleName">{this.state.anime.title}</Card.Title>
                        <Button className="btn-card" variant="danger">+ Watch List</Button>
                        <Button className="btn-card" variant="danger">+ Completed List</Button></Card>
                        
                        </Col>
                        <Col className="anime-desc">
                            <h5>Score: {this.state.anime.score}</h5>
                            <h5>Episodes: {this.state.anime.episodes}</h5>
                            <br/>
                            <h5>Genres:</h5>
                            {this.state.anime.genres.map(genre => {
                                return (
                                    <Button key={uid(genre)} variant="secondary" style={{margin: '1%', marginLeft: 0, marginTop: 0}}>{genre.name}</Button>
                                )
                            })}
                            <br/>
                            <h5>Synopsis</h5>
                            <p>{this.state.anime.synopsis}</p>
                            <h5>See more info at <a href={this.state.anime.url}>{this.state.anime.url}</a></h5>
                        </Col>
                    </Row>
                    
                        
                    
                </div>
            );
        }
        return (
            <div className="loading-msg">
                <h1>Fetching Info...</h1>
                <h3>Please wait.</h3>
            </div>
        );
    }
}

export default AnimeInfo;