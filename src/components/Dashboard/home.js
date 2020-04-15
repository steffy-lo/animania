import React from 'react';

class Home extends React.Component {

    constructor(props) {
        super(props);
        console.log(this.props)
        this.signOut = this.signOut.bind(this);
    }

    signOut() {
        this.props.firebase.auth().signOut()
    }

    render() {
        return(
            <div>
                This is the main dashboard
                <button onClick={this.signOut}>Sign Out</button>
            </div>
        )
    }
}

export default Home;