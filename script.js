(function () {

    // Configure DataTables
    $.fn.dataTable.ext.classes.sPageButton = 'btn btn-secondary';
    $.fn.dataTable.ext.classes.sPageButtonActive = 'btn-primary';

    // Rounding decimals (modified)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
    let round = (value, exp = -2) => {
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        value = value.toString().split('e');

        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    };

    // Convert bytes to normal size (modified)
    // https://stackoverflow.com/a/18650828/1561377
    let formatSize = (bytes, i, showLabel = true) => {
        let k = 1024;
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        i = (i === undefined ? Math.floor(Math.log(bytes) / Math.log(k)) : +i);

        return round((bytes / Math.pow(k, i)), -2) + (showLabel ? ' ' + sizes[i] : '');
    };

    // Filter unique array
    // https://stackoverflow.com/a/14438954/1561377
    let uniqueArray = (value, index, self) => {
        return self.indexOf(value) === index;
    };

    // Converting XML to JSON (modified)
    // https://gist.github.com/chinchang/8106a82c56ad007e27b1
    let xml2json = xml => {
        // Just text
        if (xml.nodeType === 3) {
            return xml.nodeValue;
        }

        // Do children
        if (xml.hasChildNodes()) {
            if (xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
                return xml.childNodes[0].nodeValue;
            }

            // Create the return object
            let obj = {};

            xml.childNodes.forEach(item => {
                let nodeName = item.nodeName;

                if (typeof obj[nodeName] === 'undefined') {
                    obj[nodeName] = xml2json(item);
                } else {
                    if (typeof obj[nodeName].push === 'undefined') {
                        let old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }

                    obj[nodeName].push(xml2json(item));
                }
            });

            return obj;
        }
    };

    // Clean-up anime title
    let cleanUpTitle = title => {
        return title.replace(/[:!"]/g, '').replace(/[\/\u2605]/g, ' ');
    };

    // Definition lookups
    let lookup = {
        rating: {
            10: 'Masterpiece',
            9: 'Great',
            8: 'Very Good',
            7: 'Good',
            6: 'Fine',
            5: 'Average',
            4: 'Bad',
            3: 'Very Bad',
            2: 'Horrible',
            1: 'Appaling',
        },
        type: {
            1: 'TV',
            2: 'OVA',
            3: 'Movie',
            4: 'Special',
            5: 'ONA',
            6: 'Music',
        },
        status: {
            1: 'Watching',
            2: 'Completed',
            3: 'On-Hold',
            4: 'Dropped',
            5: '', // ??
            6: 'Plan to Watch',
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
            BD: 'BD',
            TV: 'TV',
            DVD: 'DVD',
            false: 'Missing Locally',
        },
        sourceColor: {
            BD: 'success',
            TV: 'warning',
            DVD: 'danger',
        },
    };

    // Possible anime ratings
    let ratings = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    // Possible filters
    let filters = ['subs', 'resolution', 'source', 'status', 'type'];

    // Clean data
    let parser = new DOMParser();
    let animeData = {};

    // Parse MAL XML data
    xml2json(parser.parseFromString(malXML.replace(' \n', ''), 'text/xml')).myanimelist.anime.forEach(anime => {
        let id = parseInt(anime.series_animedb_id, 10);
        let synonyms = anime.series_synonyms ? anime.series_synonyms.split('; ') : undefined;
        let rating = parseInt(anime.my_score, 10);
        let tags = anime.my_tags ? anime.my_tags.split(', ') : undefined;

        animeData[id] = {
            // MAL data
            id: id,
            title: anime.series_title,
            synonyms: synonyms,
            type: parseInt(anime.series_type, 10),
            episodes: parseInt(anime.series_episodes, 10),
            imageUrl: anime.series_image,
            status: parseInt(anime.my_status, 10),
            rating: rating,
            tags: tags,
            rewatchCount: 0,
            malSize: undefined,
            // Local data
            local: false,
            subs: false,
            resolution: 0,
            source: false,
            size: 0,
            sizeMatches: false,
            epSize: 0,
            // Optimisation data
            compareTitle: cleanUpTitle(anime.series_title).toLowerCase(),
            compareSynonyms: synonyms ? synonyms.map(title => cleanUpTitle(title).toLowerCase()) : false,
        };

        if (tags) {
            tags.forEach(tag => {
                let match = tag.match(/re-?watched:\s(\d+)/i);
                if (match) {
                    animeData[id].rewatchCount = parseInt(match[1], 10);
                }
            });
        }
    });

    // Process and cache needed data from MAL HTML because it's too slow to look up individually
    parser.parseFromString(malHTML, 'text/html').querySelectorAll('.animetitle').forEach(el => {
        let id = el.href.match(/\/(\d+)\//)[1];
        let sizeEl = el.closest('tr').querySelector('span[title="EHD"]');
        if (sizeEl) {
            animeData[id].malSize = parseFloat(sizeEl.textContent.match(/\d+(?:\.\d+)*/)[0]);
        }
    });

    // Parse local data
    localRawData.forEach(line => {
        // Skip rows that are probably not anime
        if (!line.match(/](?:\.[a-z]{3})?#\d+$/)) {
            return;
        }

        // Get all data from the string
        let [, title, subs, resolution, source, size] = line.match(/([^\[]+)\s(?:\[([^\[]+)\])?\[(\d+)p\]\[?(\.?\w+)\]?(?:\.\w+)?#(\d+)/);

        // Figure out the anime's ID from MAL data
        let id = -1;

        let compareTitle = title.toLowerCase();
        Object.values(animeData).forEach(anime => {
            // if title matches directly             or there are synonyms and not season title and there is a match to a synonym
            if (anime.compareTitle === compareTitle || (anime.synonyms && !anime.compareTitle.match(/(?:2nd|3rd|4th) season/gi) && anime.compareSynonyms.some(title => title === compareTitle))) {
                id = anime.id;
            }
        });

        if (id === -1) {
            console.error(`"${title}" not found in MAL data!`);
            return;
        }

        // Add in local data and mark it as present locally
        animeData[id].title = title;
        animeData[id].local = true;
        animeData[id].subs = subs;
        animeData[id].resolution = parseInt(resolution, 10);
        animeData[id].source = (source.includes('.') ? 'BD' : source);
        animeData[id].size = parseInt(size, 10);
        animeData[id].sizeMatches = !!(animeData[id].malSize === round(formatSize(size, 3, false), -1));
        animeData[id].epSize = size / animeData[id].episodes;
    });

    // Anime data as an array
    let animeDataValues = Object.values(animeData);

    // Anime sizes, no bigger than 100GB
    let sizes = animeDataValues.map(anime => ((anime.size > 1e11) ? 0 : (anime.size || 0)));
    let biggestSize = Math.max(...sizes);
    let smallestSize = Math.min(...sizes);

    // Episode sizes, no bigger than 20GB
    let epSizes = animeDataValues.map(anime => ((anime.epSize > 2e10) ? 0 : (anime.epSize || 0)));
    let epBiggestSize = Math.max(...epSizes);
    let epSmallestSize = Math.min(...epSizes);

    // Create filtering buttons and dropdowns
    filters.forEach(filter => {
        // Get all column data in an array, make sure it's unique and sorted
        let data = animeDataValues.map(anime => anime[filter]);

        // Include empty source for "missing locally", otherwise discard
        if (filter === 'source') {
            data = data.filter(uniqueArray);
        } else {
            data = data.filter(uniqueArray).filter(value => !!value);
        }

        // Correct sotring of resolutions
        let sort = undefined;
        if (filter === 'resolution') {
            sort = (a, b) => (a === b ? 0 : (a < b ? 1 : -1));
        }

        // Create unique and sorted options
        data.sort(sort).forEach(value => {
            if (filter == 'subs') {
                $('#subs').append(`<option value="${value}">${value}</option>`);
                return;
            }

            $(`#${filter}`).append(`<button class="btn btn-secondary" style="width:${100 / data.length}%;" value="${value}">${lookup[filter][value]}</button>`);
        });
    });

    // Create data table
    let table = $('#anime').DataTable({
        data: animeDataValues,
        pageLength: 30,
        lengthChange: false,
        info: false,
        // Sort by status then by title
        order: [[1, 'asc'], [0, 'asc']],
        searchDelay: 400,
        language: {
            zeroRecords: 'No matching anime found.',
        },
        columns: [ {
            data: 'title',
            name: 'title',
            className: 'd-flex align-items-center',
            // Add image, type, status
            render: (data, type, row) => type === 'display' ? `
                <span class="anime-image" style="background-image: url(${row.imageUrl})"></span>
                <a class="mr-1 text-dark" href="https://myanimelist.net/anime/${row.id}/" target="_blank">
                    ${data.length > 32 ? `<span title="${data}">` + data.substr(0, 32) + '&hellip;</span>' : data}
                </a>
                <span class="text-secondary">${lookup.type[row.type]}</span>
                ` : data,
        }, {
            data: 'status',
            name: 'status',
            className: 'text-center',
            render: (data, type) => type === 'display' ? `<span class="text-${lookup.statusColor[data]} py-1 px-2 rounded">${lookup.status[data]}</span>` : data,
        }, {
            data: 'subs',
            name: 'subs',
            render: (data, type) => (type === 'display' && !data) ? '&mdash;' : data,
        }, {
            data: 'resolution',
            name: 'resolution',
            className: 'text-center',
            // Add colour and "p"
            render: (data, type) => {
                if (type !== 'display') {
                    return data;
                }

                return data ? `<span class="text-${lookup.resolutionColor[data]}">${lookup.resolution[data]}</span>` : '&mdash;';
            },
        }, {
            data: 'source',
            name: 'source',
            className: 'text-center',
            // Add colour
            render: (data, type) => {
                if (type !== 'display') {
                    return data;
                }

                return data ? `<span class="text-${lookup.sourceColor[data]}">${data}</span>` : '&mdash;';
            },
        }, {
            data: 'rating',
            name: 'rating',
            className: 'text-center',
            // Dash for missing ratings
            render: (data, type) => (type === 'display' && data === 0) ? `&mdash;` : data,
        }, {
            data: 'rewatchCount',
            name: 'rewatchCount',
            className: 'text-center',
            // Dash for missing count
            render: (data, type) => (type === 'display' && data === 0) ? `&mdash;` : data,
        }, {
            data: 'size',
            name: 'size',
            // Format and add a relative size bar indicator
            render: (data, type, row) => {
                if (type !== 'display') {
                    return data;
                }

                // Add relative size width bar and colour based on size
                let width = ((data - smallestSize) / biggestSize) * 100;
                let style = (data > (biggestSize * 0.75) ? 'danger' : (data > (biggestSize * 0.5) ? 'warning' : 'primary'));

                return `
                ${formatSize(data, 3)}
                <div class="progress bg-secondary rounded-0">
                    <div class="progress-bar bg-${style} rounded-0" style="width:${width}%"></div>
                </div>
                `;
            },
        }, {
            data: 'epSize',
            name: 'epSize',
            render: (data, type) => {
                if (type !== 'display') {
                    return data;
                }

                // Add relative size width bar and colour based on size
                let width = ((data - epSmallestSize) / epBiggestSize) * 100;
                let style = (data > (epBiggestSize * 0.75) ? 'danger' : (data > (epBiggestSize * 0.5) ? 'warning' : 'primary'));

                return `
                ${formatSize(data, 3)}
                <div class="progress bg-secondary rounded-0">
                    <div class="progress-bar bg-${style} rounded-0" style="width:${width}%"></div>
                </div>
                `;
            },
        }, {
            data: 'status',
            name: 'status',
            type: 'num',
            visible: false,
        }, {
            data: 'type',
            name: 'type',
            type: 'num',
            visible: false,
        } ],
        createdRow: (row, data, index) => {
            $('td', row).eq(7).addClass(data.sizeMatches ? '' : 'bg-danger').attr({
                'data-toggle': 'tooltip',
                'data-placement': 'left',
                'data-html': 'true',
                'data-title': data.sizeMatches ? 'Stored size matches with MyAnimeList.' : `Stored size doesn't match with MyAnimeList! (${row.malSize} GB)`,
            });

            if (!data.local) {
                $('td', row).slice(-2).remove();
                $(row).addClass('missing-locally').append('<td class="text-center" colspan="2">Missing Locally</td>');
            }
        },
        drawCallback: settings => {
            var api = new $.fn.dataTable.Api(settings);
            var currentFilterData = Object.values(api.rows({filter: 'applied'}).data()).filter(value => value.hasOwnProperty('title'));

            // Update filter button counts
            filters.forEach(filter => {
                let data = api.column(`${filter}:name`, {filter: 'applied'}).data();

                // Count how many anime of this type are
                let counts = {};
                data.toArray().forEach(value => {
                    if (counts.hasOwnProperty(value)) {
                        counts[value]++;
                        return;
                    }
                    counts[value] = 1;
                });

                // Update each dropdown
                if (filter === 'subs') {
                    $(`#${filter}`).find('option:not([data-value])').toArray().forEach(el => {
                        el.textContent = counts.hasOwnProperty(el.value) ? `${el.value} (${counts[el.value]})` : el.value;
                    });
                    return;
                }

                // Otherwise update each button
                $(`#${filter}`).find('button:not([data-value])').toArray().forEach(el => {
                    if (counts.hasOwnProperty(el.value)) {
                        el.textContent = `${lookup[filter][el.value]} (${counts[el.value]})`;
                        el.classList.remove('btn-disabled');
                        return;
                    }
                    el.textContent = lookup[filter][el.value]
                    el.classList.add('btn-disabled');
                });
            });

            // Statistics
            if (currentFilterData.length) {
                let missingLocally = currentFilterData.filter(anime => !anime.local).length;
                $('#stats').html(`Showing <strong>${currentFilterData.filter(anime => anime.local).length}</strong>${missingLocally ? ' (+  ' + missingLocally + ' missing locally)' : '' } anime occupying
                                <strong>${formatSize(currentFilterData.map(a => a.size || 0).reduce((a, b) => a + b))}</strong>,
                                updated ${batchUpdated.substr(0, 10)}`)
            } else {
                $('#stats').text('No matching anime found.');
            }

            // Temporary rating status
            let ratingCounts = {};

            // Clear current containers
            $('#ratings-gallery, #ratings-chart').html('');

            // Ratings gallery
            ratings.forEach(rating => {
                // See if there's any anime with this rating
                let currentlyRatedAnime = currentFilterData.filter(anime => anime.rating === rating);
                ratingCounts[rating] = currentlyRatedAnime.length || 0;
                if (!currentlyRatedAnime.length) {
                    return;
                }

                // Heading
                $('#ratings-gallery').append(`
                <hr>
                <h3 class="text-center">${rating}: ${lookup.rating[rating]} &ndash; ${currentlyRatedAnime.length} anime</h3>
                <div id="ratings-gallery-${rating}"></div>
                `);

                // Gallery
                currentFilterData.filter(anime => anime.rating === rating).forEach(anime => {
                    $(`#ratings-gallery-${rating}`).append(`
                    <div class="${anime.local ? '' : 'missing-locally'} bg-${lookup.status[anime.status].replace(/[- ]/g, '').toLowerCase()}"
                    data-toggle="tooltip"
                    data-placement="top"
                    data-html="true"
                    data-title="${anime.title}${anime.local ? '' : ' <span class=\'text-danger\'>(Missing locally)</span>'}">
                        <a href="https://myanimelist.net/anime/${anime.id}/" target="_blank"></a>
                        <span class="image" style="background-image: url(${anime.imageUrl});"></span>
                        <span class="type text-center">${lookup.type[anime.type]}${anime.episodes > 1 ? ` ${anime.episodes} ep` : ''}</span>
                    </div>
                    `);
                })
            });

            // Rating bars
            ratings.forEach(rating => {
                $('#ratings-chart').append(`
                    <div class="row justify-content-center align-items-center">
                        <div class="col-2">${rating} &mdash; ${lookup.rating[rating]}</div>
                        <div class="col-4">
                            <div class="progress bg-secondary">
                                <div class="progress-bar bg-primary" style="width: ${(ratingCounts[rating] / Math.max(...Object.values(ratingCounts))) * 100}%;">${ratingCounts[rating] > 0 ? ratingCounts[rating] : ''}</div>
                            </div>
                        </div>
                    </div>
                `);
            });

            // Average rating
            $('#ratings-chart').append(`
            <div class="row justify-content-center align-items-center">
                <div class="col-4 offset-2 text-center">
                    Average rating: ${round(Object.entries(ratingCounts).map(rating => parseInt(rating[0], 10) * rating[1]).reduce((a, b) => a + b) / Object.values(ratingCounts).reduce((a, b) => a + b), -2)}
                </div>
            </div>
            `);

            // Tooltips, again
            $('[data-toggle="tooltip"]').tooltip();
        },
    });

    // Bind search
    $('#search').on('keyup', e => table.search(e.target.value).draw());

    // Bind filtering dropdown
    $('#subs').on('change keyup', e => table.column('subs:name').search(e.target.value, false, true).draw());

    // Bind filtering buttons
    $('.filter').on('click', e => {
        let el = $(e.target);

        // Reset filtering by clicking again on currently selected option
        if (el.hasClass('btn-primary') && el.val().length) {
            el.parent().find('button').eq(0).click();
            return;
        }

        el.parent().find('.btn-primary').removeClass('btn-primary').addClass('btn-secondary');
        el.removeClass('btn-secondary').addClass('btn-primary');
        table.column(el.parent().attr('id') + ':name').search(e.target.value, true).draw();
    });

    // Clear search and sort
    $('#reset').on('click', () => {
        table.order([[1, 'asc'], [0, 'asc']]).draw();
        $('.filter button:first-of-type').click();
        $('#search').val('').trigger('keyup');
        $('#subs').val('').trigger('change');
    });

    // Init tooltips
    $('[data-toggle="tooltip"]').tooltip();

}());
