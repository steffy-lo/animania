import React from 'react';
import './App.css';
import firebase from 'firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import Main from './components/Main';

firebase.initializeApp({
    apiKey: "AIzaSyDLsAqfBVZjREW8eCjDD5n1pI4poe1Dibo",
    authDomain: "animania-d44d3.firebaseapp.com"
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.uiConfig = {
          signInFlow: "popup",
              signInOptions: [
              firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              firebase.auth.FacebookAuthProvider.PROVIDER_ID,
              firebase.auth.EmailAuthProvider.PROVIDER_ID
          ],
        callbacks: {
              signInSuccessWithAuthResult: () => false
          }
      };
    this.state = {
        isSignedIn: false
    }
  }

  componentDidMount() {
      firebase.auth().onAuthStateChanged(user => {
          this.setState({
              isSignedIn: !!user, // if user is not an object, set to true, if not an object, set it to false
              
          })
          if (this.state.isSignedIn){
            this.setState({
                username: user.email,
                profilePic: user.photoURL
            })
        }
      })
  }

  render() {
      
    return(
        <div className="Animania">
            {this.state.isSignedIn ? <Main firebase={firebase} state={this.state}/> :
                (
                    <div>
                        <div className="form">
                            <form className="login-form">
                                <img alt="logo" className="logo" src={require('./images/logo.png')}/>
                                <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    )
  }
}

export default App;
