// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faStar as farFaStar } from '@fortawesome/free-regular-svg-icons'
import {
    faStar as fasFaStar,
    faSortDown,
    faSortUp,
    faChevronLeft,
    faChevronRight,
    faExclamationCircle,
    faPlayCircle,
    faCheckCircle,
    faPauseCircle,
    faTimesCircle,
    faQuestionCircle,
    faPlusCircle,
    faDatabase,
    faHeart,
    faCopy,
} from '@fortawesome/free-solid-svg-icons'

// Array of all icons to be used
const icons = [
    farFaStar,
    fasFaStar,
    faSortDown,
    faSortUp,
    faChevronLeft,
    faChevronRight,
    faExclamationCircle,
    faPlayCircle,
    faCheckCircle,
    faPauseCircle,
    faTimesCircle,
    faQuestionCircle,
    faPlusCircle,
    faDatabase,
    faHeart,
    faCopy,
]

// Add all icons to the library
library.add(...icons)
