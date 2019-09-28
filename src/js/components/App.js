// React
import React, { Suspense, lazy, useReducer, useEffect } from 'react'

// Libraries
import clone from 'clone'
import classNames from 'classnames'

// Style
import 'scss/App.scss'
import 'scss/fn.scss'

// Data
import { updated as updateTime } from 'js/data/data.json'
import { GlobalState, ACTIONS } from 'js/data/GlobalState'
import { DEFAULTS, getAnime, updateAnimeData, createFilterDefaults } from 'js/data/Data'

// Helpers
import { getApiData } from 'js/helpers/App'
import 'js/helpers/FontAwesome'
import Icon from 'js/helpers/Icon'

// Components
import FilterButtons from 'js/components/Filters'
import Table from 'js/components/Table'
const Statistics = lazy(() => import('js/components/Statistics'))
const Gallery = lazy(() => import('js/components/Gallery'))

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
            [action.filterName]: action.filterValue === 'false' ? false : action.filterValue,
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
    const { apiUpdated, apiError } = state

    useEffect(() => {
        if (apiUpdated || SUPPRESS_API_UPDATE) {
            return
        }

        // Update certain data from live API
        async function fetchData() {
            let newApiData

            try {
                newApiData = await getApiData()
            } catch (error) {
                console.warn(error)

                dispatch({ type: ACTIONS.API_ERROR })

                return
            }

            // Update each anime's data
            for (const anime of newApiData) {
                updateAnimeData(anime.mal_id, {
                    status: anime.watching_status,
                    airStatus: anime.airing_status,
                    rating: anime.score,
                    episodes: anime.total_episodes,
                    episodesWatched: anime.watched_episodes,
                })
            }

            // Re-create filter defaults based on new anime data
            createFilterDefaults()

            dispatch({ type: ACTIONS.UPDATE_API_DATA })
        }

        fetchData()
    }, [ apiUpdated ])

    const messageClasses = classNames('message', apiUpdated ? 'is-done' : 'is-loading')
    let updateStatusMessage

    if (apiUpdated) {
        updateStatusMessage = apiError
            ? <><Icon icon="times-circle" /> Error contacting API</>
            : <><Icon icon="check-circle" /> Updated</>
    } else {
        updateStatusMessage = <><Icon icon="database" /> Loading latest information</>
    }

    return (
        <GlobalState.Provider value={{ state, dispatch }}>
            <div className="container">
                <FilterButtons />
            </div>
            <Table />
            <div className="container statistics-container">
                <Suspense fallback={<Loading />}>
                    <Statistics />
                </Suspense>
            </div>
            <Suspense fallback={<Loading />}>
                <Gallery />
            </Suspense>
            <div className="container">
                <ul className="updated-times has-text-centered">
                    <li>Local anime data last updated on {UPDATE_TIME}</li>
                    <li>MyAnimeList.net API data last updated {apiUpdated ? 'now' : `on ${UPDATE_TIME}`}</li>
                    <li>All rankings are my own subjective opinion</li>
                </ul>
            </div>
            <div className={messageClasses}>
                {updateStatusMessage}
            </div>
        </GlobalState.Provider>
    )
}

/**
 * Lazy component loading placeholder.
 */
function Loading() {
    return (
        <div className="container">
            <p className="notification">Loading&hellip;</p>
        </div>
    )
}

// Exports
export default App
