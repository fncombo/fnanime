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
            2: 'primary',
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
        fileQuality: {
            false: 0,
            null: 0,
            1080: 5,
            720: 4,
            576: 3,
            480: 2,
            360: 1,
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

// Array of all filter names
const FilterNames = Object.keys(Filters)

// Exports
export {
    Filters,
    FilterNames,
}
