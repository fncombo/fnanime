import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { isFunction, isNumber, isString } from 'is-what'

import { ModalState } from 'src/helpers/global-state'

/**
 * Attempt to get API data using a string property e.g. "foo.bar". Returns the found data, the fallback, or a dash.
 */
export default function ApiData({ data: dataKey, fallback = null, children = null }) {
    const { data } = useContext(ModalState)

    let dataValue = null

    if (isString(dataKey)) {
        dataValue = data[dataKey]
    } else if (isFunction(dataKey)) {
        dataValue = dataKey(data)
    }

    // No such API data or it's empty, return the fallback
    if (!dataValue) {
        return fallback || <>&mdash;</>
    }

    // Render function provided, pass the data to it
    if (isFunction(children)) {
        return children(dataValue)
    }

    // The data is a number, format it properly
    if (isNumber(dataValue)) {
        return dataValue.toLocaleString()
    }

    return dataValue
}

ApiData.propTypes = {
    data: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
    fallback: PropTypes.node,
    children: PropTypes.func,
}
