import React from 'react';

class Home extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                This is the main dashboard.
                <button onClick={() => this.props.firebase.auth().signOut()}>Sign Out</button>
            </div>
        )
    }
}

export default Home;