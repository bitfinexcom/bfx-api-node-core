'use strict'

const {
  Trade, Order, Position, FundingOffer, FundingCredit, FundingLoan, Wallet,
  BalanceInfo, MarginInfo, FundingInfo, FundingTrade
} = require('bfx-api-node-models')

const onNotification = require('./notifications')
const getMsgPayload = require('../../util/msg_payload')

const modelMap = {
  te: Trade,
  tu: Trade,

  os: Order,
  ou: Order,
  on: Order,
  oc: Order,

  ps: Position,
  pn: Position,
  pu: Position,
  pc: Position,

  fos: FundingOffer,
  fon: FundingOffer,
  fou: FundingOffer,
  foc: FundingOffer,

  fcs: FundingCredit,
  fcn: FundingCredit,
  fcu: FundingCredit,
  fcc: FundingCredit,

  fls: FundingLoan,
  fln: FundingLoan,
  flu: FundingLoan,
  flc: FundingLoan,

  ws: Wallet,
  wu: Wallet,
  bu: BalanceInfo,
  miu: MarginInfo,

  fiu: FundingInfo,
  fte: FundingTrade,
  ftu: FundingTrade,
}

module.exports = (args = {}) => {
  const { state = {}, msg = [] } = args
  const { emit, transform } = state
  const [ chanId, type ] = msg

  if (type === 'n') {
    return onNotification(args)
  } else {
    if (transform && !modelMap[type]) { // should never happen, hence critical
      throw new Error(`recv message type not in model map: ${type}`)
    }

    const payload = getMsgPayload(msg)
    const transformed = new modelMap[type](payload)
    const data = transform
      ? transformed
      : payload

    // Note that only the inner payload is transformed, as the type is needed to
    // relay the message within the listening manager instance.
    emit('data:auth', [chanId, type, data, transformed])
  }

  return null
}
