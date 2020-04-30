import Button from 'react-bootstrap/Button';
import React from 'react';
import '../CSS/recommend.css'
import { uid } from "react-uid";

class Recommend extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            genres: {
                // booleans indicates include and exclude genres respectively
                "action": [false, false],
                "adventure": [false, false],
                "cars": [false, false],
                "comedy": [false, false],
                "dementia": [false, false],
                "demons": [false, false],
                "drama": [false, false],
                "ecchi": [false, false],
                "fantasy": [false, false],
                "game": [false, false],
                "harem": [false, false],
                "hentai": [false, false],
                "historical": [false, false],
                "horror": [false, false],
                "josei": [false, false],
                "kids": [false, false],
                "magic": [false, false],
                "martial arts": [false, false],
                "mecha": [false, false],
                "military": [false, false],
                "music": [false, false],
                "mystery": [false, false],
                "parody": [false, false],
                "police": [false, false],
                "psychological": [false, false],
                "romance": [false, false],
                "samurai": [false, false],
                "school": [false, false],
                "sci-fi": [false, false],
                "seinen": [false, false],
                "shoujo": [false, false],
                "shoujo ai": [false, false],
                "shounen": [false, false],
                "shounen ai": [false, false],
                "slice of life": [false, false],
                "space": [false, false],
                "sports": [false, false],
                "super power": [false, false],
                "supernatural": [false, false],
                "thriller": [false, false],
                "vampire": [false, false],
                "yaoi": [false, false],
                "yuri": [false, false]
            },
            selectGenre: false,
            sortBy: null
        };
        this.updateGenreSelect = this.updateGenreSelect.bind(this);
        this.displayGenres = this.displayGenres.bind(this);
        this.updateSort = this.updateSort.bind(this);
    }

    updateSort() {
        const sel = document.getElementById("sort-select");
        this.setState({sortBy: sel.options[sel.selectedIndex].value});
    }

    updateGenreSelect() {
        const sel = document.getElementById("genres-select");
        const selected = sel.options[sel.selectedIndex].value;
        if (selected === "select") {
            this.setState({selectGenre: true})
        } else {
            this.setState({selectGenre: false})
        }

    }

    addRemoveGenre(e, elmId) {
        const selectedGenreBtn = document.getElementById(elmId);
        const genre = selectedGenreBtn.value;
        if (e.detail === 1) {
            if (selectedGenreBtn.style.backgroundColor === 'dodgerblue' || selectedGenreBtn.style.backgroundColor === 'limegreen') {
                selectedGenreBtn.style.background = 'red';
                selectedGenreBtn.style.borderColor = 'red';
                this.setState({genres: {...this.state.genres, [genre]: [false, false]} })
            }
            else {
                selectedGenreBtn.style.backgroundColor = 'limegreen';
                selectedGenreBtn.style.borderColor = 'limegreen';
                this.setState({genres: {...this.state.genres, [genre]: [true, false]} })
            }
        } else if (e.detail === 2) {
            selectedGenreBtn.style.backgroundColor = 'dodgerblue';
            selectedGenreBtn.style.borderColor = 'dodgerblue';
            this.setState({genres: {...this.state.genres, [genre]: [false, true]} })
        }
    }

    displayGenres() {
        if (this.state.selectGenre) {
            return (
                <div className="display-genre">
                    <h6>*Click to add genre and double-click to remove genre</h6>
                    {Object.keys(this.state.genres).map((genre, index) => (
                        <Button key={uid(genre)} id={"genre" + index.toString()}
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

    render() {
        return(
            <div className="for-you">
                <div className="sort">
                    <h6>SORT</h6>
                    <select id="sort-select" onChange={this.updateSort}>
                        <option value="none">None</option>
                        <option value="pop">Popularity</option>
                        <option value="rank">Ranking</option>
                        <option value="year">Year</option>
                    </select>
                </div>
                <div className="genres">
                    <h6>GENRES</h6>
                    <select id="genres-select" onChange={this.updateGenreSelect}>
                        <option value="none">None</option>
                        <option value="select">Select</option>
                    </select>
                </div>
                {this.displayGenres()}
            </div>
        )
    }
}

export default Recommend;