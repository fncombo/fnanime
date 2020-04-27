import { createContext } from 'react'

// Contexts
const GlobalState = createContext(null)
const FiltersState = createContext(null)
const TableState = createContext(null)
const ModalState = createContext(null)

// Reducer actions
const ACTIONS = {
    UPDATE_API_DATA: Symbol('UPDATE_API_DATA'),
    API_ERROR: Symbol('API_ERROR'),
    SELECT_FILTER: Symbol('SELECT_FILTER'),
    SEARCH: Symbol('SEARCH'),
    RESET: Symbol('RESET'),
    CHANGE_SORTING: Symbol('CHANGE_SORTING'),
    NEXT_PAGE: Symbol('NEXT_PAGE'),
    PREV_PAGE: Symbol('PREV_PAGE'),
    SET_PAGE: Symbol('SET_PAGE'),
    PREV_ANIME: Symbol('PREV_ANIME'),
    NEXT_ANIME: Symbol('NEXT_ANIME'),
}

export { ACTIONS, GlobalState, FiltersState, TableState, ModalState }
