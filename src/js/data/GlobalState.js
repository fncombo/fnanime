// React
import { createContext } from 'react'

// Contexts
const GlobalState = createContext()
const FiltersState = createContext()
const TableState = createContext()
const ModalState = createContext()

// Reducer actions
const ACTIONS = {
    UPDATE_API_DATA: Symbol(),
    API_ERROR: Symbol(),
    SELECT_FILTER: Symbol(),
    SEARCH: Symbol(),
    RESET: Symbol(),
    CHANGE_SORTING: Symbol(),
    NEXT_PAGE: Symbol(),
    PREV_PAGE: Symbol(),
    SET_PAGE: Symbol(),
    PREV_ANIME: Symbol(),
    NEXT_ANIME: Symbol(),
}

Object.freeze(ACTIONS)

// Exports
export {
    GlobalState,
    FiltersState,
    TableState,
    ModalState,
    ACTIONS,
}