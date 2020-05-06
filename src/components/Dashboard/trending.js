import React from 'react';
import Refinement from './refinement';
import { makeRequest } from '../Actions/dashboard'
import { uid } from "react-uid";
import {Button, Card} from "react-bootstrap";

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
            const animeTitles = this.state.results.map(title =>{
                return(
                    <Card style={{ width: '17rem', textAlign: 'center' }} key={uid(title)}>
                        <Card.Img variant="top" src={title.image_url}/>
                        <Card.Title className="titleName">{title.title}</Card.Title>
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
                </div>
            )
        }
        return null;
    }
}

export default Trending;