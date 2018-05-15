// Libraries
import Sifter from 'sifter'
import FuzzySort from 'fuzzysort'

// Data
import data from './data.json'

// Cached values of the anime object
const anime = Object.values(data.anime)

// Search, sort and filter anime
export default function Results (searchQuery = '', sort = data.defaultSort, filters = data.defaultFilters) {
    // Whether any filters are active
    const filtersActive = !!Object.values(filters).filter(value => !!value).length

    // Temporary results while filtering
    let results = []
    let tempResults = []

    // Final results to show
    let finalResults = []

    // Add sorting alphabetically by title if not already,
    // to make it more consistent and predictable
    let actualSort = Object.assign([], sort)

    if (!actualSort.some(sort => sort.field === 'title')) {
        actualSort.push({
            field: 'title',
            direction: 'asc',
        })
    }

    // Go through each filter if there are any, narrowing down results each time
    if (filtersActive) {
        Object.entries(filters).forEach(([filterName, value], i) => {
            // Always use cached results past the first filter
            const resultsToUse = i === 0 ? anime : results

            tempResults = []

            // Search this exact filter value in the needed property,
            new Sifter(resultsToUse).search(value, {
                fields: [filterName],
            }).items.forEach(item => tempResults.push(resultsToUse[item.id]))

            results = tempResults
        })
    }

    const resultsToUse = filtersActive ? results : anime

    // Perform the search query (if any)
    if (searchQuery.length) {

        tempResults = []

        FuzzySort.go(searchQuery, resultsToUse, {
            keys: [
                'title',
                'localTitle',
            ],
            threshold: -150,
        }).forEach(item => tempResults.push(data.anime[item.obj.id]))
    }

    // Final sorting
    const finalResultsToUse = searchQuery.length ? tempResults : resultsToUse

    new Sifter(finalResultsToUse).search('', {
        fields: ['title'],
        sort: actualSort,
    }).items.forEach(item => finalResults.push(finalResultsToUse[item.id]))

    return finalResults
}