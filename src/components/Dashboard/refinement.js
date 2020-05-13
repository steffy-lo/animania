import { Button, Form } from 'react-bootstrap';
import React from 'react';
import '../CSS/refinement.css'
import { uid } from "react-uid";
import {makeRequest} from "../Actions/dashboard";

class Refinement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            genres: {
                "action": false,
                "adventure": false,
                "cars": false,
                "comedy": false,
                "dementia": false,
                "demons": false,
                "drama": false,
                "ecchi": false,
                "fantasy": false,
                "game": false,
                "harem": false,
                "hentai": false,
                "historical": false,
                "horror": false,
                "josei": false,
                "kids": false,
                "magic": false,
                "martial arts": false,
                "mecha": false,
                "military": false,
                "music": false,
                "mystery": false,
                "parody": false,
                "police": false,
                "psychological": false,
                "romance": false,
                "samurai": false,
                "school": false,
                "sci-fi": false,
                "seinen": false,
                "shoujo": false,
                "shoujo ai": false,
                "shounen": false,
                "shounen ai": false,
                "slice of life": false,
                "space": false,
                "sports": false,
                "super power": false,
                "supernatural": false,
                "thriller": false,
                "vampire": false,
                "yaoi": false,
                "yuri": false,
            },
            selectGenre: false
        };
        this.updateGenreSelect = this.updateGenreSelect.bind(this);
        this.displayGenres = this.displayGenres.bind(this);
        this.updateSort = this.updateSort.bind(this);
        this.updateType = this.updateType.bind(this);
        this.updateWatchFilter = this.updateWatchFilter.bind(this);
        this.updateGenreFilter = this.updateGenreFilter.bind(this);
    }

    addRemoveGenre(e, elmId) {
        const selectedGenreBtn = document.getElementById(elmId);
        const genre = selectedGenreBtn.value;
        if (e.detail === 1) {
            if (selectedGenreBtn.style.backgroundColor === 'limegreen') {
                selectedGenreBtn.style.backgroundColor = "#dc3545";
                selectedGenreBtn.style.borderColor = "#dc3545";
                this.setState({genres: {...this.state.genres, [genre]: false} },
                    () => this.updateGenreFilter())
            }
            else {
                selectedGenreBtn.style.backgroundColor = 'limegreen';
                selectedGenreBtn.style.borderColor = 'limegreen';
                this.setState({genres: {...this.state.genres, [genre]: true} },
                    () => this.updateGenreFilter())
            }
        }
    }

    updateGenreFilter() {
        const add = [];
        const remove = [];
        for (let i = 0; i < this.props.noFilter.length; i++) {
            const genres = this.props.noFilter[i].genres;
            for (let j = 0; j < genres.length; j++) {
                const genre = genres[j].name.toLowerCase();
                if (this.state.genres[genre] && !add.includes(this.props.noFilter[i])) { // then include this anime
                    add.push(this.props.noFilter[i])
                }
                if (!this.state.genres[genre] && !remove.includes(this.props.noFilter[i])) { // then exclude this anime
                    remove.push(this.props.noFilter[i])
                }
            }
        }

        if (add.length !== 0) {
            for (let k = 0; k < remove.length; k++) {
                if (add.includes(remove[k])) {
                    add.splice(k+1, 1)
                }
            }
            this.props.applyFilter(add);
        } else { // reset
            this.props.applyFilter(this.props.noFilter);
        }
    }

    displayGenres() {
        if (this.state.selectGenre) {
            return (
                <div className="display-genre">
                    <h6>*Click to add genre</h6>
                    {Object.keys(this.state.genres).map((genre, index) => (
                        <Button variant="danger" key={uid(genre)} id={"genre" + index.toString()}
                                onClick={e => this.addRemoveGenre(e, "genre" + index.toString())}
                                value={genre}
                                className="genre-btn">{genre}</Button>
                    ))}
                </div>
            )
        } else {
            return null;
        }

    }

    updateWatchFilter(e) {
        if (e.target.checked) {
            const notWatched = [];
            const watched = [];
            const completed = Object.keys(this.props.completed);
            for (let i = 0; i < this.props.results.length; i++) {
                const anime = this.props.results[i];
                if (!completed.includes(anime.mal_id.toString())) {
                    notWatched.push(anime)
                } else {
                    watched.push(anime)
                }
            }
            this.setState({watched: watched});
            this.setState({notWatched: notWatched},
                () => this.props.applyFilter(this.state.notWatched));
        } else {
            const addBackWatched = this.props.results.concat(this.state.watched);
            addBackWatched.sort((a, b) => (a.score < b.score) ? 1 : -1);
            this.props.applyFilter(addBackWatched)
        }
    }

    updateSort() {
        const sel = document.getElementById("sort-select");
        const sortby = sel.options[sel.selectedIndex].value;
        this.props.results.sort((a, b) => (a[sortby] < b[sortby]) ? 1 : -1);
        this.props.applyFilter(this.props.results)
    }

    updateGenreSelect() {
        const sel = document.getElementById("genres-select");
        const selected = sel.options[sel.selectedIndex].value;
        if (selected === "select") {
            this.setState({selectGenre: true});
        } else {
            this.setState({selectGenre: false})
        }
    }

    updateType() {
        const sel = document.getElementById("type-select");
        const type = sel.options[sel.selectedIndex].value;
        makeRequest('GET', "https://api.jikan.moe/v3/top/anime/1/" + type)
            .then(data => {
                this.props.applyFilter(JSON.parse(data).top)
            });
    }

    showFilters() {
        if (this.props.filters[0]) {
            return (
                <div className="type">
                    <h6>TYPE</h6>
                    <select id="type-select" onChange={this.updateType}>
                        <option value="tv">TV</option>
                        <option value="movie">Movie</option>
                        <option value="airing">Airing</option>
                    </select>
                </div>
            )
        }

        if (this.props.filters[1]) {
            return (
                <div className="genres">
                    <h6>GENRES</h6>
                    <select id="genres-select" onChange={this.updateGenreSelect}>
                        <option value="none">None</option>
                        <option value="select">Select</option>
                    </select>
                </div>
            )
        }
    }

    render() {
        return(
            <div className="refinement">
                <div className="sort">
                    <h6>SORT</h6>
                    <select id="sort-select" onChange={this.updateSort}>
                        <option value="score">Ranking</option>
                        <option value="members">Popularity</option>
                    </select>
                </div>
                {this.showFilters()}
                <div className="watch-filter">
                    <Form.Check
                        custom
                        inline
                        label="Not Watched"
                        type="checkbox"
                        id={`custom-inline-checkbox-1`}
                        onChange={this.updateWatchFilter}
                    />
                </div>
                {this.displayGenres()}
            </div>
        )
    }
}

export default Refinement;