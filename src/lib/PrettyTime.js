// Modified and extremely simplified verion of
// https://github.com/jonschlinkert/pretty-time
const scale = {
    // 'w': 100080, // WRONG
    'd': 1440,
    'h': 60,
    'm': 1,
}

const expandedUom = {
    'w': 'week',
    'd': 'day',
    'h': 'hr',
    'm': 'min',
}

const expandUom = (number, uom) => {
    return ' ' + expandedUom[uom] + (number === 1 ? '' : 's')
}

export default function prettyTime(time, smallest = 'm') {
    let res = ''
    let prev

    for (const uom of Object.keys(scale)) {
        const step = scale[uom]
        let inc = time / step

        if (smallest && uom === smallest) {
            inc = Math.round(inc)

            if (prev && (inc === (prev / step))) {
                --inc
            }

            if (inc !== 0) {
                res += inc + expandUom(inc, uom)
            }

            return res.trim()
        }

        if (inc < 1) {
            continue
        }

        if (!smallest) {
            inc = Math.round(inc)

            if (inc !== 0) {
                res += inc + expandUom(inc, uom)
            }

            return res
        }

        prev = step

        inc = Math.floor(inc)
        time -= (inc * step)
        if (inc !== 0) {
            res += inc + expandUom(inc, uom) + ' '
        }
    }

    return res.trim()
}