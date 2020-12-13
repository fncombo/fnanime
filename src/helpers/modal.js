import { ACTIONS } from 'src/helpers/global-state'

/**
 * Replaces special characters returned by the API into proper HTML entities.
 *
 * @param {string} string The string to replace characters in.
 *
 * @returns {string} String with special characters properly replaced.
 */
function replaceSpecialChars(string) {
    return string.replace(/&#(\d+);/g, (_, match) => String.fromCharCode(match))
}

/**
 * Returns the ID of the previous or next anime in the array relative to the current anime.
 *
 * @param {Array} allAnime Array of all anime objects.
 * @param {number} animeId ID of the current anime.
 * @param {ACTIONS} direction The direction to go from the current anime. Either `NEXT_ANIME` or `PREV_ANIME`.
 *
 * @returns {boolean|number} ID of the previous or next anime, or `false` if there isn't one.
 */
function getAdjacentAnime(allAnime, animeId, direction) {
    const index = allAnime.findIndex((anime) => anime.id === animeId)

    // Anime is not in table, so can't show next/prev in relation to it
    if (index === -1) {
        return false
    }

    switch (direction) {
        case ACTIONS.NEXT_ANIME:
            // Last anime, can't get next
            if (index === allAnime.length - 1) {
                return false
            }

            return allAnime[index + 1]

        case ACTIONS.PREV_ANIME:
            // First anime, can't get previous
            if (index === 0) {
                return false
            }

            return allAnime[index - 1]

        default:
            return false
    }
}

export { replaceSpecialChars, getAdjacentAnime }
