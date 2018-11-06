import React from 'react'
import { ErrorBanner, HiddenField, Autocomplete, JsonField, TextField, ObjectSelectorField, AmountUnitField, AmountInputMask } from 'features/shared/components'
import styles from './FormActionItem.scss'
import { NativeAssetID,NativeAssetAmountUnit } from 'utility/environment'

const ISSUE_KEY = 'issue'
const SPEND_ACCOUNT_KEY = 'spend_account'
const SPEND_UNSPENT_KEY = 'spend_account_unspent_output'
const CONTROL_RECEIVER_KEY = 'control_receiver'
const CONTROL_ADDRESS_KEY = 'control_address'
const RETIRE_ASSET_KEY = 'retire'
const CREATE_CONTRACT_KEY = 'create_contract'
const SENDTO_CONTRACT_KEY = 'sendto_contract'
const TRANSACTION_REFERENCE_DATA = 'set_transaction_reference_data'
const DEPOSIT = 'deposit'
const WITHDRAW = 'withdraw'

const actionLabels = {
  [ISSUE_KEY]: 'Issue',
  [SPEND_ACCOUNT_KEY]: 'Spend from account',
  [SPEND_UNSPENT_KEY]: 'Spend unspent output',
  [CONTROL_RECEIVER_KEY]: 'Control with receiver',
  [CONTROL_ADDRESS_KEY]: 'Control with address',
  [RETIRE_ASSET_KEY]: 'Retire',
  [CREATE_CONTRACT_KEY]: 'Create contract',
  [SENDTO_CONTRACT_KEY]: 'Send to contract',
  [TRANSACTION_REFERENCE_DATA]: 'Set transaction reference data',
  [DEPOSIT]: 'Deposit',
  [WITHDRAW]: 'Withdraw',
}

const actionLabels_zh = {
  [ISSUE_KEY]: '发行资产',
  [SPEND_ACCOUNT_KEY]: '使用账户余额',
  [SPEND_UNSPENT_KEY]: '使用未花费输出',
  [CONTROL_RECEIVER_KEY]: '输出到接收者',
  [CONTROL_ADDRESS_KEY]: '输出到地址',
  [RETIRE_ASSET_KEY]: '回收资产',
  [CREATE_CONTRACT_KEY]: '创建合约',
  [SENDTO_CONTRACT_KEY]: '执行合约交易',
  [TRANSACTION_REFERENCE_DATA]: '设置交易引用数据',
  [DEPOSIT]: '存储',
  [WITHDRAW]: '提取',
}

const visibleFields = {
  [ISSUE_KEY]: {asset: true, amount: true, password: true},
  [SPEND_ACCOUNT_KEY]: {asset: true, account: true, amount: true, password: true},
  [SPEND_UNSPENT_KEY]: {outputId: true, password: true},
  [CONTROL_RECEIVER_KEY]: {asset: true, receiver: true, amount: true},
  [CONTROL_ADDRESS_KEY]: {asset: true, address: true, amount: true},
  [RETIRE_ASSET_KEY]: {asset: true, amount: true},
  [CREATE_CONTRACT_KEY]: {account: true, from: true, input: true},
  [SENDTO_CONTRACT_KEY]: {account: true, from: true, input: true, to: true},
  [TRANSACTION_REFERENCE_DATA]: {},
  [DEPOSIT]: {asset: true, address: true, amount: true},
  [WITHDRAW]: {asset: true, account: true, address: true, amount: true},
}

export default class ActionItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      referenceDataOpen: props.fieldProps.type.value == TRANSACTION_REFERENCE_DATA
    }
    this.openReferenceData = this.openReferenceData.bind(this)
  }

  openReferenceData() {
    this.setState({referenceDataOpen: true})
  }

  componentDidMount() {
    window.scroll(
      window.scrollX,
      window.scrollY + this.scrollRef.getBoundingClientRect().top - 10
    )
  }

  render() {
    const {
      outputId,
      type,
      address,
      accountId,
      accountAlias,
      receiver,
      assetId,
      assetAlias,
      password,
      amount,
      from,
      to,
      input,
      referenceData } = this.props.fieldProps

    const visible = visibleFields[type.value] || {}
    const remove = (event) => {
      event.preventDefault()
      this.props.remove(this.props.index)
    }

    const lang = this.props.lang
    const nativeAssetAmountUnitVisible = (assetAlias.value === NativeAssetAmountUnit[0] ||
      assetId.value === NativeAssetID )

    const decimal = this.props.decimal || 0

    const classNames = [styles.main]
    if (type.error) classNames.push(styles.error)

    return (
      <div className={classNames.join(' ')} ref={ref => this.scrollRef = ref}>
        <HiddenField fieldProps={type} />

        <div className={styles.header}>
          <label className={styles.title}>{lang === 'zh' ? actionLabels_zh[type.value] : actionLabels[type.value]}</label>
          <a href='#' className='btn btn-sm btn-danger' onClick={remove}>{ lang === 'zh' ? '删除' : 'Remove' }</a>
        </div>

        {type.error && <ErrorBanner message={type.error} />}

        {visible.account &&
          <ObjectSelectorField
            keyIndex='advtx-account'
            lang={lang}
            title={ lang === 'zh' ? '账户' : 'Account' }
            aliasField={Autocomplete.AccountAlias}
            fieldProps={{
              id: accountId,
              alias: accountAlias
            }}
          />}

        {visible.receiver &&
          <JsonField title='Receiver' fieldProps={receiver} />}

        {visible.address && <TextField title={ lang === 'zh' ? '地址' :'Address'} fieldProps={address} />}

        {visible.outputId &&
          <TextField title='Output ID' fieldProps={outputId} />}

        {visible.asset &&
          <ObjectSelectorField
            keyIndex='advtx-asset'
            title={ lang === 'zh' ? '资产' :'Asset'}
            lang={lang}
            aliasField={Autocomplete.AssetAlias}
            fieldProps={{
              id: assetId,
              alias: assetAlias
            }}
          />}

        {visible.amount && !nativeAssetAmountUnitVisible &&
          <AmountInputMask title={ lang === 'zh' ? '数量' :'Amount' } fieldProps={amount} decimal={decimal} />}

        {visible.amount && nativeAssetAmountUnitVisible &&
          <AmountUnitField title={ lang === 'zh' ? '数量' :'Amount' } fieldProps={amount} />}

        {visible.from && <TextField title={ lang === 'zh' ? '发送者地址' :'Sender address'} fieldProps={from} />}

        {visible.to && <TextField title={ lang === 'zh' ? '合约地址' :'Contract address'} fieldProps={to} />}

        {visible.input && <TextField title={ lang === 'zh' ? '输入数据' :'Input data'} fieldProps={input} />}

        {visible.password && false &&
          <TextField title={lang === 'zh' ? '密码' :'Password'} placeholder={lang === 'zh' ? '密码' :'Password'} fieldProps={password} autoFocus={false} type={'password'} />
        }

        {this.state.referenceDataOpen &&
          <JsonField title={lang === 'zh' ? '引用数据': 'Reference data'} fieldProps={referenceData} lang={lang}/>
        }
        {false && !this.state.referenceDataOpen &&
          <button type='button' className='btn btn-link' onClick={this.openReferenceData}>
            {lang === 'zh' ? '添加引用数据': 'Add reference data'}
          </button>
        }
      </div>
    )
  }
}
