import React from 'react'
import { Provider } from 'react-redux'
import { applyRouterMiddleware, Router } from 'react-router'
import { history } from 'utility/environment'
import { syncHistoryWithStore } from 'react-router-redux'
import useScroll from 'react-router-scroll/lib/useScroll'

import makeRoutes from './routes'
import {NativeChainName} from "./utility/environment";

export default class Root extends React.Component {
  componentWillMount() {
    document.title = NativeChainName+' Dashboard'
  }

  render() {
    const store = this.props.store
    const syncedHistory = syncHistoryWithStore(history, store)
    return (
      <Provider store={store}>
        <Router
          history={syncedHistory}
          routes={makeRoutes(store)}
          render={applyRouterMiddleware(useScroll())}
        />
      </Provider>
    )
  }
}
