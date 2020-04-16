import React from 'react';

class Settings extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                This is the settings page.
                <button onClick={() => this.props.firebase.auth().signOut()}>Sign Out</button>
            </div>
        )
    }
}

export default Settings;