import { FunctionComponent } from 'react'

import prettyBytes from 'pretty-bytes'

const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}

/**
 * Formats bytes into a pretty human readable size text.
 */
const FormattedBytes: FunctionComponent<{
    bytes: number
}> = ({ bytes }) => <>{prettyBytes(bytes, options)}</>

export default FormattedBytes
