// React
import React, { Component, Fragment } from 'react'

// Style
import '../css/App.css'

// Components
import Data from './Data'
import Filters from './Filters'
import Gallery from './Gallery'
import InfoBox from './InfoBox'
import Statistics from './Statistics'
import Table from './Table'

// Main page, filters, sorting, search and all components
export default class Page extends Component {
    constructor() {
        super()

        this.updateOnLoad = true

        // Default state
        this.state = {
            anime: Data.results(),
            searchQuery: '',
            sort: Object.assign([], Data.defaults.sorting),
            filters: Object.assign({}, Data.defaults.filters),
            page: 1,
            selectedAnimeId: false,
            messageClasses: '',
            messageText: '',
        }

        // Bind functions which need access to this.state
        this.update = this.update.bind(this)
        this.reset = this.reset.bind(this)
        this.changePage = this.changePage.bind(this)
        this.openInfoBox = this.openInfoBox.bind(this)
        this.closeInfoBox = this.closeInfoBox.bind(this)
        this.getSorting = this.getSorting.bind(this)
        this.getFilters = this.getFilters.bind(this)
        this.showMessage = this.showMessage.bind(this)

        // Keyboard shortcuts
        document.addEventListener('keydown', event => {
            // ESC key to close the info box
            if (event.keyCode === 27 && this.state.selectedAnimeId) {
                this.closeInfoBox()
            }
        }, false)
    }

    // Update with latest API data after loading
    componentDidMount() {
        if (!this.updateOnLoad) {
            return
        }

        this.showMessage('Loading latest information...')

        // Update certain cached data from live API
        this.apiData = []

        this.getApiData(1, () => {
            // To use in working out how many times anime was re-wathed
            const rewatchRegex = new RegExp(/re-watched:\s(\d+)/, 'i')

            this.apiData.forEach(anime => {
                const match = anime.tags ? anime.tags.match(rewatchRegex) : 0

                // Update only this information
                Data.updateAnime(anime.mal_id, {
                    status: anime.watching_status,
                    rating: anime.score,
                    rewatchCount: match ? parseInt(match[1], 10) : 0,
                    watchedEpisodes: anime.watched_episodes,
                })
            })

            // Update table with new data
            this.reset()

            this.showMessage('Updated!', 1500, 'success')
        })
    }

    // Get my anime list API data
    getApiData(page, callback) {
        fetch(`https://api.jikan.moe/v3/user/fncombo/animelist/all/${page}`).then(response =>
            response.json()
        ).then(response => {
            if (response.hasOwnProperty('error')) {
                console.error(response.error)

                this.showMessage('Error loading data from MyAnimeList.net', 1500, 'failure')

                return
            }

            // Add all anime from API
            this.apiData.push.apply(this.apiData, response.anime)

            // Since API only does 300 entries per responce, keep trying next page until we get everything
            if (response.anime.length === 300) {
                // Small delay to not exceed API request limit
                setTimeout(() => {
                    this.getApiData(page + 1, callback)
                }, 2000)
            } else {
                callback()
            }
        })
    }

    // Show a small message in the corner of the page
    showMessage(text, duration = false, status = '') {
        this.setState({
            messageClasses: `show ${status}`,
            messageText: text,
        })

        // Hide message after a duration if specified
        if (duration) {
            setTimeout(() => {
                this.setState({
                    messageClasses: status,
                })
            }, duration)
        }
    }

    // Update search, sort and filters
    update(action, ...args) {
        let newState = Object.assign({}, this.state)

        if (args.length === 2) {
            // If the value is string false, we probably mean "false" keyword!
            if (args[1] === 'false') {
                args[1] = false
            }

            newState[action][args[0]] = args[1]
        } else {
            newState[action] = args[0]
        }

        newState.anime = Data.results(newState.searchQuery, newState.sort, newState.filters)

        this.setState(newState)
    }

    // Reset all filters, sorting and search
    reset() {
        this.setState({
            anime: Data.results(),
            searchQuery: '',
            sort: Object.assign([], Data.defaults.sorting),
            filters: Object.assign({}, Data.defaults.filters),
            page: 1,
            selectedAnimeId: false,
        })
    }

    // Go to a specific results page
    changePage(pageNumber) {
        this.setState({
            page: pageNumber,
        })
    }

    // Open the info box for the selected anime
    openInfoBox(animeId) {
        this.setState({
            selectedAnimeId: animeId,
        }, () => document.body.classList.add('modal-open'))
    }

    // Close the info box
    closeInfoBox() {
        this.setState({
            selectedAnimeId: false,
        }, () => document.body.classList.remove('modal-open'))
    }

    // Get the current sorting order
    getSorting() {
        return this.state.sort
    }

    // Get the current filters
    getFilters() {
        return this.state.filters
    }

    render() {
        const { anime, searchQuery, page, selectedAnimeId, messageClasses, messageText } = this.state

        return (
            <Fragment>
                <div className="fnheader">
                    <h1>Anime List <a href="https://fncombo.me"><span>fn</span><span>combo</span></a></h1>
                </div>
                <div className="container-main">
                    <div className="container-fluid container-limited">
                        <Filters
                            anime={anime}
                            searchQuery={searchQuery}
                            update={this.update}
                            reset={this.reset}
                            getFilters={this.getFilters}
                        />
                        <Table
                            anime={anime}
                            searchQuery={searchQuery}
                            page={page}
                            update={this.update}
                            openInfoBox={this.openInfoBox}
                            changePage={this.changePage}
                            getSorting={this.getSorting}
                        />
                    </div>
                    <Statistics anime={anime} />
                    <div className="container-fluid gallery">
                        <Gallery anime={anime} openInfoBox={this.openInfoBox} />
                    </div>
                </div>
                {/* Close when clicking outside of the modal-content window */}
                <div className="modal" onClick={event => event.target.className === 'modal' ? this.closeInfoBox() : false}>
                    <div className="modal-dialog modal-dialog-centered">
                        <InfoBox
                            selectedAnimeId={selectedAnimeId}
                            openInfoBox={this.openInfoBox}
                            closeInfoBox={this.closeInfoBox}
                        />
                    </div>
                </div>
                <div id="message" className={messageClasses}>{messageText}</div>
            </Fragment>
        )
    }
}