import { FilterNames, Filters } from '../data/Filters'

/**
 * Make a default nested object of counts for each filter name and value that starts counting at 0
 */
function makeFilterCounts() {
    return FilterNames.reduce((filterNamesObject, filterName) => {
        filterNamesObject[filterName] = Filters[filterName].values.reduce((filterValuesObject, filterValue) => {
            filterValuesObject[filterValue] = 0

            return filterValuesObject
        }, {})

        return filterNamesObject
    }, {})
}

export {
    makeFilterCounts,
}
