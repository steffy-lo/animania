import React from 'react';
import {Route, Switch, BrowserRouter } from 'react-router-dom';
import Home from '../Dashboard/home';

class Main extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <BrowserRouter>
                <Switch>
                    <Route exact path={'/'} render={() => <Home firebase={this.props.firebase}/>}/>
                </Switch>
            </BrowserRouter>
        )
    }
}

export default Main;
