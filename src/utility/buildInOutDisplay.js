import { NativeAssetID,NativeAssetAmountUnit } from './environment'

const mappings = {
  id: 'ID',
  type: 'Type',
  purpose: 'Purpose',
  transactionId: 'Transaction ID',
  position: 'Position',
  assetId: 'Asset ID',
  assetAlias: 'Asset Alias',
  assetDefinition: 'Asset Definition',
  assetTags: 'Asset Tags',
  assetIsLocal: 'Asset Is Local?',
  amount: 'Amount',
  accountId: 'Account ID',
  accountAlias: 'Account Alias',
  accountTags: 'Account Tags',
  controlProgram: 'Control Program',
  address: 'Address',
  programIndex: 'Program Index',
  spentOutputId: 'Spent Output ID',
  refData: 'Reference Data',
  sourceId: 'Source ID',
  sourcePos: 'Source Position',
  issuanceProgram: 'Issuance Program',
  isLocal: 'Local?',
  referenceData: 'Reference Data',
  change: 'Change',
  nonce: 'Nonce',
  contract: 'Contract',
  data: 'Data',
  topics: 'Topics',
}

const mappings_ZH = {
  id: 'ID',
  type: '类型',
  purpose: 'Purpose',
  transactionId: '交易ID',
  position: '位置',
  assetId: '资产ID',
  assetAlias: '资产别名',
  assetDefinition: '资产定义',
  assetTags: 'Asset Tags',
  assetIsLocal: 'Asset Is Local?',
  amount: '数量',
  accountId: '账户ID',
  accountAlias: '账户别名',
  accountTags: 'Account Tags',
  controlProgram: '控制程序',
  address: '地址',
  programIndex: '程序索引',
  spentOutputId: '花费输出ID',
  refData: 'Reference Data',
  sourceId: '源ID',
  sourcePos: '源位置',
  issuanceProgram: '资产发布程序',
  isLocal: 'Local?',
  referenceData: 'Reference Data',
  change: '找零',
  nonce: 'Nonce',
  contract: '合约',
  data: '数据',
  topics: 'Topics',
}

const txInputFields = [
  'type',
  'assetId',
  'assetAlias',
  'assetDefinition',
  'assetTags',
  'assetIsLocal',
  'amount',
  'accountId',
  'accountAlias',
  'accountTags',
  'issuanceProgram',
  'controlProgram',
  'address',
  'spentOutputId',
  'isLocal',
  'referenceData',
  'nonce',
  'contract',
  'data',
]

const txOutputFields = [
  'type',
  'purpose',
  'id',
  'position',
  'assetId',
  'assetAlias',
  'assetDefinition',
  'assetTags',
  'assetIsLocal',
  'amount',
  'accountId',
  'accountAlias',
  'accountTags',
  'controlProgram',
  'address',
  'isLocal',
  'referenceData',
]

const txLogFields = [
  'address',
  'topics',
  'data',
]

const unspentFields = [
  'type',
  'purpose',
  'transactionId',
  'position',
  'assetId',
  'assetAlias',
  'assetDefinition',
  'assetTags',
  'assetIsLocal',
  'amount',
  'accountId',
  'accountAlias',
  'accountTags',
  'controlProgram',
  'programIndex',
  'refData',
  'sourceId',
  'sourcePos',
  'isLocal',
  'referenceData',
  'change',
]

const balanceFields = Object.keys(mappings)

const buildDisplay = (item, fields, nativeAssetAmountUnit, lang) => {
  const details = []
  const decimals = (item.assetDefinition && item.assetDefinition.decimals && item.assetId !== NativeAssetID)?
    item.assetDefinition.decimals: null
  fields.forEach(key => {
    if (item.hasOwnProperty(key)) {
      if(key === 'amount'){
        details.push({
          label: ( lang === 'zh'? mappings_ZH[key]: mappings[key] ),
          value: decimals? formatIntNumToPosDecimal(item[key], decimals) :normalizeGlobalNativeAssetAmount(item['assetId'], item[key], nativeAssetAmountUnit)
        })
      }else{
        details.push({label: ( lang === 'zh'? mappings_ZH[key]: mappings[key] ), value: item[key]})
      }
    }
  })
  return details
}

const addZeroToDecimalPos = (src,pos) => {
  if(src != null && src !== '' ){
    let srcString = src.toString()
    let rs = srcString.indexOf('.')
    if (rs < 0) {
      rs = srcString.length
      srcString += '.'
    }
    while (srcString.length <= rs + pos) {
      srcString += '0'
    }
    return srcString
  }
  return src
}

const formatIntNumToPosDecimal = (uny,pos) => {
  if(uny != null && uny !== ''){
    let unyString = uny.toString()
    let unyLength = unyString.length
    if(unyLength <= pos){
      let zeros = ''
      while(zeros.length < pos - unyLength){
        zeros += '0'
      }
      return '0.'+ zeros + unyString
    }else {
      return unyString.slice(0, -pos) + '.' + unyString.slice(-pos)
    }
  }
  return uny
}

export const normalizeGlobalNativeAssetAmount = (assetID, amount, nativeAssetAmountUnit) => {
  //normalize NativeAsset Amount
  if (assetID === NativeAssetID) {
    switch (nativeAssetAmountUnit){
      case NativeAssetAmountUnit[0]:
        return formatIntNumToPosDecimal(amount, 8)+' '+NativeAssetAmountUnit[0]
      case NativeAssetAmountUnit[1]:
        return formatIntNumToPosDecimal(amount, 5)+' '+NativeAssetAmountUnit[1]
      case NativeAssetAmountUnit[2]:
        return amount+' '+NativeAssetAmountUnit[2]
    }
  }
  return amount
}

export const normalizeNativeAsset = (amount, nativeAssetAmountUnit) => {
  switch (nativeAssetAmountUnit){
    case NativeAssetAmountUnit[0]:
      return formatIntNumToPosDecimal(amount, 8)+' '+NativeAssetAmountUnit[0]
    case NativeAssetAmountUnit[1]:
      return formatIntNumToPosDecimal(amount, 5)+' '+NativeAssetAmountUnit[1]
    case NativeAssetAmountUnit[2]:
      return amount+' '+NativeAssetAmountUnit[2]
  }
}

export function formatNativeAssetAmount(value, pos)  {
  if (!value) {
    return value
  }

  const onlyNums = value.toString().replace(/[^0-9.]/g, '')

  // Create an array with sections split by .
  const sections = onlyNums.split('.')

  // Remove any leading 0s apart from single 0
  if (sections[0] !== '0' && sections[0] !== '00') {
    sections[0] = sections[0].replace(/^0+/, '')
  } else {
    sections[0] = '0'
  }

  // If numbers exist after first .
  if (sections[1]) {
    return sections[0] + '.' + sections[1].slice(0, pos)
  } else if (onlyNums.indexOf('.') !== -1 && pos !== 0) {
    return sections[0] + '.'
  } else {
    return sections[0]
  }
}

export function parseNativeAssetAmount(value, pos){
  if (!value) {
    return value
  }

  const onlyNums = value.replace(/[^0-9.]/g, '')
  const sections = onlyNums.split('.')

  let numDecimal = ''

  if (sections[1]) {
    numDecimal = sections[1].slice(0, pos)
  }
  while (numDecimal.length < pos) {
    numDecimal += '0'
  }

  //remove all the leading 0s
  let amountNum = sections[0] + numDecimal
  if(/^0*$/.test(amountNum)){
    amountNum = '0'
  }else {
    amountNum = amountNum.replace(/^0+/, '')
  }

  return amountNum
}

export function normalizeNativeAssetAmountUnit(assetID, amount, nativeAssetAmountUnit) {
  return normalizeGlobalNativeAssetAmount(assetID, amount, nativeAssetAmountUnit)
}

export function addZeroToDecimalPosition(value, deciPoint){
  return addZeroToDecimalPos(value, deciPoint)
}

export function converIntToDec(int, deciPoint){
  return formatIntNumToPosDecimal(int, deciPoint)
}

export function buildTxInputDisplay(input, nativeAssetAmountUnit, lang) {
  return buildDisplay(input, txInputFields, nativeAssetAmountUnit, lang)
}

export function buildTxOutputDisplay(output, nativeAssetAmountUnit, lang) {
  return buildDisplay(output, txOutputFields, nativeAssetAmountUnit, lang)
}

export function buildTxLogDisplay(log, nativeAssetAmountUnit, lang) {
  return buildDisplay(log, txLogFields, nativeAssetAmountUnit, lang)
}

export function buildUnspentDisplay(output, nativeAssetAmountUnit, lang) {
  const normalized = {
    amount: output.amount,
    accountId: output.accountId,
    accountAlias: output.accountAlias,
    assetId: output.assetId,
    assetAlias: output.assetAlias,
    controlProgram: output.program,
    programIndex: output.controlProgramIndex,
    sourceId: output.sourceId,
    sourcePos: output.sourcePos,
    change: output.change + ''
  }
  return buildDisplay(normalized, unspentFields, nativeAssetAmountUnit, lang)
}

export function buildBalanceDisplay(balance, nativeAssetAmountUnit, lang) {
  let amount = (balance.assetDefinition && balance.assetDefinition.decimals && balance.assetId !== NativeAssetID)?
    formatIntNumToPosDecimal(balance.amount, balance.assetDefinition.decimals): balance.amount
  return buildDisplay({
    amount: amount,
    assetId: balance.assetId,
    assetAlias: balance.assetAlias,
    accountAlias: balance.accountAlias
  }, balanceFields, nativeAssetAmountUnit, lang)
}
