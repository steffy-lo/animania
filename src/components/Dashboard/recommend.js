import React from 'react';
import '../CSS/recommend.css'
import Refinement from "./refinement";

class Recommend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            loaded: false
        }
    }

    render() {
        return (
            <div>
                <Refinement/>
            </div>

        );
    }
}

export default Recommend;