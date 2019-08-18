/**
 * Get updated API date to display the latest info such as episode watch progress.
 */
async function getApiData(page = 1, isRetry = false) {
    // Collect new API data
    let newApiData = []

    // Stop after too many retries
    if (isRetry > 5) {
        throw new Error('Too many API retries')
    }

    // Wait at least 2 seconds between API requests, increasing with each retry
    if (page > 1 || isRetry) {
        await new Promise(resolve => {
            setTimeout(resolve, (isRetry || 1) * 2000)
        })
    }

    // Get the data
    let response

    try {
        response = await fetch(`https://api.jikan.moe/v3/user/fncombo/animelist/all/${page}`)
    } catch (error) {
        console.warn('Error occurred while fetching API, retrying')

        newApiData = newApiData.concat(await getApiData(page, isRetry ? isRetry + 1 : 1))
    }

    // Re-try if failed for any reason
    if (response.status !== 200) {
        console.warn('API responded with non-200 status, retrying')

        newApiData = newApiData.concat(await getApiData(page, isRetry ? isRetry + 1 : 1))
    }

    // Parse JSON response
    let responseJson

    try {
        responseJson = await response.json()
    } catch (error) {
        throw new Error('Could not parse API data')
    }

    if (!responseJson.hasOwnProperty('anime') || !Array.isArray(responseJson.anime) || !responseJson.anime.length) {
        throw new Error('Anime data not found in API data')
    }

    // Add all anime from API
    newApiData.push(...responseJson.anime)

    // If this page was full (300 entries per page), get the next page
    if (responseJson.anime.length === 300) {
        newApiData = newApiData.concat(await getApiData(page + 1))
    }

    return newApiData
}

// Exports
export {
    getApiData,
}
