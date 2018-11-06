import introduction from './introduction.json'
import {NativeChainName} from "../../utility/environment";
import JsonUtils from "../../utility/JsonUtils";

const router = [
  '/core',
  '/access-control', '/access-control/create-token',
  '/backup',
  '/transactions', '/transactions/create',
  '/accounts', '/accounts/create',
  '/assets', '/assets/create',
  '/balances',
  '/keys', '/keys/create',
  '/unspents',
]

export const location = (state = {visited: [], isVisited: false, lastVisit: ''}, action) => {
  if (action.type == '@@router/LOCATION_CHANGE') {

    state.lastVisit = lastVisit(state, action)

    if (!state.visited.includes(action.payload.pathname) && router.includes(action.payload.pathname)) {
      if (action.payload.pathname !== '/access-control' ||
        (action.payload.search.includes('?type=token') && action.payload.pathname === '/access-control')) {
        return {...state, visited: [action.payload.pathname, ...state.visited], isVisited: false}
      }
    } else if (action.payload.pathname.match(/^\/keys.*reset-password$/g) && !state.visited.includes('/keys/:id/reset-password')) {
      return {...state, visited: ['/keys/:id/reset-password', ...state.visited], isVisited: false}
    } else if (!router.includes(action.payload.pathname)) {
      return {...state, isVisited: true, lastVisit: ''}
    } else {
      return {...state, isVisited: true}
    }
  }
  if (action.type == 'DISMISS_TUTORIAL') return {...state, isVisited: true}

  return state
}

export const lastVisit = (location, action) => {
  if (action.type == '@@router/LOCATION_CHANGE') {
    const visiting = introPath(action)
    if (visiting !== '') {
      location.lastVisit = visiting
    }
  }
  return location.lastVisit
}

export const introPath = (action) => {
  if (action.type == '@@router/LOCATION_CHANGE') {
    if (router.includes(action.payload.pathname)) {
      return action.payload.pathname
    } else if (action.payload.pathname.match(/^\/keys.*reset-password$/g)) {
      return '/keys/:id/reset-password'
    }
  }
  return ''
}

export const HeaderState = {
  SHOW: "show",
  HIDE: "hide",
}
export const DefaultHeaderState = HeaderState.SHOW

export const showHeader = (state = DefaultHeaderState, action) => {
  if (action.type == 'SHOW_TUTORIAL_HEADER') {
    state = HeaderState.SHOW
  } else if (action.type == 'HIDE_TUTORIAL_HEADER' || action.type == 'DISMISS_TUTORIAL') {
    state = HeaderState.HIDE
  }
  return state
}

export default (state = {showHeader: DefaultHeaderState}, action) => {
  const newState = {
    showHeader: showHeader(state.showHeader, action),
    location: location(state.location, action)
  }
  if (!newState.location.isVisited) {
    newState.content = introduction[newState.location.visited[0]]
  } else if (newState.location.lastVisit != '') {
    newState.content = introduction[newState.location.lastVisit]
  }

  if (newState.content) {
    let content = JsonUtils.jsonToString(newState.content).replace(/\${CHAIN_NAME}/g, NativeChainName)
    newState.content = JsonUtils.stringToJson(content)
  }
  return newState
}
