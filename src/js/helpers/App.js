// Libraries
import has from 'has'

/**
 * Get updated API date to display the latest info such as episode watch progress.
 */
async function getApiData(page = 1, isRetry = false) {
    // Collect new API data
    let newApiData = []

    // Stop after too many retries
    if (isRetry > 5) {
        return false
    }

    // Wait at least 2 seconds between API requests, increasing by 2 seconds with each retry
    if (page > 1 || isRetry) {
        await new Promise(resolve => {
            setTimeout(resolve, (isRetry || 1) * 2000)
        })
    }

    // Get the data
    let response

    try {
        response = await fetch(`https://api.jikan.moe/v3/user/fncombo/animelist/all/${page}`)

        // Force retry if non-200 status
        if (!response.ok) {
            throw new Error()
        }
    } catch (error) {
        const retryData = await getApiData(page, isRetry ? isRetry + 1 : 1)

        if (!retryData) {
            return false
        }

        newApiData = newApiData.push(...retryData)
    }

    // Parse JSON response
    let responseJson

    try {
        responseJson = await response.json()
    } catch (error) {
        return false
    }

    // Check that anime data actually exists in the API response
    if (!has(responseJson, 'anime') || !Array.isArray(responseJson.anime) || !responseJson.anime.length) {
        return false
    }

    newApiData.push(...responseJson.anime)

    // If this page was full (300 entries per page), get the next page
    if (responseJson.anime.length === 300) {
        const nextPageData = await getApiData(page + 1)

        if (!nextPageData) {
            return false
        }

        newApiData = newApiData.concat(...nextPageData)
    }

    return newApiData
}

// Exports
export {
    getApiData,
}
