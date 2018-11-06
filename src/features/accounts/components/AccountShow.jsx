import React from 'react'
import {
  BaseShow,
  CopyableBlock,
  KeyValueTable,
  PageContent,
  PageTitle,
  RawJsonButton,
} from 'features/shared/components'
import componentClassNames from 'utility/componentClassNames'

class AccountShow extends BaseShow {
  constructor(props) {
    super(props)

    this.createReceiver = this.createReceiver.bind(this)
    this.createAddress = this.createAddress.bind(this)
    this.listAddress = this.listAddress.bind(this)

    this.listAddress()
  }

  listAddress() {
    this.props.listAddress(this.props.params.id).then(data => {
      if (data.status !== 'success') {
        return
      }
      const normalAddresses = data.data.filter(address => !address.change).map((address) => {return {address: address.address, program: address.controlProgram}})
      const changeAddresses = data.data.filter(address => address.change).map((address) => {return {address: address.address, program: address.controlProgram}})

      this.setState({addresses: normalAddresses, changeAddresses})
    })
  }

  createReceiver() {
    this.props.createReceiver({
      account_alias: this.props.item.alias
    }).then(({data: receiver}) => this.props.showModal(<div>
      <p>Copy this one-time use address to use in a transaction:</p>
      <CopyableBlock value={JSON.stringify({
        controlProgram: receiver.controlProgram,
        expiresAt: receiver.expiresAt
      }, null, 1)}/>
    </div>))
  }

  createAddress() {
    const lang = this.props.lang
    this.props.createAddress({
      account_alias: this.props.item.alias
    }).then(({data}) => {
      this.listAddress()
      this.props.showModal(<div>
        <p>{lang === 'zh' ? '拷贝这个地址以用于交易中：' : 'Copy this address to use in a transaction:'}</p>
        <CopyableBlock value={data.address} lang={lang}/>
      </div>)
    })
  }

  showProgram(program){
    const lang = this.props.lang
    this.props.showModal(
      <div>
        <p>{lang === 'zh' ? '拷贝这个控制程序以用于交易中：' : 'Copy this control program to use in a transaction:'}</p>
        <CopyableBlock value={program} lang={lang}/>
      </div>
    )
  }

  render() {
    const item = this.props.item
    const lang = this.props.lang

    let view
    if (item) {
      const title = <span>
        {lang === 'zh' ? '账户' : 'Account '}
        <code>{item.alias ? item.alias : item.id}</code>
      </span>

      view = <div className={componentClassNames(this)}>
        <PageTitle
          title={title}
          actions={[
            <button className='btn btn-link' onClick={this.createAddress}>
              {lang === 'zh' ? '新建地址' : 'Create address'}
            </button>,
          ]}
        />

        <PageContent>
          <KeyValueTable
            id={item.id}
            object='account'
            title={lang === 'zh' ? '详情' : 'Details'}
            actions={[
              // TODO: add back first 2 buttons
              // <button key='show-txs' className='btn btn-link' onClick={this.props.showTransactions.bind(this, item)}>Transactions</button>,
              // <button key='show-balances' className='btn btn-link' onClick={this.props.showBalances.bind(this, item)}>Balances</button>,
              <RawJsonButton key='raw-json' item={item}/>
            ]}
            items={[
              {label: 'ID', value: item.id},
              {label: (lang === 'zh' ? '别名' : 'Alias'), value: item.alias},
              {label: (lang === 'zh' ? '扩展公钥数' : 'xpubs'), value: (item.xpubs || []).length},
              {label: (lang === 'zh' ? '签名数' : 'Quorum') , value: item.quorum},
            ]}
            lang={lang}
          />

          {(item.xpubs || []).map((key, index) =>
            <KeyValueTable
              key={index}
              title={lang === 'zh' ? `扩展公钥 ${index + 1}` :`XPUB ${index + 1}`}
              items={[
                {label: (lang === 'zh' ? '账户公钥' :'Account Xpub'), value: key},
                {label: (lang === 'zh' ? '密钥索引' : 'Key Index'), value: item.keyIndex},
              ]}
              lang={lang}
            />
          )}

          {(this.state.addresses || []).length > 0 &&
          <KeyValueTable title={lang === 'zh' ? '地址' : 'Addresses'}
                         lang={lang}
                         items={this.state.addresses.map((item, index) => ({
                           label: index,
                           value: item.address,
                           program: (e => this.showProgram(item.program))
                         }))}/>
          }

          {(this.state.changeAddresses || []).length > 0 &&
          <KeyValueTable title={lang === 'zh' ? '找零地址' : 'Addresses for Change'}
                         lang={lang}
                         items={this.state.changeAddresses.map((item, index) => ({
                           label: index,
                           value: item.address,
                           program: (e => this.showProgram(item.program))
                         }))}/>
          }
        </PageContent>
      </div>
    }
    return this.renderIfFound(view)
  }
}

// Container

import {connect} from 'react-redux'
import actions from 'actions'

const mapStateToProps = (state, ownProps) => ({
  item: state.account.items[ownProps.params.id],
  lang: state.core.lang
})

const mapDispatchToProps = (dispatch) => ({
  fetchItem: (id) => dispatch(actions.account.fetchItems({id: `${id}`})),
  showTransactions: (item) => {
    let filter = `inputs(account_id='${item.id}') OR outputs(account_id='${item.id}')`
    if (item.alias) {
      filter = `inputs(account_alias='${item.alias}') OR outputs(account_alias='${item.alias}')`
    }

    dispatch(actions.transaction.pushList({filter}))
  },
  showBalances: (item) => {
    let filter = `account_id='${item.id}'`
    if (item.alias) {
      filter = `account_alias='${item.alias}'`
    }

    dispatch(actions.balance.pushList({filter}))
  },
  createReceiver: (data) => dispatch(actions.account.createReceiver(data)),
  createAddress: (data) => dispatch(actions.account.createAddress(data)),
  showModal: (body) => dispatch(actions.app.showModal(
    body,
    actions.app.hideModal
  )),
  listAddress: actions.account.listAddresses
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountShow)
