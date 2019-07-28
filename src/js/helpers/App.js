// Data
import { updateAnimeFromApiData } from '../data/Data'

// Count of API retries due to errors
let apiRetries = 0

// Storage of new API data
const newApiData = []

/**
 * Get updated API date to display the latest info such as episode watch progress.
 */
function getApiData(page = 1, callback, errorCallback) {
    fetch(`https://api.jikan.moe/v3/user/fncombo/animelist/all/${page}`).then(response =>
        response.json()
    ).then(apiData => {
        // If API responded with an error (e.g. too many requests), keep trying with increasing time between retries
        if (apiData.hasOwnProperty('error')) {
            apiRetries++

            console.warn('API responded with an error:', apiData.error)
            console.log(`Retrying in ${apiRetries * 2} seconds`)

            setTimeout(() => {
                getApiData(page, callback, errorCallback)
            }, apiRetries * 2000)

            return
        }

        // Add all anime from API
        newApiData.push.apply(newApiData, apiData.anime)

        // Since API only does 300 entries per responce, keep trying next page until got everything
        if (apiData.anime.length === 300) {
            //  API requires some delay between requests
            setTimeout(() => {
                getApiData(page + 1, callback, errorCallback)
            }, 2000)
        } else {
            newApiData.forEach(anime => {
                updateAnimeFromApiData(anime.mal_id, {
                    status: anime.watching_status,
                    rating: anime.score,
                    episodes: anime.total_episodes > 0 ? anime.total_episodes : null,
                    episodesWatched: anime.watched_episodes,
                })
            })

            callback()
        }
    }, error => {
        console.error('Error while fetching API:', error)
        errorCallback()
    })
}

// Exports
export {
    getApiData,
}
