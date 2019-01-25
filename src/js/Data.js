// Libraries
import Sifter from 'sifter'
import FuzzySort from 'fuzzysort'

// Data
import data from './data.json'

// Anime
import anime from './anime.json'

export default class Data {
    // Prepare all the anime data
    static prepareData() {
        this.animeObject = anime
        this.animeArray = Object.values(anime)
    }

    // Error when failed to load API
    static loadingError() {
        alert('There was an error loading data from MyAnimeList.net, please try again.')
    }

    // Update info about an anime
    static updateAnime(id, data) {
        this.animeObject[id] = Object.assign(this.animeObject[id], data)
    }

    // Get a certain anime
    static getAnime(id) {
        return this.animeObject[id]
    }

    // Check if an anime exists by id
    static animeExists(id) {
        return this.animeObject.hasOwnProperty(id)
    }

    // Search, sort and filter anime
    static results(searchQuery = '', sort = data.defaultSort, filters = data.defaultFilters) {
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
                const resultsToUse = i === 0 ? this.animeArray : results

                tempResults = []

                // Search this exact filter value in the needed property,
                new Sifter(resultsToUse).search(value, {
                    fields: [filterName],
                }).items.forEach(item => tempResults.push(resultsToUse[item.id]))

                results = tempResults
            }, this)
        }

        const resultsToUse = filtersActive ? results : this.animeArray

        // Perform the search query (if any)
        if (searchQuery.length) {

            tempResults = []

            FuzzySort.go(searchQuery, resultsToUse, {
                keys: [
                    'title',
                    'localTitle',
                ],
                threshold: -150,
            }).forEach(item => tempResults.push(this.animeObject[item.obj.id]))
        }

        // Final sorting
        const finalResultsToUse = searchQuery.length ? tempResults : resultsToUse

        new Sifter(finalResultsToUse).search('', {
            fields: ['title'],
            sort: actualSort,
        }).items.forEach(item => finalResults.push(finalResultsToUse[item.id]))

        return finalResults
    }
}

Data.prepareData()