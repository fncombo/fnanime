// React
import React, { Component, Fragment } from 'react'

// Style
import '../css/App.css'
import '../css/fn.css'

// Components
import Data from './Data'
import Filters from './Filters'
import Gallery from './Gallery'
import InfoBox from './InfoBox'
import Pagination from './Pagination'
import Statistics from './Statistics'
import Table from './Table'

// Main page, filters, sorting, search and all components
export default class Page extends Component {
    state = {
        anime: Data.results(),
        searchQuery: '',
        activeSorting: Object.assign([], Data.defaults.sorting),
        activeFilters: Object.assign({}, Data.defaults.filters),
        page: 1,
        selectedAnimeId: false,
        messageClasses: '',
        messageText: '',
        apiUpdated: false,
        isDetailView: Data.isDetailView,
    }

    constructor() {
        super()

        // Bind functions which need access to this
        this.update = this.update.bind(this)
        this.reset = this.reset.bind(this)
        this.changePage = this.changePage.bind(this)
        this.openInfoBox = this.openInfoBox.bind(this)
        this.closeInfoBox = this.closeInfoBox.bind(this)
    }

    // Update with latest API data after loading
    componentDidMount() {
        // Keyboard shortcuts
        document.addEventListener('keydown', event => {
            // ESC key to close the info box
            if (event.key === 'Escape' && this.state.selectedAnimeId) {
                this.closeInfoBox()
            }

            // Previous anime info box using left arrow when the info box is open
            if (event.key === 'ArrowLeft' && this.state.selectedAnimeId) {
                const prevAnime = Data.adjacentAnime('prev', this.state.selectedAnimeId)

                if (prevAnime) {
                    this.openInfoBox(Data.getAnime(prevAnime).id)
                }
            }

            // Next anime info box using right arrow when the info box is open
            if (event.key === 'ArrowRight' && this.state.selectedAnimeId) {
                const nextAnime = Data.adjacentAnime('next', this.state.selectedAnimeId)

                if (nextAnime) {
                    this.openInfoBox(Data.getAnime(nextAnime).id)
                }
            }

            // Shortcut to toggle detail view and save it in a cookie
            if (event.key === '.' && event.ctrlKey) {
                Data.setDetailView(!Data.isDetailView)

                this.setState({
                    isDetailView: !this.state.isDetailView,
                })
            }
        }, false)

        // Don't load API data in development mode
        if (process.env.NODE_ENV === 'development') {
            return
        }

        this.showMessage(<Fragment>Loading latest information&hellip;</Fragment>)

        // Update certain cached data from live API
        this.apiData = []

        this.getApiData(1, () => {
            this.apiData.forEach(anime => {
                // Update only this information
                Data.updateAnime(anime.mal_id, {
                    status: anime.watching_status,
                    rating: anime.score,
                    episodes: anime.total_episodes > 0 ? anime.total_episodes : null,
                    episodesWatched: anime.watched_episodes,
                })
            })

            // Update state with new anime data
            this.update()

            this.setState({
                apiUpdated: true,
            })

            this.showMessage('Updated!', 1500, 'success')
        })
    }

    // Get my anime list API data
    getApiData(page, callback) {
        fetch(`https://api.jikan.moe/v3/user/fncombo/animelist/all/${page}`).then(response =>
            response.json()
        ).then(apiData => {
            if (apiData.hasOwnProperty('error')) {
                console.error('API responded with an error:', apiData.error)
                this.showMessage('Error loading data from MyAnimeList.net', 1500, 'danger')
                return
            }

            // Add all anime from API
            this.apiData.push.apply(this.apiData, apiData.anime)

            // Since API only does 300 entries per responce, keep trying next page until we get everything
            if (apiData.anime.length === 300) {
                this.getApiData(page + 1, callback)
            } else {
                callback()
            }
        }, error => {
            console.error('Error while fetching API:', error)
            this.showMessage('Error loading data from MyAnimeList.net', 1500, 'danger')
        })
    }

    // Show a small message in the corner of the page
    showMessage(text, duration = false, status = 'black') {
        this.setState({
            messageClasses: `show bg-${status}`,
            messageText: text,
        })

        // Hide message after a duration if specified
        if (duration) {
            setTimeout(() => {
                this.setState({
                    messageClasses: `bg-${status}`,
                })
            }, duration)
        }
    }

    // Update search, sort and filters (or refresh anime results if no params)
    update(action, ...args) {
        let newState = Object.assign({}, this.state)

        // Updating a filter value
        if (args.length === 2) {
            // Correct strings coming from <option>
            if (args[1] === 'false') {
                args[1] = false
            }

            newState[action][args[0]] = args[1]

        // Everything else if it exists
        } else if (action && args.length) {
            newState[action] = args[0]
        }

        newState.anime = Data.results(newState.searchQuery, newState.activeSorting, newState.activeFilters)

        this.setState(newState)
    }

    // Reset all filters, sorting and search
    reset() {
        this.setState({
            anime: Data.results(),
            searchQuery: '',
            activeSorting: Object.assign([], Data.defaults.sorting),
            activeFilters: Object.assign({}, Data.defaults.filters),
            page: 1,
            selectedAnimeId: false,
            messageClasses: '',
            messageText: '',
        })
    }

    // Go to a specific results page
    changePage(page) {
        this.setState({ page })
    }

    // Open the info box for the selected anime or open the anime link in a new tab with middle click
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

    render() {
        const { anime, searchQuery, activeSorting, activeFilters, page, selectedAnimeId, messageClasses, messageText, apiUpdated, isDetailView } = this.state

        const updated = new Intl.DateTimeFormat('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(Data.localUpdated)

        return (
            <Fragment>
                <div className="fnheader">
                    <h1>Anime List <a href="https://fncombo.me">fncombo</a></h1>
                </div>
                <div className="container-main">
                    <div className="container-fluid container-limited">
                        <Filters
                            anime={anime}
                            searchQuery={searchQuery}
                            activeFilters={activeFilters}
                            isDetailView={isDetailView}
                            update={this.update}
                            reset={this.reset}
                        />
                        <Table
                            anime={anime}
                            searchQuery={searchQuery}
                            activeSorting={activeSorting}
                            isDetailView={isDetailView}
                            currentPage={page}
                            update={this.update}
                            openInfoBox={this.openInfoBox}
                        />
                        <Pagination
                            currentPage={page}
                            animeCount={anime.length}
                            changePage={this.changePage}
                        />
                        <Statistics
                            anime={anime}
                            isDetailView={isDetailView}
                        />
                    </div>
                    <div className="container-fluid gallery">
                        <Gallery
                            anime={anime}
                            isDetailView={isDetailView}
                            openInfoBox={this.openInfoBox}
                        />
                    </div>
                    <ul id="updated" className="container-fluid container-limited text-center">
                        {isDetailView && <li>Local anime data last updated on {updated}</li>}
                        <li>MyAnimeList.net API data last updated {apiUpdated ? 'now' : `on ${updated}`}</li>
                        <li>All rankings are my own subjective opinion</li>
                    </ul>
                </div>
                {/* Close when clicking outside of the modal-content window */}
                <div className="modal" onClick={event => event.target.className === 'modal' ? this.closeInfoBox() : undefined}>
                    <div className="modal-dialog modal-dialog-centered">
                        <InfoBox
                            selectedAnimeId={selectedAnimeId}
                            openInfoBox={this.openInfoBox}
                            closeInfoBox={this.closeInfoBox}
                            isDetailView={isDetailView}
                        />
                    </div>
                </div>
                <div id="message" className={messageClasses}>{messageText}</div>
            </Fragment>
        )
    }
}
