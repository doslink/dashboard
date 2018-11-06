import React from 'react'
import styles from './AmountUnitField.scss'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { converIntToDec, addZeroToDecimalPosition, formatNativeAssetAmount, parseNativeAssetAmount } from 'utility/buildInOutDisplay'
import { FieldLabel } from 'features/shared/components'
import pick from 'lodash/pick'
import { NativeAssetAmountUnit } from 'utility/environment'

const TEXT_FIELD_PROPS = [
  'value',
  'onBlur',
  'onChange',
  'onFocus',
  'name'
]

class AmountUnitField extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showDropdown: false,
      selected: NativeAssetAmountUnit[0],
      pos: 8,
      value: props.fieldProps.value,
    }

    this.select = this.select.bind(this)
    this.toggleDropwdown = this.toggleDropwdown.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
  }

  componentDidMount() {
    if(this.props.fieldProps.value){
      this.props.fieldProps.onChange(
        parseNativeAssetAmount(this.props.fieldProps.value, this.state.pos )
      )
      this.setState({ value: addZeroToDecimalPosition( this.props.fieldProps.value, this.state.pos ) })
    }
  }

  toggleDropwdown() {
    this.setState({ showDropdown: !this.state.showDropdown })
  }

  closeDropdown() {
    this.setState({ showDropdown: false })
  }

  select(value) {
    this.setState({ selected: value })
    const amount = this.props.fieldProps.value
    switch (value){
      case NativeAssetAmountUnit[0]:
        this.setState({pos: 8})
        this.setState({value: converIntToDec(amount, 8)})
        break
      case NativeAssetAmountUnit[1]:
        this.setState({pos: 5})
        this.setState({value: converIntToDec(amount, 5)})
        break
      case NativeAssetAmountUnit[2]:
        this.setState({pos: 0})
        this.setState({value: amount})

    }
    this.closeDropdown()
  }

  handleBlur(event) {
    const value = event.target.value
    if( this.state.pos > 0 ) {
      this.setState({value: addZeroToDecimalPosition(value, this.state.pos)})
    }
    if (this.props.fieldProps.onBlur) {
      // Swallow the event to prevent Redux Form from
      // extracting the form value
      this.props.fieldProps.onBlur()
    }
  }

  handleChange(event) {
    const value = event.target.value
    // Update the internal state to trigger a re-render
    // using the formatted value
    this.setState({ value: value })
    if (this.props.fieldProps.onChange) {
      // Notify the normalized value
      this.props.fieldProps.onChange(
        parseNativeAssetAmount(value, this.state.pos )
      )
    }
  }

  render() {
    const fieldProps = pick(this.props.fieldProps, TEXT_FIELD_PROPS)
    const {touched, error} = this.props.fieldProps

    return(
      <div className='form-group'>
        {this.props.title && <FieldLabel>{this.props.title}</FieldLabel>}
        <div className='input-group'>
          <input className='form-control'
            type={this.state.type}
            {...fieldProps}
            value={formatNativeAssetAmount(this.state.value, this.state.pos)}
            placeholder={this.props.placeholder}
            autoFocus={!!this.props.autoFocus}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
          />


          <div className={`input-group-btn ${this.state.showDropdown && 'open'}`}>
            <DropdownButton
              className={styles.dropdownButton}
              id='input-dropdown-addon'
              title={this.state.selected}
              onSelect={this.select}
            >
              {NativeAssetAmountUnit.map((option) =>
                <MenuItem eventKey={option}>{option}</MenuItem>
              )}
            </DropdownButton>
          </div>

        </div>
        {touched && error && <span className='text-danger'><strong>{error}</strong></span>}
        {this.props.hint && <span className='help-block'>{this.props.hint}</span>}
      </div>
    )
  }
}

export default AmountUnitField