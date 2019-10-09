// React
import React from 'react'

// Helpers
import Icon from 'js/helpers/Icon'

/**
 * Function to reverse sort filter values.
 */
function reverseSort(values) {
    return values.sort((a, b) => b - a)
}

/**
 * Function to exclude falsy filter values.
 */
function excludeBlankValues(values) {
    return values.filter(value => !!value)
}

/**
 * Descriptions and data related to all possible filters
 * Key:
 * `false` is "All" value for filtering purposes
 * `nul` is when anime is present locally, but has unknown values (e.g. no codec info)
 */
const FILTERS = {
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
            8: 'Unknown',
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
        fancyDescriptions: {
            false: 'All Statuses',
            1: <><Icon icon="play-circle" /> Watching</>,
            2: <><Icon icon="check-circle" /> Completed</>,
            3: <><Icon icon="pause-circle" /> On-Hold</>,
            4: <><Icon icon="times-circle" /> Dropped</>,
            5: <><Icon icon="question-circle" /> Unknown</>,
            6: <><Icon icon="plus-circle" /> Planned</>,
        },
        colorCodes: {
            1: 'success',
            2: 'info',
            3: 'warning',
            4: 'danger',
            5: 'danger',
            6: 'dark',
        },
    },
    airStatus: {
        descriptions: {
            1: 'Airing',
            2: 'Completed',
            3: 'Not Yet Aired',
        },
    },
    rating: {
        descriptions: {
            false: 'All Ratings',
            null: 'Not Rated',
            10: <>Masterpiece &ndash; 10</>,
            9: <>Great &ndash; 9</>,
            8: <>Very Good &ndash; 8</>,
            7: <>Good &ndash; 7</>,
            6: <>Fine &ndash; 6</>,
            5: <>Average &ndash; 5</>,
            4: <>Bad &ndash; 4</>,
            3: <>Very Bad &ndash; 3</>,
            2: <>Horrible &ndash; 2</>,
            1: <>Appalling &ndash; 1</>,
            0: 'Not Rated',
        },
        simpleDescriptions: {
            false: 'All Ratings',
            null: 'Not Rated',
            10: 'Masterpiece',
            9: 'Great',
            8: 'Very Good',
            7: 'Good',
            6: 'Fine',
            5: 'Average',
            4: 'Bad',
            3: 'Very Bad',
            2: 'Horrible',
            1: 'Appalling',
            0: 'Not Rated',
        },
        tinyDescriptions: {
            false: 'All Ratings',
            null: 'Not Rated',
            10: '10',
            9: '9',
            8: '8',
            7: '7',
            6: '6',
            5: '5',
            4: '4',
            3: '3',
            2: '2',
            1: '1',
            0: 'Not Rated',
        },
        detailedDescriptions: {
            null: 'Haven\'t rated these yet! I also don\'t rate dropped anime with less than 3 episodes watched.',
            10: 'My favourite anime. Unique, unforgettable, and entertaining. Definitely shaped me and my interests.',
            9: 'The best anime which were super enjoyable and interesting to watch, and remain very memorable.',
            // eslint-disable-next-line max-len
            8: 'Overall very enjoyable anime which were a pleasure to watch. Relevant to my interests and have nice themes.',
            // eslint-disable-next-line max-len
            7: 'Nice anime to pass the time, however nothing too special. These are average anime which I did not dislike watching.',
            // eslint-disable-next-line max-len
            6: 'Not terrible but not that good either that I\'d consider recommending. Starting to maybe forget what these were about.',
            // eslint-disable-next-line max-len
            5: 'Low effort recaps, confusing shorts, or bad movies. Might have made me question why I\'m still watching it.',
            // eslint-disable-next-line max-len
            4: 'Boring and not interesting. Only reason I probably didn\'t drop these is because 20 minutes a week was just about bearable.',
            // eslint-disable-next-line max-len
            3: 'I can\'t believe these had a budget approved for them. Wouldn\'t want to subject anyone to anime like these.',
            2: '',
            1: '',
            0: <>Haven't rated these yet! I also don't rate dropped anime with <a href="https://myanimelist.net/info.php?go=topanime" target="_blank" rel="noopener noreferrer">less than 20%</a> of the episodes watched.</>,
        },
        // Reverse sort
        specialValuesProcess: reverseSort,
    },
    subs: {
        descriptions: {
            false: 'All Releases',
        },
        // Exclude blank values
        specialValuesProcess: excludeBlankValues,
    },
    genres: {
        descriptions: {
            false: 'All Genres',
            1: 'Action',
            2: 'Adventure',
            3: 'Cars',
            4: 'Comedy',
            5: 'Dementia',
            6: 'Demons',
            7: 'Mystery',
            8: 'Drama',
            9: 'Ecchi',
            10: 'Fantasy',
            11: 'Game',
            12: 'Hentai',
            13: 'Historical',
            14: 'Horror',
            15: 'Kids',
            16: 'Magic',
            17: 'Martial Arts',
            18: 'Mecha',
            19: 'Music',
            20: 'Parody',
            21: 'Samurai',
            22: 'Romance',
            23: 'School',
            24: 'Sci Fi',
            25: 'Shoujo',
            26: 'Shoujo Ai',
            27: 'Shounen',
            28: 'Shounen Ai',
            29: 'Space',
            30: 'Sports',
            31: 'Super Power',
            32: 'Vampire',
            33: 'Yaoi',
            34: 'Yuri',
            35: 'Harem',
            36: 'Slice Of Life',
            37: 'Supernatural',
            38: 'Military',
            39: 'Police',
            40: 'Psychological',
            41: 'Thriller',
            42: 'Seinen',
            43: 'Josei',
        },
        // Exclude blank values
        specialValuesProcess: excludeBlankValues,
    },
    studios: {
        descriptions: {
            false: 'All Studios',
        },
        // Exclude blank values
        specialValuesProcess: excludeBlankValues,
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
            null: 'black',
            1080: 'green',
            720: 'yellow',
            576: 'orange',
            480: 'red',
            360: 'red',
        },
        fileQuality: {
            null: 0,
            1080: 5,
            720: 4,
            576: 3,
            480: 2,
            360: 1,
        },
        // Reverse sort
        specialValuesProcess: reverseSort,
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
            null: 'black',
            BD: 'green',
            TV: 'orange',
            Web: 'yellow',
            DVD: 'red',
        },
        fileQuality: {
            null: 0,
            BD: 5,
            TV: 3,
            Web: 4,
            DVD: 1,
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
            null: 'black',
            'H.265': 'green',
            'H.264': 'yellow',
        },
        fileQuality: {
            null: 0,
            'H.265': 5,
            'H.264': 4,
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
            Other: 'Other',
        },
        colorCodes: {
            null: 'black',
            FLAC: 'green',
            DTS: 'green',
            AAC: 'yellow',
            AC3: 'orange',
            Other: 'orange',
        },
        fileQuality: {
            null: 0,
            FLAC: 5,
            DTS: 5,
            AAC: 4,
            AC3: 3,
            Other: 2,
        },
    },
}

// All filter names
const FILTER_NAMES = Object.keys(FILTERS)

/**
 * Non-enumerable property which returns an object with counts of
 * how many anime match each filter name and filter value.
 */
Object.defineProperty(FILTERS, 'makeCounts', {
    value(allAnime) {
        // Make a nested blank object of filter names and values
        const filterCounts = FILTER_NAMES.reduce((filterNamesObject, filterName) => {
            filterNamesObject[filterName] = FILTERS[filterName].values.reduce((filterValuesObject, filterValue) => {
                filterValuesObject[filterValue] = 0

                return filterValuesObject
            }, {})

            return filterNamesObject
        }, {})

        // Loop through all anime and increment related filter value counts
        for (const anime of allAnime) {
            for (const filterName of FILTER_NAMES) {
                // If it's an array of filter values, go through each filter value inside and increment it
                if (Array.isArray(anime[filterName])) {
                    for (const singleFilterValue of anime[filterName]) {
                        filterCounts[filterName][singleFilterValue] += 1
                    }

                // Otherwise increment the count for this filter value normally
                } else {
                    const filterValue = anime[filterName]

                    filterCounts[filterName][filterValue] += 1
                }
            }
        }

        return filterCounts
    },
})

// Exports
export {
    FILTERS,
}
