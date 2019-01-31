// Libraries
import FuzzySort from 'fuzzysort'
import ObjectHash from 'object-hash'
import Sifter from 'sifter'

// Anime
import anime from './anime.json'

class Data {
    // Anime data
    animeObject = anime
    animeArray = Object.values(anime)
    lastResults = null

    // Lookups (\u2013 is &endash;)
    lookup = {
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
            5: 'Unknown',
            6: 'Planned',
        },
        statusColor: {
            1: 'watching',
            2: 'completed',
            3: 'onhold',
            4: 'dropped',
            5: 'unknown',
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
    defaults = {
        // Table sorting
        sorting: [
            {
                field: 'status',
                direction: 'asc',
            }, {
                field: 'title',
                direction: 'asc',
            },
        ],
        // Filters
        filters: {},
        // Rows per table page
        perPage: 25,
        // Buttons beside the current page button
        pageButtons: 2,
    }

    // Possible filters to work with
    filters = ['subs', 'resolution', 'source', 'status', 'type', 'rating']

    // List of all values for each filter
    filterValues = {}

    // Storage size limits
    storageSizeLimits = {
        min: 1e9, // 1 GB
        max: 5e10, // 50 GB
        warning: 5e10 * 0.5, // 50% of max size for warning
        danger: 5e10 * 0.8, // 80% of max size for danger
    }

    // Prepare all the anime data
    constructor() {
        // Populate default filters
        this.filters.map(filterName => this.defaults.filters[filterName] = false)

        // Populate default filter values
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

            // Add a "default" value to the start of every filter
            filterData.unshift(false)

            this.filterValues[filterName] = filterData
        }, this)
    }

    // Filter unique array
    // https://stackoverflow.com/a/14438954/1561377
    uniqueArray(value, index, self) {
        return self.indexOf(value) === index
    }

    // Filter unique array for sub groups
    uniqueSubs(subs) {
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
    updateAnime(id, data) {
        if (!this.animeExists(id)) {
            return
        }

        this.animeObject[id] = Object.assign(this.animeObject[id], data)

        // Update hash
        delete this.animeObject[id].hash
        this.animeObject[id].hash = ObjectHash(this.animeObject[id], {
            excludeKeys: key => key === 'hash',
        })
    }

    // Get a certain anime data
    getAnime(id) {
        return this.animeObject[id]
    }

    // Check if an anime exists by ID
    animeExists(id) {
        return this.animeObject.hasOwnProperty(id)
    }

    // Get the anime's actual type as text
    getAnimeTypeText(id) {
        return this.lookup.type[this.animeObject[id].hasOwnProperty('typeActual') ? this.animeObject[id].typeActual : this.animeObject[id].type]
    }

    // Convert duration from MAL into minutes
    convertDuration(duration) {
        // Convert hours into minutes
        if (/hr/i.test(duration)) {
            const match = duration.match(/(\d+)\s?hr\.?\s?(\d+)?/i)
            duration = (parseInt(match[1], 10) * 60) + (match[2] ? parseInt(match[2], 10) : 0)
        } else {
            duration = parseInt(duration, 10)
        }

        return duration
    }

    // Get the previous or next anime in the current results list
    adjacentAnime(direction, id) {
        const index = this.lastResults.findIndex(anime => anime.id === id)

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

    // Apply a filter to a data set of anime
    filter(data, filterName, filterValue) {
        let results = []

        // Search this exact filter value in the needed property,
        new Sifter(data).search(filterValue, {
            fields: [filterName],
        }).items.forEach(item => results.push(data[item.id]))

        return results
    }

    // Apply a search query to a data set of anime
    search(data, searchQuery) {
        let results = []

        FuzzySort.go(searchQuery, data, {
            keys: ['title'],
            threshold: -150,
        }).forEach(item => results.push(this.animeObject[item.obj.id]))

        return results
    }

    // Apply sorting to a data set of anime
    sort(data, sort) {
        let results = []

        new Sifter(data).search('', {
            fields: ['title'],
            sort,
        }).items.forEach(item => results.push(data[item.id]))

        return results
    }

    // Search, sort and filter anime
    results(searchQuery = '', sort = this.defaults.sorting, filters = this.defaults.filters) {
        // Start with all the anime
        let results = this.animeArray

        // Add sorting alphabetically by title if not already, to make it more consistent and predictable
        if (!sort.some(sort => sort.field === 'title')) {
            // Copy to not modify actual sorting settings
            sort = Object.assign([], sort)

            sort.push({
                field: 'title',
                direction: 'asc',
            })
        }

        // Go through each filter if there are any, narrowing down results each time
        if (Object.values(filters).filter(value => !!value).length) {
            Object.entries(filters).forEach(([filterName, filterValue]) => {
                results = this.filter(results, filterName, filterValue)
            }, this)
        }

        // Perform the search query if there is one
        if (searchQuery.length) {
            results = this.search(results, searchQuery)
        }

        // Finally apply all sorting
        results = this.sort(results, sort)

        // Save last results
        this.lastResults = results

        return results
    }
}

export default new Data()