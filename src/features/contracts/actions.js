import {chainClient} from 'utility/environment'
import {baseCreateActions} from 'features/shared/actions'

const type = 'contract'

const form = baseCreateActions(type)

form.submitForm = (formParams) => function () {
  const client = chainClient()

  return client.contracts.call(formParams)
}

export default {
  ...form,
}
