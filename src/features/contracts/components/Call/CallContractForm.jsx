import {BaseNew, ErrorBanner, FormSection, HiddenField, TextField} from 'features/shared/components'
import {reduxForm} from 'redux-form'
import React from 'react'
import styles from './Call.scss'
import disableAutocomplete from 'utility/disableAutocomplete'
import actions from 'actions'

class CallContractForm extends React.Component {
  constructor(props) {
    super(props)

    this.submitWithValidation = this.submitWithValidation.bind(this)
  }

  submitWithValidation(data) {
    return new Promise((resolve, reject) => {
      this.props.submitForm(Object.assign({}, data, {form: 'callContract'}))
        .catch((err) => {
          const response = {}
          response['_error'] = err
          return reject(response)
        })
        .then((resp) => {
          if (resp.status == 'fail') {
            let err = new Error(resp.msg)
            err.code = resp.code
            err.chainMessage = resp.msg
            if (resp.detail) {
              err.detail = resp.detail
            } else {
              err.detail = resp.errorDetail
            }
            err.resp = resp

            const response = {}
            response['_error'] = err
            return reject(response)
          }
          this.props.showJsonModal(<pre>{JSON.stringify(resp.data, null, 2)}</pre>)
        })
    })
  }

  render() {
    const {
      fields: {type, from, to, input},
      error,
      handleSubmit,
    } = this.props
    const lang = this.props.lang

    let submitLabel = lang === 'zh' ? '调用合约' : 'Call contract'

    return (
      <form onSubmit={handleSubmit(this.submitWithValidation)} {...disableAutocomplete}>

        <FormSection>
          {<HiddenField fieldProps={type}/>}

          {<TextField title={lang === 'zh' ? '发送者地址' : 'Sender address'} fieldProps={from}/>}

          {<TextField title={lang === 'zh' ? '合约地址' : 'Contract address'} fieldProps={to}/>}

          {<TextField title={lang === 'zh' ? '输入数据' : 'Input data'} fieldProps={input}/>}

        </FormSection>

        <FormSection className={styles.submitSection}>
          {error &&
          <ErrorBanner
            title={lang === 'zh' ? '调用失败' : 'Error calling contract'}
            error={error}/>}

          <div className={styles.submit}>
            <button type='submit' className='btn btn-primary'>
              {submitLabel || (lang === 'zh' ? '提交' : 'Submit')}
            </button>
          </div>
        </FormSection>
      </form>
    )
  }
}

export default BaseNew.connect(
  (state, ownProps) => ({
    ...BaseNew.mapStateToProps('contract')(state, ownProps),
  }),
  (dispatch) => ({
    ...BaseNew.mapDispatchToProps('contract')(dispatch),
    showJsonModal: (body) => dispatch(actions.app.showModal(
      body,
      actions.app.hideModal,
      null,
      {wide: true}
    )),
  }),
  reduxForm({
      form: 'CallContractForm',
      fields: [
        'type',
        'from',
        'to',
        'input',
        'submitAction',
      ],
      touchOnChange: true,
      initialValues: {
        submitAction: 'submit',
      },
    }
  )(CallContractForm)
)


