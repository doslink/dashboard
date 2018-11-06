import React from 'react'
import { connect } from 'react-redux'
import actions from 'actions'
import { Main, Config, Login, Loading, Register ,Modal } from './'
import moment from 'moment'
import {NativeChainName} from "../../../utility/environment";

const CORE_POLLING_TIME = 2 * 1000

class Container extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      noAccountItem: false
    }
    this.redirectRoot = this.redirectRoot.bind(this)
  }

  redirectRoot(props) {
    const {
      authOk,
      configKnown,
      configured,
      location
    } = props

    if (!authOk || !configKnown) {
      return
    }

    if (configured) {
      if (location.pathname === '/' ||
          location.pathname.indexOf('configuration') >= 0) {
        this.props.showRoot()
      }
    } else {
      this.props.showConfiguration()
    }
  }

  componentDidMount() {
    this.props.fetchAccountItem().then(resp => {
      if (resp.data.length == 0) {
        this.setState({noAccountItem: true})
      }
    })
    if(this.props.lang === 'zh'){
      moment.locale('zh-cn')
    }else{
      moment.locale(this.props.lang)
    }
  }

  componentWillMount() {
    this.props.fetchInfo().then(() => {
      this.redirectRoot(this.props)
    })

    setInterval(() => this.props.fetchInfo(), CORE_POLLING_TIME)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.authOk != this.props.authOk ||
        nextProps.configKnown != this.props.configKnown ||
        nextProps.configured != this.props.configured ||
        nextProps.location.pathname != this.props.location.pathname) {
      this.redirectRoot(nextProps)
    }
    if(nextProps.lang === 'zh'){
      moment.locale('zh-cn')
    }else{
      moment.locale(nextProps.lang)
    }
  }

  render() {
    let layout

    if (!this.props.authOk) {
      layout = <Login/>
    } else if (!this.props.configKnown) {
      return <Loading>Connecting to {NativeChainName} Core...</Loading>
    } else if (!this.props.configured) {
      layout = <Config>{this.props.children}</Config>
    } else if (!this.props.accountInit && this.state.noAccountItem){
      layout = <Register>{this.props.children}</Register>
    } else{
      layout = <Main>{this.props.children}</Main>
    }

    return <div>
      {layout}
      <Modal />

      {/* For copyToClipboard(). TODO: move this some place cleaner. */}
      <input
        id='_copyInput'
        onChange={() => 'do nothing'}
        value='dummy'
        style={{display: 'none'}}
      />
    </div>
  }
}

export default connect(
  (state) => ({
    authOk: !state.core.requireClientToken || state.core.validToken,
    configKnown: true,
    configured: true,
    onTestnet: state.core.onTestnet,
    accountInit: state.core.accountInit,
    lang: state.core.lang
  }),
  (dispatch) => ({
    fetchInfo: options => dispatch(actions.core.fetchCoreInfo(options)),
    showRoot: () => dispatch(actions.app.showRoot),
    showConfiguration: () => dispatch(actions.app.showConfiguration()),
    fetchAccountItem: () => dispatch(actions.account.fetchItems())
  })
)(Container)
