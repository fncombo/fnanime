// Libraries
import Sifter from 'sifter'
import FuzzySort from 'fuzzysort'

// Anime
import anime from './anime.json'

export default class Data {
    // Prepare all the anime data
    static prepareData() {
        // Anime data
        this.animeObject = anime
        this.animeArray = Object.values(anime)
        this.lastResults = null

        // Lookups (\u2013 is &endash;)
        this.lookup = {
            subs: {
                false: 'All Subtitles',
            },
            resolution: {
                false: 'All Resolutions',
                1080: '1080p',
                720: '720p',
                480: '480p',
                360: '360p',
            },
            resolutionColor: {
                1080: 'success',
                720: 'warning',
                480: 'danger',
                360: 'danger',
            },
            source: {
                false: 'All Sources',
                BD: 'BD',
                TV: 'TV',
                DVD: 'DVD',
                Unknown: 'Unknown',
            },
            sourceColor: {
                BD: 'success',
                TV: 'warning',
                DVD: 'warning',
                Unknown: 'danger',
            },
            status: {
                false: 'All Statuses',
                1: 'Watching',
                2: 'Completed',
                3: 'On-Hold',
                4: 'Dropped',
                5: '', // ??
                6: 'Planned',
            },
            statusColor: {
                1: 'watching',
                2: 'completed',
                3: 'onhold',
                4: 'dropped',
                5: '', // ??
                6: 'plantowatch',
            },
            type: {
                false: 'All Types',
                1: 'TV',
                2: 'OVA',
                3: 'Movie',
                4: 'Special',
                5: 'ONA',
                6: 'Music',
                7: 'Other',
            },
            rating: {
                false: 'All Ratings',
                10:'10 \u2013 Masterpiece',
                9: '9 \u2013 Great',
                8: '8 \u2013 Very Good',
                7: '7 \u2013 Good',
                6: '6 \u2013 Fine',
                5: '5 \u2013 Average',
                4: '4 \u2013 Bad',
                3: '3 \u2013 Very Bad',
                2: '2 \u2013 Horrible',
                1: '1 \u2013 Appaling',
                0: '0 \u2013 Not Rated',
            },
        }

        // Defaults
        this.defaults = {
            sorting: [
                {
                    field: 'status',
                    direction: 'asc',
                }, {
                    field: 'title',
                    direction: 'asc',
                },
            ],
            filters: {},
        }

        // Possible filters to work with
        this.filters = ['subs', 'resolution', 'source', 'status', 'type', 'rating']

        // Populate default filters
        this.filters.map(filterName => this.defaults.filters[filterName] = false)

        // Populate filter values with unique values to filter the table by
        this.filterValues = {}

        this.filters.forEach(filterName => {
            // Get all data for this filter
            let filterData = this.animeArray.map(anime => anime[filterName])

            switch (filterName) {
            case 'subs':
                // Unique, non-empty sub groups sorted alpahbetically
                filterData = this.uniqueSubs(filterData.filter(value => !!value)).sort()
                break

            case 'resolution':
                // Correct sotring of resolutions (highest to lowest)
                filterData = filterData.filter(this.uniqueArray).filter(value => !!value).sort((a, b) => b - a)
                break

            case 'rating':
                // Exclude the 0 rating and correct sorting (highest to lowest)
                filterData = filterData.filter(this.uniqueArray).filter(value => !!value).sort((a, b) => b - a)
                break

            default:
                // Don't include empty values
                filterData = filterData.filter(this.uniqueArray).filter(value => !!value).sort()
                break
            }

            // Add a default value to the start of every filter
            filterData.unshift(false)

            this.filterValues[filterName] = filterData
        }, this)



        // Storage size limits
        this.storageSizeLimits = {
            min: 1e9, // 1 GB
            max: 5e10, // 50 GB
        }
    }

    // Filter unique array
    // https://stackoverflow.com/a/14438954/1561377
    static uniqueArray(value, index, self) {
        return self.indexOf(value) === index
    }

    // Filter unique array for sub groups
    static uniqueSubs(subs) {
        let allSubs = []

        subs.forEach(subsInner => {
            // If more than 1 sub group, get them all
            if (subsInner.length > 1) {
                subsInner.forEach(sub => allSubs.push(sub))
                return

            // Otherwise just push the one
            } else if (subsInner) {
                allSubs.push(subsInner[0])
            }
        })

        return allSubs.filter(this.uniqueArray)
    }

    // Update info about an anime which exists already in the data
    static updateAnime(id, data) {
        if (!this.animeExists(id)) {
            return
        }

        this.animeObject[id] = Object.assign(this.animeObject[id], data)
    }

    // Get a certain anime data
    static getAnime(id) {
        return this.animeObject[id]
    }

    // Check if an anime exists by ID
    static animeExists(id) {
        return this.animeObject.hasOwnProperty(id)
    }

    // Get the previous or next anime in the current results list
    static adjacentAnime(direction, id) {
        let index = this.lastResults.findIndex(anime => anime.id === id)

        // Anime is not in table, so can't show next/prev in relation to it
        if (index === -1) {
            return false
        }

        switch (direction) {
        case 'next':
            // Last anime, can't get next
            if (index === this.lastResults.length - 1) {
                return false
            }

            return this.lastResults[index + 1].id

        case 'prev':
            // First anime, can't get previous
            if (index === 0) {
                return false
            }

            return this.lastResults[index - 1].id

        default:
            return false
        }
    }

    // Search, sort and filter anime
    static results(searchQuery = '', sort = this.defaults.sorting, filters = this.defaults.filters) {
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

        this.lastResults = finalResults

        return finalResults
    }
}

Data.prepareData()