import React from 'react'
import {
  BaseShow,
  PageTitle,
  PageContent,
  KeyValueTable,
  Section,
  RawJsonButton,
} from 'features/shared/components'
import { normalizeGlobalNativeAssetAmount } from 'utility/buildInOutDisplay'

import { Summary } from './'
import { buildTxInputDisplay, buildTxOutputDisplay, buildTxLogDisplay } from 'utility/buildInOutDisplay'
import { NativeAssetID } from 'utility/environment'
import moment from 'moment/moment'

class Show extends BaseShow {

  render() {
    const item = this.props.item
    const lang = this.props.lang
    const nativeAssetAmountUnit = this.props.nativeAssetAmountUnit

    let view
    if (item) {
      const confirmation = this.props.highestBlock - item.blockHeight + 1
      const nativeAssetInput = item.inputs.reduce((sum, input) => {
        if ((input.type === 'spend' || input.type === 'withdrawal') && input.assetId === NativeAssetID) {
          sum += input.amount
        }
        return sum
      }, 0)

      item.confirmations = confirmation

      const nativeAssetOutput = item.outputs.reduce((sum, output) => {
        if ((output.type === 'control' || output.type === 'deposit') && output.assetId === NativeAssetID) {
          sum += output.amount
        }
        return sum
      }, 0)

      const gasAmount = nativeAssetInput > 0 ? nativeAssetInput - nativeAssetOutput : 0

      const gas = normalizeGlobalNativeAssetAmount(NativeAssetID, gasAmount, nativeAssetAmountUnit)

      const unconfirmedItem = (item.blockHeight === 0 && item.blockId === '0000000000000000000000000000000000000000000000000000000000000000')

      const status = (!item.statusFail)? (lang === 'zh' ? '成功' : 'Succeed'): (lang === 'zh' ? '失败' : 'Failed')

      const title = <span>
        {lang === 'zh' ? '交易' : 'Transaction '}
        &nbsp;<code>{item.id}</code>
      </span>

      view = <div>
        <PageTitle title={title} />

        <PageContent>
          <Section
            title={lang === 'zh' ? '概括' : 'Summary'}
            actions={[
              <RawJsonButton key='raw-json' item={item} />
            ]}>
            <Summary transaction={item} lang={lang} nativeAssetAmountUnit={nativeAssetAmountUnit}/>
          </Section>

          <KeyValueTable
            title={lang === 'zh' ? '详情' : 'Details'}
            items={[
              {label: 'ID', value: item.id},
              {label: (lang === 'zh' ? '时间戳' : 'Timestamp'), value:  unconfirmedItem ? '-' : moment.unix(item.timestamp).format()},
              {label: (lang === 'zh' ? '区块ID' : 'Block ID'), value: unconfirmedItem? '-' : item.blockId},
              {label: (lang === 'zh' ? '区块高度': 'Block Height'), value: unconfirmedItem?
                  (lang === 'zh' ? '未知 ':'Unknown')+'(0 confirmation)':
                  (item.blockHeight + `(${confirmation} confirmation${confirmation > 1 ? 's' : ''})`)},
              {label: (lang === 'zh' ? '位置' : 'Position'), value: unconfirmedItem? '-' :item.position},
              {label: 'Gas', value: gas},
              {label: (lang === 'zh' ? '交易状态': 'Transaction status'), value: status},
              {label: (lang === 'zh' ? '引用数据': 'Reference Data'), value: item.referenceData},
            ]}
          />

          {item.inputs.map((input, index) =>
            <KeyValueTable
              key={index}
              title={index == 0 ? lang === 'zh' ? '输入' : 'Inputs' : ''}
              items={buildTxInputDisplay(input, nativeAssetAmountUnit, lang)}
            />
          )}

          {item.outputs.map((output, index) =>
            <KeyValueTable
              key={index}
              title={index == 0 ? lang === 'zh' ? '输出' : 'Outputs' : ''}
              items={buildTxOutputDisplay(output, nativeAssetAmountUnit, lang)}
            />
          )}

          {item.logs ?
            item.logs.map((log, index) =>
              <KeyValueTable
                key={index}
                title={index == 0 ? lang === 'zh' ? '日志' : 'Logs' : ''}
                items={buildTxLogDisplay(log, nativeAssetAmountUnit, lang)}
              />
            ) : ''
          }

        </PageContent>
      </div>
    }

    return this.renderIfFound(view)
  }
}

// Container

import { actions } from 'features/transactions'
import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => ({
  item: state.transaction.items[ownProps.params.id],
  lang: state.core.lang,
  nativeAssetAmountUnit: state.core.nativeAssetAmountUnit,
  highestBlock: state.core.coreData && state.core.coreData.highestBlock
})

const mapDispatchToProps = ( dispatch ) => ({
  fetchItem: (id) => dispatch(actions.fetchItems({id: `${id}`}))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Show)
