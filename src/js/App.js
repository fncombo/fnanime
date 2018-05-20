// React
import React, { Component, Fragment } from 'react'

// Style
import '../css/App.css'

// Data
import data from './data.json'

// Components
import Results from './Results'
import Filters from './Filters'
import Table from './Table'
import Statistics from './Statistics'
import Gallery from './Gallery'
import InfoBox from './InfoBox'

// Main page, filters, sorting, search and all components
export default class Page extends Component {
    constructor() {
        super()

        // Default state
        this.state = {
            anime: Results(),
            searchQuery: '',
            sort: Object.assign([], data.defaultSort),
            filters: Object.assign({}, data.defaultFilters),
            page: 1,
            selectedAnimeId: false,
        }

        // Bind functions which need access to this.state
        this.update = this.update.bind(this)
        this.reset = this.reset.bind(this)
        this.changePage = this.changePage.bind(this)
        this.openInfoBox = this.openInfoBox.bind(this)
        this.closeInfoBox = this.closeInfoBox.bind(this)
        this.getSorting = this.getSorting.bind(this)
        this.getFilters = this.getFilters.bind(this)

        // Keyboard shortcuts
        document.addEventListener('keydown', event => {
            // ESC key to close the info box
            if (event.keyCode === 27 && this.state.selectedAnimeId) {
                this.closeInfoBox()
            }
        }, false)
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

        newState.anime = Results(newState.searchQuery, newState.sort, newState.filters)

        this.setState(newState)
    }

    // Reset all filters, sorting and search
    reset() {
        this.setState({
            anime: Results(),
            searchQuery: '',
            sort: Object.assign([], data.defaultSort),
            filters: Object.assign({}, data.defaultFilters),
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
        return (
            <Fragment>
                <div class="fnheader">
                    <h1>Anime List <a href="https://fncombo.me"><span>fn</span><span>combo</span></a></h1>
                </div>
                <div className="container-main">
                    <div className="container-fluid container-limited">
                        <Filters
                            anime={this.state.anime}
                            searchQuery={this.state.searchQuery}
                            update={this.update}
                            reset={this.reset}
                            getFilters={this.getFilters}
                        />
                        <Table
                            anime={this.state.anime}
                            searchQuery={this.state.searchQuery}
                            page={this.state.page}
                            update={this.update}
                            openInfoBox={this.openInfoBox}
                            changePage={this.changePage}
                            getSorting={this.getSorting}
                        />
                    </div>
                    <Statistics anime={this.state.anime} />
                    <div className="container-fluid gallery">
                        <Gallery anime={this.state.anime} openInfoBox={this.openInfoBox} />
                    </div>
                </div>
                {/* Close when clicking outside of the modal-content window */}
                <div className="modal" onClick={event => event.target.className === 'modal' ? this.closeInfoBox() : false}>
                    <div className="modal-dialog modal-dialog-centered">
                        <InfoBox
                            selectedAnimeId={this.state.selectedAnimeId}
                            openInfoBox={this.openInfoBox}
                            closeInfoBox={this.closeInfoBox}
                        />
                    </div>
                </div>
            </Fragment>
        )
    }
}