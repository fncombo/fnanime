/**
 * Return the link to the anime on MyAnimeList.net.
 */
function getAnimeLink(id, url) {
    return `https://myanimelist.net/anime/${id}/${url}`
}

export {
    getAnimeLink,
}
