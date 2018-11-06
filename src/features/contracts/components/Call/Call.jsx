import {PageTitle} from 'features/shared/components'
import React from 'react'
import {connect} from 'react-redux'
import styles from './Call.scss'
import componentClassNames from 'utility/componentClassNames'
import CallContractForm from './CallContractForm'
import {withRouter} from 'react-router'
import {getValues} from 'redux-form'

class Call extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showAdvanceTx: false
    }
  }

  handleKeyDown(e, cb, disable) {
    if (e.key === 'Enter' && e.shiftKey === false && !disable) {
      e.preventDefault()
      cb()
    }
  }

  render() {
    const lang = this.props.lang

    return (
      <div className={componentClassNames(this, 'flex-container')}>
        <PageTitle title={lang === 'zh' ? '调用合约' : 'Call contract'}/>

        <div className={`${styles.mainContainer} flex-container`}>
          <div className={styles.content}>
            {<CallContractForm
              lang={this.props.lang}
              asset={this.props.asset}
              handleKeyDown={this.handleKeyDown}
            />}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  (state) => {
    return {
      lang: state.core.lang,
      callContractForm: getValues(state.form.CallContractForm),
    }
  },
)(withRouter(Call))