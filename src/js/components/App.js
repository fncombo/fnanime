// React
import React, { Suspense, lazy, useReducer, useEffect } from 'react'

// Style
import '../../css/App.css'
import '../../css/fn.css'

// Data
import LocalDataUpdateTime from '../data/LocalDataUpdated.json'
import { GlobalState, ACTIONS } from '../data/GlobalState'
import { Defaults, getAnime, updateAnimeData, createFilterDefaults } from '../data/Data'

// Helpers
import { getApiData } from '../helpers/App'

// Components
import FilterButtons from './Filters'
import Table from './Table'
const Statistics = lazy(() => import('./Statistics'))
const Gallery = lazy(() => import('./Gallery'))

// Local data last update time
const localDataUpdateTime = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}).format(LocalDataUpdateTime.updated)

// Toggle to stop API from being updated
const suppressApiUpdate = false

// Initial global state
const initialState = {
    anime: getAnime(),
    searchQuery: '',
    activeSorting: { ...Defaults.sorting },
    activeFilters: { ...Defaults.filters },
    apiUpdated: suppressApiUpdate,
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
            ...initialState,
            anime: getAnime(),
            apiUpdated: state.apiUpdated,
        }

    default:
        return state
    }
}

/**
 * ZA WARUDO
 */
function App() {
    const [ state, dispatch ] = useReducer(globalReducer, initialState)
    const { apiUpdated, apiError } = state
    let updateStatusMessage

    if (apiUpdated) {
        updateStatusMessage = apiError ? 'Error contacting API, update failed!' : 'Updated!'
    } else {
        updateStatusMessage = <>Loading latest information &hellip;</>
    }

    useEffect(() => {
        if (apiUpdated || suppressApiUpdate) {
            return
        }

        // Update certain cached data from live API
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
            newApiData.forEach(anime => {
                updateAnimeData(anime.mal_id, {
                    status: anime.watching_status,
                    rating: anime.score,
                    episodes: anime.total_episodes > 0 ? anime.total_episodes : null,
                    episodesWatched: anime.watched_episodes,
                })
            })

            // Re-create filter defaults based on new anime data
            createFilterDefaults()

            dispatch({ type: ACTIONS.UPDATE_API_DATA })
        }

        fetchData()
    }, [ apiUpdated ])

    return (
        <GlobalState.Provider value={{ state, dispatch }}>
            <div className="container-main">
                <div className="container-fluid container-limited">
                    <FilterButtons />
                    <Table />
                    <Suspense fallback={<Loading />}>
                        <Statistics />
                    </Suspense>
                </div>
                <Suspense fallback={<Loading />}>
                    <Gallery />
                </Suspense>
                <ul className="updated-times container-fluid container-limited text-center">
                    <li>Local anime data last updated on {localDataUpdateTime}</li>
                    <li>MyAnimeList.net API data last updated {apiUpdated ? 'now' : `on ${localDataUpdateTime}`}</li>
                    <li>All rankings are my own subjective opinion</li>
                </ul>
            </div>
            <div className={`message ${apiUpdated ? 'done' : ''}`}>
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
        <p className="alert alert-dark alert-loading my-3 text-center">
            Loading&hellip;
        </p>
    )
}

// Exports
export default App
