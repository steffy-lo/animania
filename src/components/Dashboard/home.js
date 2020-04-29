import React from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import '../CSS/home.css'

class Home extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                This is the main dashboard.
                <div className="settings">
                    <Link to="/settings">
                        <Button>Settings</Button>
                    </Link>
                </div>
                <Button className="signOut" onClick={() => this.props.firebase.auth().signOut()}>Sign Out</Button>
            </div>
        )
    }
}

export default Home;