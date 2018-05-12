import sifter from 'sifter';
import fuzzysort from 'fuzzysort';
import React, { Component } from 'react';
import './style.css';
import data from './data.json';

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
const formatSize = (bytes, i, showLabel = true) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    i = (i === undefined ? Math.floor(Math.log(bytes) / Math.log(k)) : +i);

    return round((bytes / Math.pow(k, i)), -2) + (showLabel ? ' ' + sizes[i] : '');
};

const anime = Object.values(data.anime);

const defaultSort = [
    {
        field: 'status',
        direction: 'asc',
    }, {
        field: 'title',
        direction: 'asc',
    },
];

let defaultFilters = {};
data.filters.map(filterName => defaultFilters[filterName] = false);

// Search, sort and filter anime
const results = (query = '', sort = defaultSort, filters = defaultFilters) => {
    // Temporary results while filtering
    let results = [];
    let tempResults = [];
    // Final results to show
    let finalResults = [];
    // Whether any filters are active
    const filtersActive = !!Object.values(filters).filter(value => !!value).length;

    // Add sorting alphabetically by title if not already, just to make it feel better
    let actualSort = Object.assign([], sort);
    if (!actualSort.some(sort => sort.field === 'title')) {
        actualSort.push({
            field: 'title',
            direction: 'asc',
        });
    }

    // Go through each filter if there are any, narrowing down results each time
    if (filtersActive) {
        // Always use cached results past the first filter
        let filterCount = 0;

        Object.entries(filters).forEach(([filterName, value]) => {
            filterCount++;

            tempResults = [];

            // Search this exact filter value in the needed property
            new sifter(filterCount === 1 ? anime : results).search(value, {
                fields: [filterName],
            }).items.forEach(item => {
                tempResults.push((filterCount === 1 ? anime : results)[item.id]);
            });

            results = tempResults;
        });
    }

    // Perform the query search (if any) on either the filtered data or all anime
    if (query.length) {
        tempResults = [];
        fuzzysort.go(query, filtersActive ? results : anime, {
            keys: [
                'title',
                'titleLocal',
            ],
            threshold: -100,
            allowTypo: true,
        }).forEach(item => {
            tempResults.push(data.anime[item.obj.id]);
        });
    }

    // Final sorting
    let finalUse = query.length ? tempResults : (filtersActive ? results : anime);
    new sifter(finalUse).search('', {
        fields: ['title'],
        sort: actualSort,
    }).items.forEach(item => {
        finalResults.push(finalUse[item.id]);
    });

    return finalResults;
};

// Main page, filters, sorting, search and all components
class Page extends Component {
    constructor() {
        super();

        let newState = {
            anime: results(),
            query: '',
            sort: Object.assign([], defaultSort),
            filters: Object.assign({}, defaultFilters),
            selectedAnimeId: false,
        };

        this.state = newState;

        this.update = this.update.bind(this);
        this.reset = this.reset.bind(this);
        this.openInfoBox = this.openInfoBox.bind(this);
        this.closeInfoBox = this.closeInfoBox.bind(this);
    }

    // Update filters, sort and search
    update(action, ...args) {
        let newState = Object.assign({}, this.state);

        if (args.length === 2) {
            // If the value is string false, we probably mean "false" keyword!
            if (args[1] === 'false') {
                args[1] = false;
            }

            newState[action][args[0]] = args[1];
        } else {
            newState[action] = args[0];
        }

        newState.anime = results(newState.query, newState.sort, newState.filters);

        this.setState(newState);
    }

    // Reset all filters, sorting and search
    reset() {
        this.setState({
            anime: results(),
            query: '',
            sort: Object.assign([], defaultSort),
            filters: Object.assign({}, defaultFilters),
            selectedAnimeId: false,
        });
    }

    // Open the info box for the selected anime
    openInfoBox(animeId) {
        let newState = Object.assign({}, this.state);

        newState.selectedAnimeId = animeId;

        this.setState(newState);
    }
    // Close the info box
    closeInfoBox() {
        let newState = Object.assign({}, this.state);

        newState.selectedAnimeId = false;

        this.setState(newState);
    }

    render() {
        return (
            <div>
                <Filters state={this.state} update={this.update} reset={this.reset}></Filters>
                <Table state={this.state} update={this.update} openInfoBox={this.openInfoBox}></Table>
                <div className="container-fluid container-limited">
                    <RatingsChart anime={this.state.anime}></RatingsChart>
                </div>
                <div className="container-fluid ratings-gallery">
                    <RatingsGallery anime={this.state.anime}></RatingsGallery>
                </div>
                {this.state.selectedAnimeId ? <InfoBox anime={data.anime[this.state.selectedAnimeId]} closeInfoBox={this.closeInfoBox}></InfoBox> : ''}
            </div>
        );
    }
}

// Filters, search, and reset
class Filters extends Component {
    // Make a filter button group
    buttonGroup(filterName) {
        const width = 100 / data.filterValues[filterName].length;

        return (
            <div className="col-6">
                <div className="btn-group d-flex">
                    {data.filterValues[filterName].map(value => {
                        return this.button(filterName, value, width);
                    })}
                </div>
            </div>
        );
    }

    // Make a single button, with correct name and count value
    button(filterName, value, width) {
        // Count how many of currently shown anime match this filter
        const count = this.props.state.anime.filter(anime => anime[filterName] === value).length;
        // Human-readable filter name, or "All X"
        const displayName = value ? data.lookup[filterName][value] : data.filtersAll[filterName];
        const className = this.props.state.filters[filterName] === value ? 'btn btn-primary' : 'btn btn-secondary';

        return (
            <button className={className} style={{width: `${width}%`}} onClick={() => {
                if (this.props.state.filters[filterName] !== value) {
                    this.props.update('filters', filterName, value)}
                }} key={value}>
                {displayName}{count ? ` (${count})` : ''}
            </button>
        );
    }

    // Make dropdown options with correct name and count value
    options(filterName) {
        let options = [];

        data.filterValues[filterName].forEach(value => {
            // Count how many of currently shown anime match this filter
            const count = this.props.state.anime.filter(anime => anime[filterName] && anime[filterName].indexOf(value) !== -1).length;
            // Human-readable filter name, or "All X"
            const displayValue = value ? value : data.filtersAll[filterName];
            options.push(<option value={value} key={value}>{displayValue}{count ? ` (${count})` : ''}</option>)
        });

        return options;
    }

    // Stats of the table with filters applied
    stats() {
        if (this.props.state.anime.length) {
            const downloaded = this.props.state.anime.filter(anime => anime.local).length;
            const notDownloaded = this.props.state.anime.length - downloaded;
            const size = formatSize(this.props.state.anime.map(a => a.size).reduce((a, b) => a + b));

            if (downloaded && notDownloaded) {
                return <span>Showing <strong>{downloaded}</strong> (+{notDownloaded} not downloaded) anime occupying {size}</span>;
            } else if (downloaded && !notDownloaded) {
                return <span>Showing <strong>{downloaded}</strong> anime occupying {size}</span>;
            } else if (!downloaded && notDownloaded) {
                return <span>Showing {notDownloaded} anime</span>;
            }
        }

        return <span>No matching anime</span>;
    }

    render() {
        return (
            <div className="container-fluid container-limited">
                 <div className="row mt-3">
                    {this.buttonGroup('type')}
                    {this.buttonGroup('status')}
                </div>
                <div className="row mt-3">
                    {this.buttonGroup('resolution')}
                    {this.buttonGroup('source')}
                </div>
                <div className="row mt-3">
                    <div className="col-3">
                        <input type="text" className="form-control" placeholder="Search..." value={this.props.state.query} onChange={event => this.props.update('query', event.target.value)} />
                    </div>
                    <div className="col-3">
                        <select className="custom-select" value={this.props.state.filters.subGroup} onChange={event => {this.props.update('filters', 'subGroup', event.target.value)}}>
                            {this.options('subGroup')}
                        </select>
                    </div>
                    <div className="col-5 d-flex align-items-center">
                        {this.stats()}
                    </div>
                    <div className="col-1 d-flex">
                        <button className="btn btn-primary" onClick={this.props.reset}>Reset</button>
                    </div>
                </div>
            </div>
        );
    }
}

// Table with all the anime data
class Table extends Component {
    constructor (props) {
        super(props);

        this.state = {
            currentPage: 1,
        };

        this.changePage = this.changePage.bind(this);
    }

    // Results to show per page
    perPage = 25;

    // Change the curent page
    changePage(page) {
        this.setState({
            currentPage: page,
        });
    }

    // Sort when clicking on a column header
    sort(column, defaultDirection, event) {
        // Pressing shift or the current only sorted column modifies the current sorting
        let sort = (event.shiftKey || (this.props.state.sort.length === 1 && this.props.state.sort[0].field === column)) ? Object.assign([], this.props.state.sort) : [];

        // Check if this column is already being sorted
        // In which case reverse it, otherwise use default sorting for that column
        if (sort.some(sort => sort.field === column)) {
            // Get the index of the sort setting
            let index = sort.findIndex(sort => sort.field === column);
            sort[index].direction = sort[index].direction === 'asc' ? 'desc' : 'asc';
        // Add new sorting
        } else {
            sort.push({
                field: column,
                direction: defaultDirection,
            });
        }

        this.props.update('sort', sort);
    }

    // Render the anime title, highlighted when there is a search query
    title(anime) {
        if (this.props.state.query.length) {
            return <span className="link mr-1" dangerouslySetInnerHTML={this.highlightedTitle(anime)}></span>;
        }

        return <span className="link mr-1">{anime.title.length > 80 ? `${anime.title.substr(0, 80)}…` : anime.title}</span>;
    }

    // ~Dangerous~ HTML
    highlightedTitle(anime) {
        return {
            __html: fuzzysort.highlight(fuzzysort.single(this.props.state.query, anime.title), '<strong>', '</strong>') ||
            fuzzysort.highlight(fuzzysort.single(this.props.state.query, anime.titleLocal), '<strong>', '</strong>'),
        };
    }

    // Apply the correct sorting class names to table header columns
    columClassName(column) {
        // If no sorting active
        if (!this.props.state.sort.length) {
            return;
        }

        // Check if any of the sort fields match the column name
        if (this.props.state.sort.some(sort => sort.field === column)) {
            // Figure out the order (desc or asc)
            return this.props.state.sort.filter(sort => sort.field === column).map(sort => {
                return `sort-${sort.direction}`;
            });
        }
    }

    // Create a row for a single anime
    row(anime) {
        return (
            <tr className={!anime.local ? 'not-downloaded' : ''} onClick={() => this.props.openInfoBox(anime.id)} key={anime.id}>
                <td>
                    <div>
                        <span className="anime-image" style={{backgroundImage: `url(${anime.imageUrl})`}}></span>
                        {this.title(anime)}
                        <span className="text-secondary">{data.lookup.type[anime.type]}</span>
                    </div>
                </td>
                <td className="">
                    <span className={`status-pill status-pill-${data.lookup.statusColor[anime.status]}`}>
                        {data.lookup.status[anime.status]}
                    </span>
                </td>
                <td className="text-left">
                    {anime.subGroup ? anime.subGroup.join(', ') : '—'}
                </td>
                <td className={anime.resolution ? `text-${data.lookup.resolutionColor[anime.resolution]}` : ''}>
                    {anime.resolution ? `${anime.resolution}p` : '—'}
                </td>
                <td className={!(!anime.source || anime.source === 'ZMISS') ? `text-${data.lookup.sourceColor[anime.source]}` : ''}>
                    {!(!anime.source || anime.source === 'ZMISS') ? data.lookup.source[anime.source] : '—'}
                </td>
                <td>
                    {anime.rating || '—'}
                </td>
                <td>
                    {anime.rewatchCount || '—'}
                </td>
                <td className={!anime.sizeMatches && anime.local ? 'size-column size-mismatch' : 'size-column'}>
                    {anime.local ? anime.sizeDisplay : 'Not Downloaded'}
                    <div className={(!anime.local ? 'd-none ' : '') + `progress bg-secondary`}>
                        <div className={`progress-bar bg-${anime.sizeColor}`} style={{width: `${anime.sizeWidth}px`}}></div>
                    </div>
                </td>
            </tr>
        );
    }

    // Include page buttons if more than one page
    pagination () {
        // Number of anime entries
        const totalAnime = this.props.state.anime.length;
        // How many pages there are in total
        const lastPage = Math.ceil(totalAnime / this.perPage);

        if (lastPage > 1) {
           return (
                <div className="pagination">
                    <button className={`btn ${this.state.currentPage === 1 ? 'btn-disabled' : 'btn-secondary'}`} onClick={() => this.changePage(this.state.currentPage - 1)} disabled={this.state.currentPage === 1}>Previous</button>
                    <Pagination currentPage={this.state.currentPage} perPage={this.perPage} total={totalAnime} lastPage={lastPage} changePage={this.changePage}></Pagination>
                    <button className={`btn ${this.state.currentPage === lastPage ? 'btn-disabled' : 'btn-secondary'}`} onClick={() => this.changePage(this.state.currentPage + 1)} disabled={this.state.currentPage === lastPage}>Next</button>
                </div>
            );
        }
    }

    componentDidUpdate() {
        // Never go past the last page, when results decrease while filtering
        if (this.state.currentPage > Math.ceil(this.props.state.anime.length / this.perPage) && this.state.currentPage !== 1) {
            this.changePage(1);
        }
    }

    render() {
        const title = 'Hold shift to sort multiple columns';

        return (
            <div className="container-fluid container-limited">
                <table className="table table-striped mt-3" id="anime" style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th title={title} className={this.columClassName('title')} style={{width: '36.5%'}} onClick={event => this.sort('title', 'asc', event)}>Title</th>
                            <th title={title} className={this.columClassName('status')} style={{width: '9%'}} onClick={event => this.sort('status', 'asc', event)}>Status</th>
                            <th title={title} className={this.columClassName('subGroup') + ' text-left'} style={{width: '12.5%'}} onClick={event => this.sort('subGroup', 'asc', event)}>Sub Group</th>
                            <th title={title} className={this.columClassName('resolution')} style={{width: '9%'}} onClick={event => this.sort('resolution', 'desc', event)}>Resolution</th>
                            <th title={title} className={this.columClassName('source')} style={{width: 'auto'}} onClick={event => this.sort('source', 'asc', event)}>Source</th>
                            <th title={title} className={this.columClassName('rating')} style={{width: 'auto'}} onClick={event => this.sort('rating', 'desc', event)}>Rating</th>
                            <th title={title} className={this.columClassName('rewatchCount')} style={{width: '9%'}} onClick={event => this.sort('rewatchCount', 'desc', event)}>Rewatched</th>
                            <th title={title} className={this.columClassName('size')} style={{width: '11%'}} onClick={event => this.sort('size', 'desc', event)}>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.state.anime.slice((this.state.currentPage - 1) * this.perPage, this.state.currentPage * this.perPage).map(anime => {
                            return this.row(anime);
                        })}
                    </tbody>
                </table>
                {this.pagination()}
            </div>
        );
    }
}

// Pagination buttons to control the table
class Pagination extends Component {
    // How many buttons to show beside the current page button
    buttonCount = 2;

    // Create a single button
    makeButton(i) {
        if (i === this.props.currentPage) {
            return <button className="btn btn-primary" key={i}>{i}</button>;
        }

        return <button className="btn btn-secondary" value={i} onClick={() => this.props.changePage(i)} key={i}>{i}</button>;
    }

    render() {
        // The lowest and highest page number relative to the current page
        const leftPage = this.props.currentPage - this.buttonCount;
        const rightPage = this.props.currentPage + this.buttonCount + 1;

        // Page numbers
        let pages = [];
        // Actual button elements
        let buttons = []

        // Create the needed numbers
        for (let i = 1; i <= this.props.lastPage; i++) {
            if (i === 1 || i === this.props.lastPage || (i >= leftPage && i < rightPage)) {
                pages.push(i);
            }
        }

        // Show ... after 1st page and before the last page if there are more than 2 results
        // between the next/previous button
        let l;
        for (let i of pages) {
            if (l) {
                if (i - l === 2) {
                    buttons.push(this.makeButton(l + 1));
                } else if (i - l !== 1) {
                    buttons.push(<span key={Math.random()}>…</span>);
                }
            }
            buttons.push(this.makeButton(i));
            l = i;
        }

        return buttons;
    }
}

// Show all the ratings in a relative chart
class RatingsChart extends Component {
    render() {
        // Figure out how many anime there are for each rating
        let ratingCount = {};

        this.props.anime.forEach(anime => {
            if (anime.rating === 0) {
                return;
            }

            if (ratingCount.hasOwnProperty(anime.rating)) {
                ratingCount[anime.rating]++;
            } else {
                ratingCount[anime.rating] = 1;
            }
        });

        // Figure out the max anime/rating
        const maxRated = Math.max(...Object.values(ratingCount));

        return data.ratings.map(rating => {
            const width = ratingCount[rating] > 0 ? ((ratingCount[rating] / maxRated) * 100) : 0;
            return (
                <div className="row justify-content-center align-items-center" key={rating}>
                    <div className="col-1 text-right">{rating}</div>
                    <div className="col-1">{data.lookup.rating[rating]}</div>
                    <div className="col-4">
                        <div className="progress bg-secondary">
                            <div className="progress-bar bg-primary" style={{width: `${width}%`}}>{ratingCount[rating] > 0 ? ratingCount[rating] : ''}</div>
                        </div>
                    </div>
                </div>
            );
        });
    }
}

// Gallery of anime images by rating, using the table data, sort, filter and search
class RatingsGallery extends Component {
    render() {
        return data.ratings.map(rating => {
            if (this.props.anime.some(anime => anime.rating === rating)) {
                return (
                    <div key={rating}>
                        <h3 className="text-center rounded p-3">{rating} - {data.lookup.rating[rating]}</h3>
                        <div className="grid">
                            {this.props.anime.filter(anime => anime.rating === rating).map(anime => {
                                return (
                                    <div className={!anime.local ? 'grid-item not-downloaded' : 'grid-item '} key={anime.id}>
                                        <span className="image rounded-top" style={{backgroundImage: `url(${anime.imageUrl})`}}></span>
                                        <span className={`status-pill status-pill-${data.lookup.statusColor[anime.status]}`}>
                                            {data.lookup.typeActual[anime.typeActual]}{anime.episodes > 1 ? ` ${anime.episodes} ep` : ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            return '';
        });
    }
}

// Information box about a specific selected anime
class InfoBox extends Component {
    componentDidMount() {
        document.body.classList.add('modal-open');
    }

    componentWillUnmount() {
        document.body.classList.remove('modal-open');
    }

    // Make a list of the related anime
    relatedList() {
        if (!this.props.anime.related) {
            return <h6>No related anime.</h6>;
        }

        return Object.entries(this.props.anime.related).map(([type, anime], i) => {
            // Don't include anything related that's not an anime
            anime = anime.filter(anime => anime.type === 'anime');

            if (!anime.length) {
                return '';
            }

            return (
                <ul className={`list-group ${i > 1 ? ' mt-3' : ''}`} key={i}>
                    <h6>{type}</h6>
                    {anime.map(anime => {
                    const id = anime.mal_id;
                    return (
                        <li className="list-group-item container" key={id}>
                            <div className="row">
                                <div className="col-9">
                                    <a href={anime.url} target="_blank">{anime.title}</a>
                                </div>
                                {data.anime.hasOwnProperty(id) ?
                                    <div className="col-3 text-right">
                                        <span className={`status-pill status-pill-${data.lookup.statusColor[data.anime[id].status]}`}>
                                            {data.lookup.status[data.anime[id].status]}
                                        </span>
                                    </div> :
                                ''}
                            </div>
                        </li>
                    );
                })}
                </ul>
            );
        })
    }

    render() {
        // Calc the difference between the ratings
        let ratingDifference = round(this.props.anime.rating - this.props.anime.averageRating, -2);
        ratingDifference = ratingDifference > 0 ? `+${ratingDifference}` : ratingDifference;

        return (
            <div className="modal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {this.props.anime.title}
                                <span className={`status-pill status-pill-${data.lookup.statusColor[this.props.anime.status]}`}>
                                    {data.lookup.status[this.props.anime.status]}
                                </span>
                            </h5>
                            <button className="close" onClick={this.props.closeInfoBox}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body row">
                            <div className="col-3">
                                <div className="image rounded" style={{backgroundImage: `url(${this.props.anime.imageUrl})`}}></div>
                                <div className="rating-stars text-center">
                                    {new Array(this.props.anime.rating).fill(0).map((v, i) => <span className="active" key={i}>★</span>)}
                                    {new Array(10 - this.props.anime.rating).fill(0).map((v, i) => <span className="inactive" key={i}>★</span>)}
                                    <h5>{this.props.anime.rating} / 10</h5>
                                    <p>Average MyAnimeList rating: {this.props.anime.averageRating}<br />Personal difference: {ratingDifference}</p>
                                </div>
                            </div>
                            <div className="col-9">
                                <h6>Synopsis</h6>
                                <p>{this.props.anime.synopsis
                                    .replace(/[[(].+[\])]/, '')
                                    .replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}
                                </p>
                                {this.relatedList()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// Go???
export default Page;