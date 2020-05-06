import React from 'react';
import {uid} from "react-uid";
import {Button, Card} from "react-bootstrap";

class Watch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            toWatch: []
        };
        this.getWatchList = this.getWatchList.bind(this)
    }

    getWatchList() {
        for (let value of Object.values(this.props.watchlist)) {
            this.setState({toWatch: [...this.state.toWatch, value]})
        }
        this.setState({loaded: true})
    }

    componentDidMount() {
        setTimeout(this.getWatchList, 0)
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.toWatch.map(title => {
                return(
                    <Card style={{ width: '17rem' }} key={uid(title)}>
                        <Card.Img variant="top" src={title.image_url}/>
                        <Card.Title className="titleName">{title.title}</Card.Title>
                        <Button className="btn-card" variant="danger">+ Completed List</Button>
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
                    <div className="loading-msg">
                        <h1>Getting Started...</h1>
                        <h3>Start by adding an anime to your watch list as follows:</h3>
                        <h3>Step 1. Search up an anime using the search bar.</h3>
                        <h3>Step 2. Click '+ Watch List', and you're done!</h3>
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

export default Watch;