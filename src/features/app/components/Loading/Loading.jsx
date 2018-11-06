import React from 'react'
import styles from './Loading.scss'
import componentClassNames from 'utility/componentClassNames'
import {TextToImage} from 'utility/image'

class Loading extends React.Component {
  render() {

    let logo = TextToImage('oo', 175, '#c0c0c0')

    return (
      <div className={componentClassNames(this, styles.main)}>
        {/*<img src={require('images/logo-shadowed.png')} className={styles.logo}/>*/}
        <img src={logo} className={styles.logo}/>
        {this.props.children}
      </div>
    )
  }
}

export default Loading
