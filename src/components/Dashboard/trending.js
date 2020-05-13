import React from 'react';
import Refinement from './refinement';
import { makeRequest } from '../Actions/dashboard'
import { uid } from "react-uid";
import {Modal,Button, Card} from "react-bootstrap";

class Trending extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            loaded: false,
            showanimeInfo: false
        }
        this.showModal = this.showModal.bind(this);
        this.getAnimeInfo = this.getAnimeInfo.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
    }

    componentDidMount(){
        makeRequest('GET', "https://api.jikan.moe/v3/top/anime/1/tv")
            .then(data => {
                this.setState({"results": JSON.parse(data).top}, () => {
                this.setState({"loaded": true})
            })
            
        });
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

    getAnimeInfo(id) {
        makeRequest('GET', "https://api.jikan.moe/v3/anime/" + id)
            .then(info => {
                this.setState({"animeInfo": JSON.parse(info)},
                () => this.setState({showAnimeInfo: true}))
            })
            .catch(err => {
                console.log(err)
            })
    }

    applyFilter(newResults) {
        this.setState({results: newResults});
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.results.map(title =>{
                return(
                    <Card style={{ width: '17rem', textAlign: 'center' }} key={uid(title)}>
                        <Card.Img className variant="top" src={title.image_url}/>
                        <Card.Title>{title.title}</Card.Title>
                        <Button className="btn-card" variant="danger"
                                onClick={() => this.props.addToWatch(this.props.username, title.mal_id, title.title, title.image_url)}>+ Watch List</Button>
                        <Button className="btn-card" variant="danger" onClick={()=> this.getAnimeInfo(title.mal_id)}>See Info</Button>
                    </Card>
                )
            });
            return(
                <div className="scroll">
                    <Refinement results={this.state.results} applyFilter={this.applyFilter} completed={this.props.completed} filters={[true, false]}/>
                    <div className="titles-container">
                        {animeTitles}
                    </div>
                    {this.showModal()}
                </div>
            )
        }
        return null;
    }
}

export default Trending;