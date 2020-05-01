import React from 'react';
import Refinement from './refinement';
import '../CSS/trending.css'

class Trending extends React.Component {
    constructor(props) {
        super(props);
        this.makeRequest = this.makeRequest.bind(this);
        this.state = {
            results: [],
            loaded: false
        }
    }

    makeRequest (method, url, data) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open(method, url);
          xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
              resolve(xhr.response);
            } else {
              reject({
                status: this.status,
                statusText: xhr.statusText
              });
            }
          };
          xhr.onerror = function () {
            reject({
              status: this.status,
              statusText: xhr.statusText
            });
          };
          if(method=="POST" && data){
              xhr.send(data);
          }else{
              xhr.send();
          }
        });
    }

    componentDidMount(){
        const component = this;
        this.makeRequest('GET', "https://api.jikan.moe/v3/top/anime/1/tv").then(function(data){
            component.setState({"results": JSON.parse(data).top}, () => {
                component.setState({"loaded": true})
            })
            
        });
    }

    render() {
        if (this.state.loaded) {
            const animeTitles = this.state.results.map(title=>{
                return(
                    <div className = "anime-container">
                        <img className="anime-img" src = {title.image_url}/>
                        <div className="titles">{title.title}</div>
                    </div>
                )
            });
            return(
                <div>
                    <Refinement/>
                    <div className="trend-container">
                        {animeTitles}
                    </div>
                </div>
            )
        }
        return null;
    }
}

export default Trending;