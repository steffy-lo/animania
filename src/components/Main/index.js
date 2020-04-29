import React from 'react';
import {Route, Switch, BrowserRouter } from 'react-router-dom';
import Home from '../Dashboard/home';
import Settings from '../Settings/settings';

class Main extends React.Component {

    render() {
        return(
            <BrowserRouter>
                <Switch>
                    <Route exact path={'/'} render={() => <Home firebase={this.props.firebase} state={this.props.state}/>}/>
                    <Route exact path={'/settings'} render={() => <Settings firebase={this.props.firebase}/>}/>
                </Switch>
            </BrowserRouter>
        )
    }
}

export default Main;
