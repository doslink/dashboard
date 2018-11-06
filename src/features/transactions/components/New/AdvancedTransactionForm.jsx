import {BaseNew, ErrorBanner, FieldLabel, FormSection, PasswordField, SubmitIndicator} from 'features/shared/components'
import TransactionDetails from './MultiSignTransactionDetails/TransactionDetails'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import {reduxForm} from 'redux-form'
import ActionItem from './FormActionItem'
import React from 'react'
import styles from './New.scss'
import disableAutocomplete from 'utility/disableAutocomplete'
import actions from 'actions'

class AdvancedTxForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showDropdown: false,
      showAdvanced: false
    }

    this.submitWithValidation = this.submitWithValidation.bind(this)
    this.addActionItem = this.addActionItem.bind(this)
    this.removeActionItem = this.removeActionItem.bind(this)
    this.toggleDropwdown = this.toggleDropwdown.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
  }

  toggleDropwdown() {
    this.setState({showDropdown: !this.state.showDropdown})
  }

  closeDropdown() {
    this.setState({showDropdown: false})
  }

  addActionItem(type) {
    this.props.fields.actions.addField({
      type: type,
    })
    this.closeDropdown()
  }

  disableSubmit(actions) {
    return actions.length == 0 && !this.state.showAdvanced
  }

  removeActionItem(index) {
    this.props.fields.actions.removeField(index)
  }

  submitWithValidation(data) {
    return new Promise((resolve, reject) => {
      this.props.submitForm(Object.assign({}, data, {state: this.state, form: 'advancedTx'}))
        .catch((err) => {
          const response = {}

          if (err.data) {
            response.actions = []

            err.data.forEach((error) => {
              response.actions[error.data.actionIndex] = {type: error}
            })
          }

          response['_error'] = err
          return reject(response)
        })
    })
  }

  render() {
    const {
      fields: {signTransaction, actions, submitAction, password},
      error,
      handleSubmit,
      submitting
    } = this.props
    const lang = this.props.lang

    let submitLabel = lang === 'zh' ? '提交交易' : 'Submit transaction'
    const hasBaseTransaction = ((signTransaction.value || '').trim()).length > 0
    if (submitAction.value == 'generate' && !hasBaseTransaction) {
      submitLabel = lang === 'zh' ? '生成交易JSON' : 'Generate transaction JSON'
    }

    return (
      <form onSubmit={handleSubmit(this.submitWithValidation)} {...disableAutocomplete}
        // onKeyDown={(e) => { this.props.handleKeyDown(e, handleSubmit(this.submitWithValidation), this.disableSubmit(actions)) }}
      >

        <FormSection title={lang === 'zh' ? '动作列表' : 'Actions'}>
          {actions.map((action, index) =>
            <ActionItem
              key={index}
              index={index}
              fieldProps={action}
              accounts={this.props.accounts}
              assets={this.props.assets}
              remove={this.removeActionItem}
              lang={lang}
              decimal={this.props.assetDecimal(action)}
            />)}

          <div className={`btn-group ${styles.addActionContainer} ${this.state.showDropdown && 'open'}`}>
            <DropdownButton
              className={`btn btn-default ${styles.addAction}`}
              id='input-dropdown-addon'
              title={lang === 'zh' ? '+ 添加动作' : '+ Add action'}
              onSelect={this.addActionItem}
            >
              <MenuItem eventKey='issue'>{lang === 'zh' ? '发行资产' : 'Issue'}</MenuItem>
              <MenuItem eventKey='spend_account'>{lang === 'zh' ? '使用账户余额' : 'Spend from account'}</MenuItem>
              <MenuItem eventKey='control_address'>{lang === 'zh' ? '输出到地址' : 'Control with address'}</MenuItem>
              <MenuItem eventKey='retire'>{lang === 'zh' ? '回收资产' : 'Retire'}</MenuItem>
              <MenuItem eventKey='create_contract'>{lang === 'zh' ? '创建合约' : 'Create contract'}</MenuItem>
              <MenuItem eventKey='sendto_contract'>{lang === 'zh' ? '执行合约交易' : 'Send to contract'}</MenuItem>
              <MenuItem eventKey='set_transaction_reference_data'>{lang === 'zh' ? '设置交易引用数据' : 'Set transaction reference data'}</MenuItem>
              <MenuItem eventKey='deposit'>{lang === 'zh' ? '存储' : 'Deposit'}</MenuItem>
              <MenuItem eventKey='withdraw'>{lang === 'zh' ? '提取' : 'Withdraw'}</MenuItem>
            </DropdownButton>
          </div>
        </FormSection>

        {!this.state.showAdvanced &&
        <FormSection>
          <a href='#'
             className={styles.showAdvanced}
             onClick={(e) => {
               e.preventDefault()
               this.setState({showAdvanced: true})
             }}
          >
            {lang === 'zh' ? '显示高级选项' : 'Show advanced options'}
          </a>
        </FormSection>
        }

        {this.state.showAdvanced &&
        <FormSection title={lang === 'zh' ? '高级选项' : 'Advanced Options'}>
          <div>
            <TransactionDetails
              lang={lang}
              fieldProps={signTransaction}
              decode={this.props.decode}
              transaction={this.props.decodedTx}
              showJsonModal={this.props.showJsonModal}
            />

            <FieldLabel>{lang === 'zh' ? '交易构建类型' : 'Transaction Build Type'}</FieldLabel>
            <table className={styles.submitTable}>
              <tbody>
              <tr>
                <td><input id='submit_action_submit' type='radio' {...submitAction} value='submit'
                           checked={submitAction.value == 'submit'}/></td>
                <td>
                  <label
                    htmlFor='submit_action_submit'>{lang === 'zh' ? '向区块链提交交易' : 'Submit transaction to blockchain'}</label>
                  <br/>
                  <label htmlFor='submit_action_submit' className={styles.submitDescription}>
                    {lang === 'zh' ? '此次交易将通过密钥签名然后提交到区块链。' :
                      'This transaction will be signed by the key and submitted to the blockchain.'}
                  </label>
                </td>
              </tr>
              <tr>
                <td><input id='submit_action_generate' type='radio' {...submitAction} value='generate'
                           checked={submitAction.value == 'generate'}/></td>
                <td>
                  <label htmlFor='submit_action_generate'>{lang === 'zh' ? '需要更多签名' : 'Need more signature'}</label>
                  <br/>
                  <label htmlFor='submit_action_generate' className={styles.submitDescription}>
                    {lang === 'zh' ? '这些actions将通过密钥签名然后作为一个交易 JSON 字符串返回。 作为多签交易的输入，这个JSON字符串需要更多的签名数据。' :
                      'These actions will be signed by the Key and returned as a transaction JSON string, ' +
                      'which should be used to sign transaction in a multi-sign spend.'}
                  </label>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </FormSection>}

        {(actions.length > 0 || this.state.showAdvanced) && <FormSection>
          <label className={styles.title}>{lang === 'zh' ? '密码' : 'Password'}</label>
          <PasswordField
            placeholder={lang === 'zh' ? '请输入密码' : 'Please enter the password'}
            fieldProps={password}
          />
        </FormSection>}

        <FormSection className={styles.submitSection}>
          {error &&
          <ErrorBanner
            title='Error submitting form'
            error={error}/>}

          <div className={styles.submit}>
            <button type='submit' className='btn btn-primary' disabled={submitting || this.disableSubmit(actions)}>
              {submitLabel || (lang === 'zh' ? '提交' : 'Submit')}
            </button>

            {submitting &&
            <SubmitIndicator/>
            }
          </div>
        </FormSection>
      </form>
    )
  }
}

const validate = (values, props) => {
  const errors = {actions: {}}
  const lang = props.lang

  // Base transaction
  let baseTx = (values.signTransaction || '').trim()
  try {
    JSON.parse(baseTx)
  } catch (e) {
    if (baseTx && e) {
      errors.signTransaction = (lang === 'zh' ? '请使用JSON字符来签名交易' : 'To sign transaction must be a JSON string.')
    }
  }

  // Actions
  let numError
  values.actions.forEach((action, index) => {
    if (values.actions[index].amount) {
      numError = (!/^\d+(\.\d+)?$/i.test(values.actions[index].amount))
      if (numError) {
        errors.actions[index] = {...errors.actions[index], amount: (lang === 'zh' ? '请输入数字' : 'Invalid amount type')}
      }
    }
  })
  return errors
}

export default BaseNew.connect(
  (state, ownProps) => ({
    ...BaseNew.mapStateToProps('transaction')(state, ownProps),
    decodedTx: state.transaction.decodedTx
  }),
  (dispatch) => ({
    ...BaseNew.mapDispatchToProps('transaction')(dispatch),
    decode: (transaction) => dispatch(actions.transaction.decode(transaction)),
    showJsonModal: (body) => dispatch(actions.app.showModal(
      body,
      actions.app.hideModal,
      null,
      {wide: true}
    )),
  }),
  reduxForm({
      form: 'AdvancedTransactionForm',
      fields: [
        'signTransaction',
        'actions[].accountId',
        'actions[].accountAlias',
        'actions[].assetId',
        'actions[].assetAlias',
        'actions[].amount',
        'actions[].outputId',
        'actions[].type',
        'actions[].address',
        'actions[].password',
        'actions[].from',
        'actions[].to',
        'actions[].input',
        'actions[].referenceData',
        'submitAction',
        'password'
      ],
      validate,
      touchOnChange: true,
      initialValues: {
        submitAction: 'submit',
      },
    }
  )(AdvancedTxForm)
)


