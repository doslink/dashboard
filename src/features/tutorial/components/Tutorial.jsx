import React from 'react'
import TutorialInfo from './TutorialInfo/TutorialInfo'
import TutorialForm from './TutorialForm/TutorialForm'

const components = {
  TutorialInfo,
  TutorialForm
}

class Tutorial extends React.Component {
  render() {
    const tutorialOpen = !this.props.tutorial.location.isVisited || (this.props.tutorial.showHeader !== HeaderState.HIDE)
    const tutorialTypes = this.props.types
    const TutorialComponent = this.props.content ? components[this.props.content['component']]: components['TutorialInfo']

    return (
      <div>
        {this.props.content && tutorialOpen && (tutorialTypes.includes(this.props.content['component'])) &&
          <TutorialComponent
            lang={this.props.lang}
            advTx={this.props.advTx}
            {...this.props.content}
          />}
      </div>
    )
  }
}

import { connect } from 'react-redux'
import {HeaderState} from "../reducers";

const mapStateToProps = (state) => ({
  content: state.tutorial.content,
  tutorial: state.tutorial,
  lang: state.core.lang
})

export default connect(
  mapStateToProps
)(Tutorial)
