// Modules
const fs = require('fs');
const async = require('async');
const getFolderSize = require('get-folder-size');
const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const sifter = require('sifter');
const cachedApi = require('./apidata.json');
const filesize = require('filesize');

console.time('All data processed and saved');

// ARIGATOU https://github.com/brianreavis/sifter.js/blob/master/lib/sifter.js#L444
const diacritics = {
    'a': '[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]',
    'b': '[b␢βΒB฿𐌁ᛒ]',
    'c': '[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]',
    'd': '[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]',
    'e': '[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]',
    'f': '[fƑƒḞḟ]',
    'g': '[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]',
    'h': '[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]',
    'i': '[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]',
    'j': '[jȷĴĵɈɉʝɟʲ]',
    'k': '[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]',
    'l': '[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]',
    'n': '[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]',
    'o': '[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]',
    'p': '[pṔṕṖṗⱣᵽƤƥᵱ]',
    'q': '[qꝖꝗʠɊɋꝘꝙq̃]',
    'r': '[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]',
    's': '[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]',
    't': '[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]',
    'u': '[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]',
    'v': '[vṼṽṾṿƲʋꝞꝟⱱʋ]',
    'w': '[wẂẃẀẁŴŵẄẅẆẇẈẉ]',
    'x': '[xẌẍẊẋχ]',
    'y': '[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]',
    'z': '[zŹźẐẑŽžŻżẒẓẔẕƵƶ]'
};

// Anime and misc data used for the page
let data = {
    anime: {},
};

// Anime folder locations
const foldersDir = 'g:/anime/series';
const filesDirs = [
    'g:/anime/movies',
    'g:/anime/ghibli movies',
    'g:/anime/special and ova',
];

// MAL URLs
const apiUrl = 'https://myanimelist.net/malappinfo.php?u=fncombo&status=all&type=anime';
const listUrl = 'https://myanimelist.net/animelist/fncombo';

// Rounding decimals (modified)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
const round = (value, exp = -2) => {
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');

    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
};

// Convert bytes to normal size (modified)
// https://stackoverflow.com/a/18650828/1561377
// This is needed because of the weird way MAL displays and rounds their values
const formatSize = (bytes, i, showLabel = true) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    i = (i === undefined ? Math.floor(Math.log(bytes) / Math.log(k)) : +i);

    return round((bytes / Math.pow(k, i)), -2) + (showLabel ? ' ' + sizes[i] : '');
};

// Filter unique array
// https://stackoverflow.com/a/14438954/1561377
const uniqueArray = (value, index, self) => {
    return self.indexOf(value) === index;
};

// Filter unique array for sub groups
const uniqueSubsArray = subs => {
    let allSubs = [];
    subs.forEach(subsInner => {
        // If more than 1 sub group, get them all
        if (subsInner.length > 1) {
            subsInner.forEach(sub => allSubs.push(sub))
            return;
        } else if (subsInner) {
            // Otherwise just push the one
            allSubs.push(subsInner[0]);
        }
    });

    return allSubs.filter(uniqueArray);
};

// Remove all diacritics, preserving case
const replaceDiacritics = title => {
    Object.entries(diacritics).forEach(([key, value]) => {
        title = title.split('').map(letter => {
            if (letter === letter.toUpperCase()) {
                return letter.replace(new RegExp(value, 'gi'), key.toUpperCase())
            }

            return letter.replace(new RegExp(value, 'gi'), key.toLowerCase())
        }).join('');
    });

    return title;
};

// Process local anime folders and files and merge them with MAL data
const processLocalData = (name, size) => {
    // Ignore rubbish
    if (/\.ini/.test(name)) {
        return;
    }

    // Get all data from the folder or file name
    const [, title, subs, resolution, source] = name.match(/([^\[]+)\s(?:\[([^\[]+)\])?\[(\d+)p\]\[?(\.?\w+)\]?(?:\.\w+)?/);

    // Figure out the anime's ID from MAL data
    let id = false;

    new sifter(data.anime).search(title, {
        fields: [
            'title',
        ],
        conjunction: 'and',
        limit: 1,
    }).items.forEach(item => {
        id = data.anime[item.id].id;
    });

    if (!id) {
        console.error(`"${title}" not found in MAL data!`);
        return;
    }

    // Add in local data and mark it as present locally
    data.anime[id].title = replaceDiacritics(data.anime[id].title);
    data.anime[id].localTitle = title;
    data.anime[id].downloaded = true;
    data.anime[id].subGroup = subs.split('-');
    data.anime[id].resolution = parseInt(resolution);
    data.anime[id].source = (source.includes('.') ? 'BD' : source);
    data.anime[id].size = size;
    // data.anime[id].displaySize = filesize(size);
    data.anime[id].sizeMatches = (data.anime[id].malSize === round(formatSize(size, 3, false), -1));
    // data.anime[id].epSize = size / data.anime[id].episodes;
    // data.anime[id].displayEpSize = filesize(size / data.anime[id].episodes);
};

// Get MAL API XML
console.log('Getting MAL API XML');
fetch(apiUrl).then(res =>
    res.text()
).then(body => {
    parseString(body, {
        // This library's defaults are dumb
        explicitArray: false,
        charsAsChildren: true,
    }, (err, result) => {
        if (err) {
            throw err;
        }

        console.log('Parsing MAL API XML');

        // Process each anime
        result.myanimelist.anime.forEach(anime => {
            const id = parseInt(anime.series_animedb_id);
            const synonyms = anime.series_synonyms ? anime.series_synonyms.split('; ').filter(name => name.length) : false;
            const type = parseInt(anime.series_type);
            const rating = parseInt(anime.my_score);
            const tags = anime.my_tags ? anime.my_tags.split(', ') : false;

            data.anime[id] = {
                // MAL data
                id: id,
                title: anime.series_title,
                synonyms: synonyms,
                type: type > 4 ? 7 : type,
                actualType: type,
                episodes: parseInt(anime.series_episodes),
                imageUrl: anime.series_image,
                status: parseInt(anime.my_status),
                rating: rating,
                rewatchCount: 0,
                watchedEpisodes: parseInt(anime.my_watched_episodes) || 0,
                malSize: 0,
                // Local data
                localTitle: '',
                downloaded: false,
                subGroup: false,
                resolution: undefined,
                source: 'ZMISS',
                size: 0,
                sizeMatches: false,
                // epSize: 0,
            };

            // If there are tags, try to get the rewatch count
            if (tags) {
                tags.forEach(tag => {
                    const match = tag.match(/re-?watched:\s(\d+)/i);
                    if (match) {
                        data.anime[id].rewatchCount = parseInt(match[1]);
                    }
                });
            }

            // Add other data from the Jikan API
            // data.anime[id].synopsis = cachedApi[id].synopsis;
            data.anime[id].url = cachedApi[id].link_canonical.match(/[^\/]+$/)[0];
            data.anime[id].related = false;
            // data.anime[id].averageRating = cachedApi[id].score;
            // data.anime[id].aired = cachedApi[id].aired_string;
            data.anime[id].duration = 0;

            // Get duration in minutes
            if (/per ep/i.test(cachedApi[id].duration)) {
                data.anime[id].duration = parseInt(cachedApi[id].duration);
            } else if (/hr/i.test(cachedApi[id].duration)) {
                const match = cachedApi[id].duration.match(/(\d+)\shr\.\s?(\d+)?/i);
                data.anime[id].duration = (parseInt(match[1]) * 60) + (match[2] ? parseInt(match[2]) : 0);
            } else {
                data.anime[id].duration = parseInt(cachedApi[id].duration);
            }

            // Clean up and add related anime
            if (!Array.isArray(cachedApi[id].related)) {
                Object.entries(cachedApi[id].related).forEach(([type, anime]) => {
                    // Don't include anything related that's not an anime
                    anime = anime.filter(anime => anime.type === 'anime')

                    if (!anime.length) {
                        return;
                    }

                    if (!data.anime[id].related) {
                        data.anime[id].related = {};
                    }

                    data.anime[id].related[type] = [];

                    anime.forEach(anime => {
                        // Rename
                        anime.id = anime.mal_id;
                        delete anime.mal_id;

                        // Remove type
                        delete anime.type;

                        // Remove undeeded part of the url
                        anime.url = anime.url.match(/[^\/]+$/)[0];

                        data.anime[id].related[type].push(anime);
                    });
                });
            }

        });

        getListHtml();
    });
});

// Get MAL list HTML
const getListHtml = () => {
    console.log('Getting MAL list HTML');

    fetch(listUrl).then(res =>
        res.text()
    ).then(body => {
        console.log('Parsing MAL list HTML');

        const dom = new JSDOM(body);

        // Go through each entry and try to get the storage size
        async.forEach(dom.window.document.querySelectorAll('.animetitle'), (el, callback) => {
            // Go up to the table row, .closest() doesn't seem to be supported
            const sizeEl = el.parentNode.parentNode.querySelector('span[title="EHD"]');
            if (sizeEl) {
                const id = el.href.match(/\/(\d+)\//)[1];
                data.anime[id].malSize = parseFloat(sizeEl.textContent.match(/\d+(?:\.\d+)*/)[0]);
            }

            callback();
        }, err => {
            if (err) {
                throw err;
            }

            getLocalFoldersData();
        });
    });
};

// Get all anime series folders
const getLocalFoldersData = () => {
    console.log('Getting and parsing local folder data');

    fs.readdir(foldersDir, (err, folders) => {
        if (err) {
            throw err;
        }

        async.forEach(folders, (folder, callback) => {
            getFolderSize(`${foldersDir}/${folder}`, (err, size) => {
                if (err) {
                    throw err;
                }

                processLocalData(folder, size);

                callback();
            });
        }, err => {
            if (err) {
                throw err;
            }

            getLocalFilesData();
        });
    });
};

// Get all anime movies, specials and OVAs, stores as single files
const getLocalFilesData = () => {
    console.log('Getting and parsing local movies, specials and OVAs data');

    async.forEach(filesDirs, (folder, callback) => {
        fs.readdir(folder, (err, files) => {
            if (err){
                throw err;
            }

            async.forEach(files, (file, callback) => {
                fs.stat(`${folder}/${file}`, (err, stats) => {
                    if (err) {
                        throw err;
                    }

                    processLocalData(file, stats.size);
                    callback();
                });
            }, err => {
                if (err) {
                    throw err;
                }

                callback();
            });
        });
    }, err => {
        if (err) {
            throw err;
        }

        getMiscData();
    });
};

const getMiscData = () => {
    console.log('Preparing misc data');

    // Anime sizes, no bigger than 50GB
    const sizes = Object.values(data.anime).map(anime => ((anime.size > 5e10) ? 0 : anime.size));
    const biggestSize = Math.max(...sizes);
    const smallestSize = Math.min(...sizes);

    // Episode sizes, no bigger than 20GB
    // const epSizes = Object.values(data.anime).map(anime => ((anime.epSize > 2e10) ? 0 : anime.epSize));
    // const epBiggestSize = Math.max(...epSizes);
    // const epSmallestSize = Math.min(...epSizes);

    // Calculate the "progress bar" display size for each anime
    Object.values(data.anime).forEach(anime => {
        const id = anime.id;

        // Delete not needed properties
        delete data.anime[id].malSize;

        const size = data.anime[id].size;
        data.anime[id].sizeWidth = (((size - smallestSize) / biggestSize) * 100) || 0;
        data.anime[id].sizeColor = ((size > (biggestSize * 0.75) ? 'danger' : (size > (biggestSize * 0.5) ? 'warning' : 'primary'))) || 0;

        // const epSize = data.anime[id].epSize;
        // data.anime[id].epSizeWidth = ((epSize - data.epSmallestSize) / data.epBiggestSize) * 100;
        // data.anime[id].epSizeColor = (epSize > (data.epBiggestSize * 0.75) ? 'danger' : (epSize > (data.epBiggestSize * 0.5) ? 'warning' : 'primary'));
    })

    // Possible filters
    const filters = ['subGroup', 'resolution', 'source', 'status', 'type', 'rating'];
    // data.filtersAll = {
    //     subGroup: 'All Sub Groups',
    //     resolution: 'All Resolutions',
    //     source: 'All Sources',
    //     status: 'All Statuses',
    //     type: 'All Types',
    // };

    // Possible filter values
    data.filterValues = {};
    filters.forEach(filter => {
        // Get all data for this filter
        let filterData = Object.values(data.anime).map(anime => anime[filter]);

        switch (filter) {
            case 'source':
                // Include empty source for "missing locally"
                filterData = filterData.filter(uniqueArray).map(value => value ? value : 'ZMISS').sort();
                break;

            case 'subGroup':
                filterData = uniqueSubsArray(filterData.filter(value => !!value)).sort();
                break;

            case 'resolution':
                // Correct sotring of resolutions (highest to lowest)
                filterData = filterData.filter(uniqueArray).filter(value => !!value).sort((a, b) => b - a);
                break;

            case 'rating':
                // Exclude the 0 rating and correct sorting (highest to lowest)
                filterData = filterData.filter(uniqueArray).filter(value => !!value).sort((a, b) => b - a);
                break;

            default:
                // Don't include empty values
                filterData = filterData.filter(uniqueArray).filter(value => !!value).sort();
                break;
        };

        filterData.unshift(false);

        data.filterValues[filter] = filterData;
    });

    // Definition lookups
    data.lookup = {
        subGroup: {
            false: 'All Sub Groups',
        },
        rating: {
            false: 'All Ratings',
            10:'10 - Masterpiece', //  10,
            9: '9 - Great', // 9,
            8: '8 - Very Good', // 8,
            7: '7 - Good', // 7,
            6: '6 - Fine', // 6,
            5: '5 - Average', // 5,
            4: '4 - Bad', // 4,
            3: '3 - Very Bad', // 3,
            2: '2 - Horrible', // 2,
            1: '1 - Appaling', // 1,
            0: '0 - Not Rated', // 'Not Rated',
        },
        // ratingVerbose: {
        //     10: 'Masterpiece',
        //     9: 'Great',
        //     8: 'Very Good',
        //     7: 'Good',
        //     6: 'Fine',
        //     5: 'Average',
        //     4: 'Bad',
        //     3: 'Very Bad',
        //     2: 'Horrible',
        //     1: 'Appaling',
        //     0: 'Not Rated',
        // },
        type: {
            false: 'All Types',
            1: 'TV',
            2: 'OVA',
            3: 'Movie',
            4: 'Special',
            // 5: 'ONA',
            // 6: 'Music',
            7: 'Other',
        },
        actualType: {
            1: 'TV',
            2: 'OVA',
            3: 'Movie',
            4: 'Special',
            5: 'ONA',
            6: 'Music',
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
            ZMISS: 'N/D',
        },
        sourceColor: {
            BD: 'success',
            TV: 'warning',
            DVD: 'warning',
            ZMISS: 'danger',
        },
    };

    data.defaultSort = [
        {
            field: 'status',
            direction: 'asc',
        }, {
            field: 'title',
            direction: 'asc',
        },
    ];

    data.defaultFilters = {};
    filters.map(filterName => data.defaultFilters[filterName] = false);

    // Table columns
    data.columns = {
        title: {
            name: 'Title',
            defaultSort: 'asc',
            size: '36.5%',
        },
        status: {
            name: 'Status',
            defaultSort: 'asc',
            size: '9%',
        },
        subGroup: {
            name: 'SubGroup',
            defaultSort: 'asc',
            size: '12.5%',
        },
        resolution: {
            name: 'Resolution',
            defaultSort: 'desc',
            size: '9%',
        },
        source: {
            name: 'Source',
            defaultSort: 'asc',
            size: 'auto',
        },
        rating: {
            name: 'Rating',
            defaultSort: 'desc',
            size: 'auto',
        },
        rewatchCount: {
            name: 'Rewatched',
            defaultSort: 'desc',
            size: '9%',
        },
        size: {
            name: 'Size',
            defaultSort: 'desc',
            size: '11%',
        },
    };

    saveDataFile();
};

// Save the JSON data file
const saveDataFile = () => {
    fs.writeFile('src/js/data.json', JSON.stringify(data), err => {
        if (err) {
            throw err;
        }

        console.timeEnd('All data processed and saved');
    })
};