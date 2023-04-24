import {stringToBool} from './utils'
import cockpit from 'cockpit'

const _ = cockpit.gettext

export function foo() {
    return stringToBool(_(123))
}
