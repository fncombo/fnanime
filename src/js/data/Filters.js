// React
import React from 'react'

// Helpers
import Icon from 'js/helpers/Icon'

// Descriptions and data related to all possible filters
const Filters = {
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
        colorCodes: {

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
            false: '',
            null: 'dark',
            1: 'success',
            2: 'info',
            3: 'warning',
            4: 'danger',
            5: 'danger',
            6: 'dark',
        },
    },
    rating: {
        descriptions: {
            false: 'All Ratings',
            null: 'black',
            10: <>Masterpiece &ndash; 10<Icon icon={[ 'fas', 'star' ]} /></>,
            9: <>Great &ndash; 9<Icon icon={[ 'fas', 'star' ]} /></>,
            8: <>Very Good &ndash; 8<Icon icon={[ 'fas', 'star' ]} /></>,
            7: <>Good &ndash; 7<Icon icon={[ 'fas', 'star' ]} /></>,
            6: <>Fine &ndash; 6<Icon icon={[ 'fas', 'star' ]} /></>,
            5: <>Average &ndash; 5<Icon icon={[ 'fas', 'star' ]} /></>,
            4: <>Bad &ndash; 4<Icon icon={[ 'fas', 'star' ]} /></>,
            3: <>Very Bad &ndash; 3<Icon icon={[ 'fas', 'star' ]} /></>,
            2: <>Horrible &ndash; 2<Icon icon={[ 'fas', 'star' ]} /></>,
            1: <>Appalling &ndash; 1<Icon icon={[ 'fas', 'star' ]} /></>,
            0: <>Not Rated &ndash; 0<Icon icon={[ 'fas', 'star' ]} /></>,
        },
        simpleDescriptions: {
            false: 'All Ratings',
            null: 'black',
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
        detailedDescriptions: {
            10: 'My favourite anime. Unique, unforgettable, and entertaining. Definitely shaped me and my interests.',
            9: 'The best anime which were super enjoyable and interesting to watch, and remain very memorable.',
            8: 'Overall very enjoyable anime which were a pleasure to watch. Relevant to my interests and have nice themes.',
            7: 'Nice anime to pass the time, however nothing too special. These are average anime which I did not dislike watching.',
            6: 'Not terrible but not that good either that I\'d consider recommending. Starting to maybe forget what these were about.',
            5: 'Low effort recaps, confusing shorts, or bad movies. Might have made me question why I\'m still watching it.',
            4: 'Boring and not interesting. Only reason I probably didn\'t drop these is because 20 minutes a week was just about bearable.',
            3: 'I can\'t believe these had a budget approved for them. Wouldn\'t want to subject anyone to anime like these.',
            2: '',
            1: '',
            0: '',
        },
        colorCodes: {

        },
        // Exclude blank values and reverse sort
        specialValuesProcess: values => values.filter(value => !!value).sort((a, b) => b - a),
    },
    subs: {
        descriptions: {
            false: 'All Releases',
        },
        // Exclude blank values
        specialValuesProcess: values => values.filter(value => !!value),
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
        fileQuality: {
            false: 0,
            null: 0,
            1080: 5,
            720: 4,
            576: 3,
            480: 2,
            360: 1,
        },
        // Reverse sort
        specialValuesProcess: values => values.sort((a, b) => b - a),
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
            DVD: 'danger',
        },
        fileQuality: {
            false: 0,
            null: 0,
            BD: 5,
            TV: 4,
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
            false: '',
            null: 'black',
            'H.265': 'success',
            'H.264': 'warning',
        },
        fileQuality: {
            false: 0,
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
            MPEG: 'MPEG',
        },
        colorCodes: {
            false: '',
            null: 'black',
            FLAC: 'success',
            DTS: 'success',
            AAC: 'warning',
            AC3: 'warning',
            MPEG: 'warning',
        },
        fileQuality: {
            false: 0,
            null: 0,
            FLAC: 5,
            DTS: 5,
            AAC: 4,
            AC3: 3,
            MPEG: 3,
        },
    },
}

/**
 * Non-enumerable property which returns an object with counts of
 * how many anime match each filter name and filter value.
 */
Object.defineProperty(Filters, 'makeCounts', {
    value: anime => {
        // Get all filter names
        const filterNames = Object.keys(Filters)

        // Make a nested blank object of filter names and values
        const filterCounts = filterNames.reduce((filterNamesObject, filterName) => {
            filterNamesObject[filterName] = Filters[filterName].values.reduce((filterValuesObject, filterValue) => {
                filterValuesObject[filterValue] = 0

                return filterValuesObject
            }, {})

            return filterNamesObject
        }, {})

        // Loop through all anime and increment related filter value counts
        for (const cartoon of anime) {
            for (const filterName of filterNames) {
                filterCounts[filterName][cartoon[filterName]] += 1
            }
        }

        return filterCounts
    },
})

// Exports
export {
    Filters,
}
