/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';
class InputAutoComplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      suggestions: [],
      text: '',
    };
  }

  componentDidMount() {
    this.setState({ 
      items: this.props.data, 
      text: this.props.value || '' 
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.data &&
      JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)
    ) {
      this.setState({ items: nextProps.data });
    }
  }

  onTextChanged = e => {
    const { value } = e.target;
    let suggestions = [];
    if (value.length > 0) {
      const regex = new RegExp(`^${value}`, 'i');
      suggestions = this.state.items.filter(v => regex.test(v.name));
    }
    this.setState(() => ({ suggestions, text: value }));
  };

  suggestionSelected(value) {
    this.setState(
      {
        text: value.name,
        suggestions: [],
      },
      () => this.props.onItemSelect(value),
    );
  }

  renderSuggestions() {
    const { suggestions, text } = this.state;
    if (suggestions.length === 0 || text === '') {
      return null;
    }
    return (
      <div className="autocomplete-wrapper">
        <ul className="autocomplete-list">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="autocomplete-item"
              onClick={() => this.suggestionSelected(item)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { text } = this.state;
    const {
      placeholderText = '',
      onItemSelect,
      onClearData = () => {},
      disabled = false,
    } = this.props;
    return (
      <div className="autocomplete-container">
        <div className="input-container">
          <input
            value={text}
            onChange={this.onTextChanged}
            type="search"
            placeholder={placeholderText}
            required="required"
            className="control--search issue-nm"
            disabled={disabled}
          />
          <button
            className="control--search__clear"
            type="reset"
            onClick={() =>
              this.setState(
                {
                  text: '',
                },
                onClearData,
              )
            }
          >
            ×
          </button>
        </div>
        <div>{this.renderSuggestions()}</div>
      </div>
    );
  }
}

InputAutoComplete.propTypes = {
  placeholderText: PropTypes.string,
  onItemSelect: PropTypes.func,
  onClearData: PropTypes.func,
  data: PropTypes.array,
};

export default InputAutoComplete;
