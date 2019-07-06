// Libraries
import FuzzySort from 'fuzzysort'
import ObjectHash from 'object-hash'
import FastSort from 'fast-sort'

// Anime
import anime from './anime.json'
import updated from './updated.json'

class Data {
    // Anime from the JSON
    animeObject = anime

    // The time this data was last updated
    localUpdated = updated.updated

    // Saved data from API
    cachedApiData = {}

    // Latest anime array given to the table
    anime = null

    filters = {
        type: {
            descriptions: {
                false: 'All Types',
                1: 'TV',
                2: 'OVA',
                3: 'Movie',
                4: 'Special',
                5: 'ONA',
                6: 'Music',
                7: 'Other',
            },
            colorCodes: {
                false: '',
                null: 'black',
                1: 'TV',
                2: 'OVA',
                3: 'Movie',
                4: 'Special',
                5: 'ONA',
                6: 'Music',
                7: 'Other',
            },
        },
        status: {
            descriptions: {
                false: 'All Statuses',
                1: 'Watching',
                2: 'Completed',
                3: 'On-Hold',
                4: 'Dropped',
                5: 'Unknown',
                6: 'Planned',
            },
            colorCodes: {
                false: '',
                null: 'black',
                1: 'success',
                2: 'info',
                3: 'warning',
                4: 'danger',
                5: 'danger',
                6: 'secondary',
            },
        },
        rating: {
            descriptions: {
                false: 'All Ratings',
                null: 'black',
                10:'10 \u2013 Masterpiece / Favourite',
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
            colorCodes: {

            },
            specialValuesProcess: values => {
                // Exclude blank values and reverse sort
                return values.filter(value => !!value).sort((a, b) => b - a)
            },
        },
        subs: {
            descriptions: {
                false: 'All Subtitles',
            },
            specialValuesProcess: values => {
                // Exclude blank values
                return values.filter(value => !!value)
            },
        },
        resolution: {
            descriptions: {
                false: 'All Resolutions',
                null: 'Unknown',
                1080: '1080p',
                720: '720p',
                576: '576p',
                480: '480p',
                360: '360p',
            },
            colorCodes: {
                false: '',
                null: 'black',
                1080: 'success',
                720: 'warning',
                576: 'warning',
                480: 'danger',
                360: 'danger',
            },
            specialValuesProcess: values => {
                // Reverse sort
                return values.sort((a, b) => b - a)
            },
        },
        source: {
            descriptions: {
                false: 'All Sources',
                null: 'Unknown',
                BD: 'BD',
                TV: 'TV',
                Web: 'Web',
                DVD: 'DVD',
            },
            colorCodes: {
                false: '',
                null: 'black',
                BD: 'success',
                TV: 'warning',
                Web: 'warning',
                DVD: 'warning',
            },
        },
        videoCodec: {
            descriptions: {
                false: 'All Video Codecs',
                null: 'Unknown',
                'H.265': 'HEVC H.265',
                'H.264': 'AVC H.264',
            },
            colorCodes: {
                false: '',
                null: 'black',
                'H.265': 'success',
                'H.264': 'warning',
            },
        },
        audioCodec: {
            descriptions: {
                false: 'All Audio Codecs',
                null: 'Unknown',
                FLAC: 'FLAC',
                DTS: 'DTS',
                AAC: 'AAC',
                AC3: 'AC3',
            },
            colorCodes: {
                false: '',
                null: 'black',
                FLAC: 'success',
                DTS: 'success',
                AAC: 'warning',
                AC3: 'warning',
            },
        },
    }

    // Defaults
    defaults = {
        // Table sorting first by status then by title
        sorting: {
            status: 'asc',
            title: 'asc',
        },
        // Filtering is populated later based on all available fitlers
        filters: {},
        // Rows per table page
        animePerPage: 25,
        // Number of buttons beside the current page button
        pageButtons: 2,
    }

    // Storage size limits
    storageSizeLimits = {
        total: {
            min: 1073741824, // 1GB
            max: 53687091200, // 50 GB
            medium: 53687091200 * 0.5,
            large: 53687091200 * 0.75,
        },
        episode: {
            min: 52428800, // 50 MB
            max: 2147483648, // 2GB
            medium: 2147483648 * 0.5,
            large: 2147483648 * 0.75,
        },
    }

    // Column sizes
    smallColumn = '5%'
    mediumColumn = '8%'
    largeColumn = '12%'

    // Columns setup
    columns = {
        title: {
            text: 'Title',
            defaultSorting: 'asc',
            size: '28%',
            detailViewOnly: false,
        },
        status: {
            text: 'Status',
            defaultSorting: 'asc',
            size: this.largeColumn,
            detailViewOnly: false,
        },
        rating: {
            text: 'Rating',
            defaultSorting: 'desc',
            size: this.smallColumn,
            detailViewOnly: false,
        },
        rewatchCount: {
            text: 'Rewatched',
            defaultSorting: 'desc',
            size: this.mediumColumn,
            detailViewOnly: false,
        },
        subs: {
            text: 'Subtitles',
            defaultSorting: 'asc',
            size: this.mediumColumn,
            detailViewOnly: true,
        },
        resolution: {
            text: 'Resolution',
            defaultSorting: 'desc',
            size: this.mediumColumn,
            detailViewOnly: true,
        },
        source: {
            text: 'Source',
            defaultSorting: 'desc',
            size: this.smallColumn,
            detailViewOnly: true,
        },
        videoCodec: {
            text: 'Video',
            defaultSorting: 'desc',
            size: this.smallColumn,
            detailViewOnly: true,
        },
        audioCodec: {
            text: 'Audio',
            defaultSorting: 'desc',
            size: this.smallColumn,
            detailViewOnly: true,
        },
        episodeSize: {
            text: 'Episode Size',
            defaultSorting: 'desc',
            size: this.mediumColumn,
            detailViewOnly: true,
        },
        size: {
            text: 'Total Size',
            defaultSorting: 'desc',
            size: this.mediumColumn,
            detailViewOnly: true,
        },
    }

    constructor() {
        // Process data
        Object.keys(this.animeObject).forEach(animeId => {
            let anime = this.animeObject[animeId]
            anime.episodeSize = anime.size && anime.episodes ? anime.size / anime.episodes : null
        }, this)

        // Only the anime entries for sorting
        this.animeArray = Object.values(this.animeObject)

        // Go through each filter
        Object.entries(this.filters).forEach(([filterName]) => {
            // Populate only the filter values which have any data to them
            let filterValues = this.animeArray
                .map(anime => anime[filterName])
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter(value => value !== false)
                .sort()

            // Apply any special processing for this filter
            if (this.filters[filterName].hasOwnProperty('specialValuesProcess')) {
                filterValues = this.filters[filterName].specialValuesProcess(filterValues)
            }

            // Add the "all" option at the start
            filterValues.unshift(false)

            // Set the default value for this filter
            this.defaults.filters[filterName] = false

            this.filters[filterName].values = filterValues
        }, this)

        // Get the cookie related to showing detailed view
        this.isDetailView = localStorage.getItem('detailView') === 'true'
    }

    // Set a cookie to show or not show detailed view
    setDetailView(active) {
        document.cookie = localStorage.setItem('detailView', active)
    }

    // Get the size of column by its index instead of property name
    getColumnSize(index) {
        return Object.entries(this.columns)[index][1].size
    }

    // Whether a column should only display in detail view
    getColumnVisibility(index, isDetailView) {
        return isDetailView ? true : !Object.entries(this.columns)[index][1].detailViewOnly
    }

    // Get more data about an anime either form API or saved if already called
    getAnimeApiData(animeId, callback, errorCallback) {
        // Return cached data
        if (this.cachedApiData.hasOwnProperty(animeId)) {
            callback(this.cachedApiData[animeId])
            return
        }

        fetch(`https://api.jikan.moe/v3/anime/${animeId}`).then(response =>
            response.json()
        ).then(apiData => {
            // Handle errors
            if (apiData.hasOwnProperty('error')) {
                console.error('API responded with an error:', apiData.error)
                errorCallback(apiData.error)
                return
            }

            // Save this so we don't have to fetch it in the future
            this.cachedApiData[animeId] = apiData

            callback(apiData)

        }, error => {
            // Handle errors
            console.error('Error while fetching API:', error)
            errorCallback(error)
        })
    }

    // Update info about an anime
    updateAnime(animeId, newData) {
        // Don't update is anime doesn't exist
        if (!this.animeExists(animeId)) {
            return
        }

        this.animeObject[animeId] = Object.assign(this.animeObject[animeId], newData)

        // Update hash
        this.animeObject[animeId].hash = ObjectHash(this.animeObject[animeId], {
            excludeKeys: key => key === 'hash',
        })
    }

    // Get a certain anime by ID
    getAnime(animeId) {
        return this.animeObject[animeId]
    }

    // Check if an anime exists by ID
    animeExists(animeId) {
        return this.animeObject.hasOwnProperty(animeId)
    }

    // Convert duration from API into minutes
    convertDuration(duration) {
        // Convert hours into minutes
        if (/hr/i.test(duration)) {
            const match = duration.match(/(\d+)\s?hr\.?\s?(\d+)?/i)

            return (parseInt(match[1], 10) * 60) + (match[2] ? parseInt(match[2], 10) : 0)
        }

        return parseInt(duration, 10)
    }

    // Get the previous or next anime in the current results list
    adjacentAnime(direction, animeId) {
        const index = this.anime.findIndex(anime => anime.id === animeId)

        // Anime is not in table, so can't show next/prev in relation to it
        if (index === -1) {
            return false
        }

        switch (direction) {
        case 'next':
            // Last anime, can't get next
            if (index === this.anime.length - 1) {
                return false
            }

            return this.anime[index + 1].id

        case 'prev':
            // First anime, can't get previous
            if (index === 0) {
                return false
            }

            return this.anime[index - 1].id

        default:
            return false
        }
    }

    // Search, sort and filter anime
    results(searchQuery = '', sorting = this.defaults.sorting, filters = this.defaults.filters) {
        // Start with all the anime
        let results = this.animeArray

        // Add sorting alphabetically by title if not already, to make it more consistent and predictable
        if (!sorting.hasOwnProperty('title')) {
            // Copy to not modify actual sorting settings
            sorting = Object.assign({}, sorting, {
                title: 'asc',
            })
        }

        // Go through each filter, narrowing down results each time, but don't filter when there is no value
        Object.entries(filters).filter(([, filterValue]) => filterValue !== false).forEach(([filterName, filterValue]) => {
            results = results.filter(anime => anime[filterName] === filterValue)
        }, this)

        // Perform the search query if there is one
        if (searchQuery.length) {
            results = FuzzySort.go(searchQuery, results, {
                keys: ['title'],
                threshold: -150,
            }).map(item => this.animeObject[item.obj.id])
        }

        // Finally apply all sorting
        FastSort(results).by(Object.entries(sorting).map(([column, direction]) => {
            return { [direction]: column }
        }))

        // Save last results
        this.anime = results

        return results
    }
}

export default new Data()
