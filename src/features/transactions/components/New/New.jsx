import { PageTitle } from 'features/shared/components'
import React from 'react'
import { connect } from 'react-redux'
import styles from './New.scss'
import actions from 'actions'
import componentClassNames from 'utility/componentClassNames'
import { NativeAssetID } from 'utility/environment'
import { normalizeNativeAssetAmountUnit, converIntToDec } from 'utility/buildInOutDisplay'
import Tutorial from 'features/tutorial/components/Tutorial'
import NormalTxForm from './NormalTransactionForm'
import AdvancedTxForm from './AdvancedTransactionForm'
import { withRouter } from 'react-router'
import {getValues} from 'redux-form'

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showAdvanceTx: false
    }
    this.handleFormEmpty = this.handleFormEmpty.bind(this)
  }

  componentDidMount() {
    if (!this.props.autocompleteIsBalanceLoaded) {
      this.props.fetchBalanceAll().then(() => {
        this.props.didLoadBalanceAutocomplete()
      })
    }
    if (!this.props.autocompleteIsAssetLoaded) {
      this.props.fetchAssetAll().then(() => {
        this.props.didLoadAssetAutocomplete()
      })
    }
    this.props.router.setRouteLeaveHook(this.props.route, (nextLocation) => {
      if (!(this.handleFormEmpty() || nextLocation.state || nextLocation.pathname.startsWith('/transactions/generated/')))
        return this.props.lang === 'zh'? '交易表格有未完成内容，你确定要离开么？' : 'Your work is not saved! Are you sure you want to leave?'
    })
  }

  handleKeyDown(e, cb, disable) {
    if (e.key === 'Enter' && e.shiftKey === false && !disable) {
      e.preventDefault()
      cb()
    }
  }

  handleFormEmpty() {
    if(!this.state.showAdvanceTx){
      const array = [
        'accountAlias',
        'accountId',
        'amount',
        'assetAlias',
        'assetId',
        'address',
        'password']

      for (let k in array){
        if(this.props.normalform[array[k]]){
          return false
        }
      }

      return !(this.props.normalform['gas']['price'])
    }else{
      return !(this.props.advform['actions'].length > 0 ||
      this.props.advform['signTransaction'] ||
      this.props.advform['password'])
    }
  }

  showForm(e, type){
    e.preventDefault()
    const showAdTx = (type === 'advanced')
    if ( this.state.showAdvanceTx === showAdTx ||
      ( !this.handleFormEmpty() && !window.confirm(this.props.lang === 'zh'? '交易表格有未完成内容，你确定要离开么？' :'Your work is not saved! Are you sure you want to leave?') )){
      return
    }
    this.setState({ showAdvanceTx: showAdTx })
  }

  render() {
    const lang = this.props.lang

    const balanceAmount = (values, assetdecimal) => {
      let balances = this.props.balances
      let filteredBalances = balances
      if (values.accountAlias.value) {
        filteredBalances = filteredBalances.filter(balance => balance.accountAlias === values.accountAlias.value)
      }
      if (values.accountId.value) {
        filteredBalances = filteredBalances.filter(balance => balance.accountId === values.accountId.value)
      }
      if (values.assetAlias.value) {
        filteredBalances = filteredBalances.filter(balance => balance.assetAlias === values.assetAlias.value)
      }
      if (values.assetId.value) {
        filteredBalances = filteredBalances.filter(balance => balance.assetId === values.assetId.value)
      }

      if(filteredBalances.length === 1){
        if (filteredBalances[0].assetId === NativeAssetID){
          return normalizeNativeAssetAmountUnit(filteredBalances[0].assetId, filteredBalances[0].amount, this.props.nativeAssetAmountUnit)
        }else if( assetdecimal ){
          return converIntToDec(filteredBalances[0].amount, assetdecimal)
        }else{
          return filteredBalances[0].amount
        }
      }else {
        return null
      }
    }

    const assetDecimal = (values) => {
      let asset = this.props.asset
      let filteredAsset = asset
      if (values.assetAlias.value) {
        filteredAsset = filteredAsset.filter(asset => asset.alias === values.assetAlias.value)
      }
      if (values.assetId.value) {
        filteredAsset = filteredAsset.filter(asset => asset.id === values.assetId.value)
      }

      return (filteredAsset.length === 1 && filteredAsset[0].definition && filteredAsset[0].id !== NativeAssetID ) ? filteredAsset[0].definition.decimals : null
    }

    return (
      <div className={componentClassNames(this, 'flex-container')}>
        <PageTitle title={lang === 'zh' ? '新建交易' : 'New transaction'} />

        <div className={`${styles.mainContainer} flex-container`}>
          <div className={styles.content}>

            <div className={`btn-group ${styles.btnGroup}`} role='group'>
              <button
                className={`btn btn-default ${this.state.showAdvanceTx ? null : 'active'}`}
                onClick={(e) => this.showForm(e, 'normal')}>
                {lang === 'zh' ? '简单交易' : 'Normal'}
                </button>
              <button
                className={`btn btn-default ${this.state.showAdvanceTx ? 'active' : null}`}
                onClick={(e) => this.showForm(e, 'advanced')}>
                {lang === 'zh' ? '高级交易' : 'Advanced'}
                </button>
            </div>

            {!this.state.showAdvanceTx &&
            <NormalTxForm
              lang={this.props.lang}
              nativeAssetAmountUnit={this.props.nativeAssetAmountUnit}
              balanceAmount={balanceAmount}
              assetDecimal={assetDecimal}
              handleKeyDown={this.handleKeyDown}
            /> }

            {this.state.showAdvanceTx &&
            <AdvancedTxForm
              lang={this.props.lang}
              nativeAssetAmountUnit={this.props.nativeAssetAmountUnit}
              asset={this.props.asset}
              balanceAmount={balanceAmount}
              assetDecimal={assetDecimal}
              handleKeyDown={this.handleKeyDown}
            />}

          </div>
          <Tutorial types={['TutorialForm']} advTx={this.state.showAdvanceTx}/>
        </div>
      </div>
    )
  }
}

export default connect(
  (state) => {
    let balances = []
    for (let key in state.balance.items) {
      balances.push(state.balance.items[key])
    }

    return {
      autocompleteIsBalanceLoaded: state.balance.autocompleteIsLoaded,
      autocompleteIsAssetLoaded: state.asset.autocompleteIsLoaded,
      lang: state.core.lang,
      nativeAssetAmountUnit: state.core.nativeAssetAmountUnit,
      balances,
      asset: Object.keys(state.asset.items).map(k => state.asset.items[k]),
      normalform: getValues(state.form.NormalTransactionForm),
      advform: getValues(state.form.AdvancedTransactionForm),
    }
  },
  (dispatch) => ({
    didLoadBalanceAutocomplete: () => dispatch(actions.balance.didLoadAutocomplete),
    fetchBalanceAll: (cb) => dispatch(actions.balance.fetchAll(cb)),
    didLoadAssetAutocomplete: () => dispatch(actions.asset.didLoadAutocomplete),
    fetchAssetAll: (cb) => dispatch(actions.asset.fetchAll(cb)),
  })
)(withRouter(Form))