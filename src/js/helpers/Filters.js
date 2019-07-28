import { Filters, FilterNames } from '../data/Filters'

/**
 * Make a default nested object of counts for each filter name and value that starts counting at 0
 */
function makeFilterCounts() {
    return FilterNames.reduce((object, filterName) => {
        object[filterName] = Filters[filterName].values.reduce((object, filterValue) => {
            object[filterValue] = 0

            return object
        }, {})

        return object
    }, {})
}

export {
    makeFilterCounts,
}
