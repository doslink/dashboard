const shared = require('../shared')

const contractsAPI = (client) => {
  return {
    call: (params, cb) => shared.query(client, 'contracts', '/call-contract', params, {cb}),
  }
}

module.exports = contractsAPI
