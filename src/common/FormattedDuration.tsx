import { FunctionComponent } from 'react'

import humanizeDuration, { Options } from 'humanize-duration'

const options: Options = { units: ['d', 'h', 'm'] }

/**
 * Formats an anime duration into a pretty human readable duration.
 */
const FormattedDuration: FunctionComponent<{
    duration: number
}> = ({ duration }) => <>{humanizeDuration(duration * 6e4, options)}</>

export default FormattedDuration
