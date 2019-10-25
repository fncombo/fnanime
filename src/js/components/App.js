// React
import React, { useReducer, useEffect } from 'react'

// Libraries
import clone from 'clone'

// Style
import 'scss/App.scss'
import 'scss/fn.scss'

// Data
import { updated as updateTime } from 'js/data/data.json'
import { GlobalState, ACTIONS } from 'js/data/GlobalState'
import { DEFAULTS } from 'js/data/Data'

// Helpers
import { getApiData } from 'js/helpers/App'
import { getAnime, updateAnimeFromApi } from 'js/helpers/Data'
import 'js/helpers/FontAwesome'

// Components
import Filters from 'js/components/filters/Filters'
import Table from 'js/components/table/Table'
import Statistics from 'js/components/statistics/Statistics'
import Gallery from 'js/components/gallery/Gallery'
import UpdateMessage from 'js/components/UpdateMessage'

// Local data last update time
const UPDATE_TIME = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}).format(updateTime)

// Toggle to stop API from being updated
const SUPPRESS_API_UPDATE = false

// Initial global state
const INITIAL_STATE = {
    anime: getAnime(),
    searchQuery: '',
    activeSorting: clone(DEFAULTS.sorting),
    activeFilters: clone(DEFAULTS.filters),
    apiUpdated: SUPPRESS_API_UPDATE,
    apiError: false,
}

/**
 * Global state reducer.
 */
function globalReducer(state, action) {
    switch (action.type) {
    case ACTIONS.UPDATE_API_DATA:
        updateAnimeFromApi(action.newAnime)

        return {
            ...state,
            anime: getAnime(state.searchQuery, state.activeSorting, state.activeFilters),
            apiUpdated: true,
        }

    case ACTIONS.API_ERROR:
        return {
            ...state,
            apiUpdated: true,
            apiError: true,
        }

    case ACTIONS.SELECT_FILTER: {
        const activeFilters = {
            ...state.activeFilters,
            [action.filterName]: action.filterValue,
        }

        return {
            ...state,
            activeFilters,
            anime: getAnime(state.searchQuery, state.activeSorting, activeFilters),
        }
    }

    case ACTIONS.SEARCH:
        return {
            ...state,
            searchQuery: action.searchQuery,
            anime: getAnime(action.searchQuery, state.activeSorting, state.activeFilters),
        }

    case ACTIONS.CHANGE_SORTING:
        return {
            ...state,
            activeSorting: action.newSorting,
            anime: getAnime(state.searchQuery, action.newSorting, state.activeFilters),
        }

    case ACTIONS.RESET:
        return {
            ...state,
            anime: getAnime(),
            searchQuery: '',
            activeSorting: clone(DEFAULTS.sorting),
            activeFilters: clone(DEFAULTS.filters),
        }

    default:
        return state
    }
}

/**
 * ZA WARUDO
 */
function App() {
    const [ state, dispatch ] = useReducer(globalReducer, INITIAL_STATE)
    const { apiUpdated } = state

    useEffect(() => {
        if (apiUpdated || SUPPRESS_API_UPDATE) {
            return
        }

        // Update certain data from live API
        async function fetchData() {
            const newAnime = await getApiData()

            if (!newAnime) {
                dispatch({ type: ACTIONS.API_ERROR })

                return
            }

            dispatch({
                type: ACTIONS.UPDATE_API_DATA,
                newAnime,
            })
        }

        fetchData()
    }, [ apiUpdated ])

    return (
        <GlobalState.Provider value={{ state, dispatch }}>
            <div className="container">
                <Filters />
            </div>
            <Table />
            <div className="container statistics-container">
                <Statistics />
            </div>
            <Gallery />
            <div className="container">
                <ul className="updated-times has-text-centered">
                    <li>Local anime data last updated on {UPDATE_TIME}</li>
                    <li>MyAnimeList.net API data last updated {apiUpdated ? 'now' : `on ${UPDATE_TIME}`}</li>
                    <li>All rankings are my own subjective opinion</li>
                </ul>
            </div>
            <UpdateMessage />
        </GlobalState.Provider>
    )
}

// Exports
export default App
