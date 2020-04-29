import React from 'react';
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import '../CSS/settings.css';

class Settings extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                <div className="home">
                    <Link to="/">
                        <Button>Home</Button>
                    </Link>
                </div>
                <Button className="signOut" onClick={() => this.props.firebase.auth().signOut()}>Sign Out</Button>
                <dl className="form">
                    <label>Update Password</label>
                    <div>
                        <div>
                            <input type="password" id="inputPassword"  placeholder="Current Password"/>
                            <input type="password" id="inputPasswordNew" placeholder="New Password"/>
                        </div>
                    </div>
                    <p><Button id="save-settings" type="click">Update Settings</Button></p>
                </dl>
            </div>
        )
    }
}

export default Settings;