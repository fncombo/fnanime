import React, { useReducer, useEffect } from 'react'

import clone from 'clone'

import 'src/styles/App.scss'
import 'src/styles/fn.scss'

import { updated as updateTime } from 'src/data/data.json'
import { GlobalState, ACTIONS } from 'src/data/GlobalState'
import { DEFAULTS } from 'src/data/Data'

import { getApiData, getUrlQueryStringData, updateUrlQueryString, resetUrlQueryString } from 'src/helpers/App'
import { getAnime, updateAnimeFromApi } from 'src/helpers/Data'
import 'js/helpers/FontAwesome'

import Filters from 'src/components/filters/Filters'
import Table from 'src/components/table/Table'
import Statistics from 'src/components/statistics/Statistics'
import Gallery from 'src/components/gallery/Gallery'
import UpdateMessage from 'src/components/UpdateMessage'

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

            updateUrlQueryString(state.searchQuery, state.activeSorting, activeFilters)

            return {
                ...state,
                activeFilters,
                anime: getAnime(state.searchQuery, state.activeSorting, activeFilters),
            }
        }

        case ACTIONS.SEARCH:
            updateUrlQueryString(action.searchQuery, state.activeSorting, state.activeFilters)

            return {
                ...state,
                searchQuery: action.searchQuery,
                anime: getAnime(action.searchQuery, state.activeSorting, state.activeFilters),
            }

        case ACTIONS.CHANGE_SORTING:
            updateUrlQueryString(state.searchQuery, action.newSorting, state.activeFilters)

            return {
                ...state,
                activeSorting: action.newSorting,
                anime: getAnime(state.searchQuery, action.newSorting, state.activeFilters),
            }

        case ACTIONS.RESET:
            resetUrlQueryString()

            return {
                ...state,
                anime: getAnime(),
                searchQuery: '',
                activeSorting: clone(DEFAULTS.sorting),
                activeFilters: clone(DEFAULTS.filters),
            }

        case ACTIONS.UPDATE_FROM_HASH:
            return {
                ...state,
                ...action.urlData,
                anime: getAnime(action.urlData.searchQuery, action.urlData.activeSorting, action.urlData.activeFilters),
            }

        default:
            return state
    }
}

/**
 * ZA WARUDO
 */
export default function App() {
    const [state, dispatch] = useReducer(globalReducer, INITIAL_STATE)
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
    }, [apiUpdated])

    // Attempt to update state from URL on first load
    useEffect(() => {
        const urlData = getUrlQueryStringData()

        if (urlData) {
            dispatch({
                type: ACTIONS.UPDATE_FROM_HASH,
                urlData,
            })
        }
    }, [])

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
