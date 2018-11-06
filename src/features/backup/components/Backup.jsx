import React from 'react'
import componentClassNames from 'utility/componentClassNames'
import {PageContent, PageTitle} from 'features/shared/components'
import styles from './Backup.scss'
import {connect} from 'react-redux'
import {chainClient} from 'utility/environment'
import actions from 'actions'
import {NativeChainName} from "../../../utility/environment";

class Backup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null
    }
  }

  setValue(event) {
    this.setState({
      value:event.target.value
    })
  }

  backup() {
    chainClient().backUp.backup()
      .then(resp => {
        const date = new Date()
        const dateStr = date.toLocaleDateString().split(' ')[0]
        const timestamp = date.getTime()
        const fileName = [NativeChainName+'-wallet-backup-', dateStr, timestamp].join('-')

        let element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(resp.data)))
        element.setAttribute('download', fileName)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()

        document.body.removeChild(element)
      })
      .catch(err => { throw {_error: err} })
  }

  handleFileChange(event) {
    const files = event.target.files
    if (files.length <= 0) {
      this.setState({key: null})
      return
    }

    const fileReader = new FileReader()
    fileReader.onload = fileLoadedEvent => {
      const backupData = JSON.parse(fileLoadedEvent.target.result)
      this.props.restoreFile(backupData)
    }
    fileReader.readAsText(files[0], 'UTF-8')

    const fileElement = document.getElementById(NativeChainName+'-restore-file-upload')
    fileElement.value = ''
  }

  restore() {
    const element = document.getElementById(NativeChainName+'-restore-file-upload')
    element.click()
  }

  render() {
    const lang = this.props.core.lang

    const newButton = <button className={`btn btn-primary btn-lg ${styles.submit}`} onClick={this.backup.bind(this)}>
      {lang === 'zh' ? '下载备份' : 'Download Backup'}
    </button>
    const restoreButton = <button className={`btn btn-primary btn-lg ${styles.submit}`} onClick={this.restore.bind(this)}>
      {lang === 'zh' ? '选择备份文件' : 'Select Restore File'}
    </button>
    // const rescanButton = <button className={`btn btn-primary btn-lg ${styles.submit}`}  onClick={() => this.props.rescan()}>
    //   {lang === 'zh' ? '重新扫描' : 'Rescan'}
    // </button>

    return (
      <div className='flex-container'>
        <PageTitle title={lang === 'zh' ? '备份与恢复' : 'Backup and Restore'}/>
        <PageContent>

          <div onChange={e => this.setValue(e)}>
            <div className={styles.choices}>
              <div className={styles.choice_wrapper}>
                <label>
                  <input className={styles.choice_radio_button}
                         type='radio'
                         name='type'
                         value='backup'/>
                  <div className={`${styles.choice} ${styles.backup} `}>
                    <span className={styles.choice_title}>{lang === 'zh' ?'备份':'Back Up'}</span>
                    <p>
                      {lang === 'zh' ?
                        '这个选项备份所有本地数据，包括账户，资产和余额。 请妥善保管你的备份文件。' :
                      'This option will back up all data stored in this core, including blockchain data, accounts, assets and balances.'}
                    </p>
                  </div>
                </label>
              </div>

              <div className={styles.choice_wrapper}>
                <label>
                  <input className={styles.choice_radio_button}
                         type='radio'
                         name='type'
                         value='restore' />
                  <div className={`${styles.choice} ${styles.restore}`}>
                    <span className={styles.choice_title}>{lang === 'zh' ?'恢复':'Restore'}</span>
                    <p>
                      {
                        lang === 'zh' ?
                        '这个选项将从文件中恢复钱包数据。 如果你的钱包余额显示不正确，请点击扫描钱包的按钮。' :
                        'This option will restore the wallet data form a file. You might need to rescan your wallet, if you balance is not up to date.'
                      }
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.choices}>
              <div>
                {
                  this.state.value === 'backup'
                  &&<span className={styles.submitWrapper}>{newButton}</span>
                }
              </div>

              <div>
                {
                  this.state.value === 'restore'
                  &&
                    <span className={styles.submitWrapper}>{restoreButton}</span>
                }
                <input id={NativeChainName+'-restore-file-upload'} type='file'
                       style={{'display': 'none', 'alignItems': 'center', 'fontSize': '12px'}}
                       onChange={this.handleFileChange.bind(this)}/>
              </div>
            </div>
          </div>

        </PageContent>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  core: state.core,
})

const mapDispatchToProps = (dispatch) => ({
  backup: () => dispatch(actions.backUp.backup()),
  rescan: () => dispatch(actions.backUp.rescan()),
  restoreFile: (backUpFile) => dispatch(actions.backUp.restore(backUpFile)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Backup)
