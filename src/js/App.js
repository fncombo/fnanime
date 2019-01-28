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
            if (event.code === 'Escape' && this.state.selectedAnimeId) {
                this.closeInfoBox()
            }

            // Previous anime info box using left arrow when the info box is open
            if (event.code === 'ArrowLeft' && this.state.selectedAnimeId) {
                const prevAnimeId = Data.adjacentAnime('prev', this.state.selectedAnimeId)

                if (!prevAnimeId) {
                    return
                }

                this.openInfoBox(Data.getAnime(prevAnimeId).id)
            }

            // Next anime info box using right arrow when the info box is open
            if (event.code === 'ArrowRight' && this.state.selectedAnimeId) {
                const nextAnimeId = Data.adjacentAnime('next', this.state.selectedAnimeId)

                if (!nextAnimeId) {
                    return
                }

                this.openInfoBox(Data.getAnime(nextAnimeId).id)
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

            // Update state with new anime data
            this.update()

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
                // setTimeout(() => {
                this.getApiData(page + 1, callback)
                // }, 2000)
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

    // Update search, sort and filters (or refresh anime results if no params)
    update(action, ...args) {
        let newState = Object.assign({}, this.state)

        // Updating a filter value
        if (args.length === 2) {
            // If the value is string false, we probably mean "false" keyword!
            if (args[1] === 'false') {
                args[1] = false
            }

            newState[action][args[0]] = args[1]

        // Everything else if it exists
        } else if (action && args.length) {
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

    // Open the info box for the selected anime or open the anime link in a new tab with middle click
    // 0 = left click, 1 = middle click
    openInfoBox(animeId, event) {

        // Click was not left click or middle click
        if (event && event.button > 1) {
            return
        }

        // Open anime link in a new tab on middle click
        if (event && event.button === 1) {
            window.open(`https://myanimelist.net/anime/${animeId}/${Data.getAnime(animeId).url}`, '_blank')
            return
        }

        // Open info box normally
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