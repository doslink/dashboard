import React from 'react'
import { Link } from 'react-router'
import { converIntToDec } from 'utility/buildInOutDisplay'
import { NativeAssetID,NativeAssetAmountUnit } from 'utility/environment'
import styles from './Summary.scss'
import {CoinbasePendingBlockNumber} from "utility/environment";

const INOUT_TYPES = {
  issue: 'Issue',
  spend: 'Spend',
  control: 'Control',
  retire: 'Retire',
}

class Summary extends React.Component {
  normalizeInouts(inouts) {
    const normalized = {}

    inouts.forEach(inout => {
      let asset = normalized[inout.assetId]
      if (!asset) asset = normalized[inout.assetId] = {
        alias: inout.assetAlias,
        decimals: (inout.assetDefinition && inout.assetDefinition.decimals && inout.assetId !== NativeAssetID)? inout.assetDefinition.decimals : null,
        issue: 0,
        retire: 0
      }

      if (['issue', 'retire'].includes(inout.type)) {
        asset[inout.type] += inout.amount
      } else {
        let accountKey = inout.accountId || 'external'
        let account = asset[accountKey]
        if (!account) account = asset[accountKey] = {
          alias: inout.accountAlias,
          spend: 0,
          control: 0
        }

        if (inout.type == 'spend') {
          account.spend += inout.amount
        } else if (inout.type == 'control' && inout.purpose == 'change') {
          account.spend -= inout.amount
        } else if (inout.type == 'control') {
          account.control += inout.amount
        }
      }
    })

    return normalized
  }

  render() {
    const item = this.props.transaction
    const confirmation = item.confirmations
    const isCoinbase = item.inputs.length > 0 && item.inputs[0].type === 'coinbase'
    const mature = isCoinbase && confirmation >= CoinbasePendingBlockNumber

    const inouts = this.props.transaction.inputs.concat(this.props.transaction.outputs)
    const summary = this.normalizeInouts(inouts)
    const items = []
    const lang = this.props.lang

    const normalizeNativeAssetAmountUnit = (assetID, amount, nativeAssetAmountUnit) => {
      //normalize NativeAsset Amount
      if (assetID === NativeAssetID) {
        switch (nativeAssetAmountUnit){
          case NativeAssetAmountUnit[0]:
            return converIntToDec(amount, 8)
          case NativeAssetAmountUnit[1]:
            return converIntToDec(amount, 5)
        }
      }
      return amount
    }

    Object.keys(summary).forEach((assetId) => {
      const asset = summary[assetId]
      const nonAccountTypes = ['issue','retire']

      nonAccountTypes.forEach((type) => {
        if (asset[type] > 0) {
          items.push({
            type: INOUT_TYPES[type],
            rawAction: type,
            amount: asset.decimals? converIntToDec(asset[type], asset.decimals) : normalizeNativeAssetAmountUnit(assetId, asset[type], this.props.nativeAssetAmountUnit),
            asset: asset.alias ? asset.alias : <code className={styles.rawId}>{assetId}</code>,
            assetId: assetId,
          })
        }
      })


      Object.keys(asset).forEach((accountId) => {
        if (nonAccountTypes.includes(accountId)) return
        const account = asset[accountId]
        if (!account) return

        if (accountId == 'external') {
          account.alias = 'external'
          accountId = null
        }

        const accountTypes = ['spend', 'control']
        accountTypes.forEach((type) => {
          if (account[type] > 0) {
            items.push({
              type: INOUT_TYPES[type],
              rawAction: type,
              amount: asset.decimals? converIntToDec(account[type], asset.decimals) : normalizeNativeAssetAmountUnit(assetId, account[type], this.props.nativeAssetAmountUnit),
              asset: asset.alias ? asset.alias : <code className={styles.rawId}>{assetId}</code>,
              assetId: assetId,
              direction: type == 'spend' ? 'from' : 'to',
              account: account.alias ? account.alias : <code className={styles.rawId}>{accountId}</code>,
              accountId: accountId,
            })
          }
        })
      })
    })

    const ordering = ['issue', 'spend', 'control', 'retire']
    items.sort((a,b) => {
      return ordering.indexOf(a.rawAction) - ordering.indexOf(b.rawAction)
    })

    return(<table className={styles.main}>
      <tbody>
        {items.map((item, index) =>
          <tr key={index}>
            {
              !isCoinbase && <td className={styles.colAction}>{item.type}</td>
            }
            {
              isCoinbase && <td className={styles.colAction}>
                Coinbase
                {!mature && <small className={styles.immature}>{ lang === 'zh' ? '未成熟' : 'immature' }</small>}
              </td>
            }
            <td className={styles.colLabel}>{ lang === 'zh' ? '数量' : 'amount' }</td>
            <td className={styles.colAmount}>
              <code className={styles.amount}>{item.amount}</code>
            </td>
            <td className={styles.colLabel}>{ lang === 'zh' ? '资产' : 'asset' }</td>
            <td className={styles.colAccount}>
              <Link to={`/assets/${item.assetId}`}>
                {item.asset}
              </Link>
            </td>
            <td className={styles.colLabel}>{item.account && ( lang === 'zh' ? '账户' : 'account')}</td>
            <td className={styles.colAccount}>
              {item.accountId && <Link to={`/accounts/${item.accountId}`}>
                {item.account}
              </Link>}
              {!item.accountId && item.account}
            </td>
          </tr>
        )}
      </tbody>
    </table>)
  }
}

export default Summary
