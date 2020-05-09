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
            showanimeInfo:false
        }
        this.showModal = this.showModal.bind(this);
        this.getAnimeInfo = this.getAnimeInfo.bind(this);
    }

    componentDidMount(){
        const component = this;
        makeRequest('GET', "https://api.jikan.moe/v3/top/anime/1/tv").then(function(data){
            component.setState({"results": JSON.parse(data).top}, () => {
                component.setState({"loaded": true})
            })
            
        });
    }

    showModal() {
        console.log(this.state.showAnimeInfo);
        if(this.state.showAnimeInfo){

            const animeModal= this.state.animeInfo;
            console.log(animeModal)
            return(
                <div className="info-prompt">
                    <Modal.Dialog size="lg" centered>

                    <Modal.Body>
                        <h6>{this.state.animeInfo.title}</h6>
                        <p>Score: {this.state.animeInfo.score}
                        <br/>Episodes: {this.state.animeInfo.episodes}
                        <br/>{this.state.animeInfo.synopsis}
                        
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary">Close</Button>
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

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.results.map(title =>{
                return(
                    <Card style={{ width: '17rem', textAlign: 'center' }} key={uid(title)}>
                        <Card.Img className ="anime-img" variant="top" onMouseOver = {()=> this.getAnimeInfo(title.mal_id)} src={title.image_url}/>
                        <Card.Title>{title.title}</Card.Title>
                        <Button className="btn-card" variant="danger">+ Watch List</Button>
                    </Card>
                )
            });
            return(
                <div className="scroll">
                    <Refinement/>
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