import { List } from './components'
import { makeRoutes } from 'features/shared'

export default (store) => makeRoutes(store, 'balance', List)
