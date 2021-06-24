import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

class DropdownButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDropdown: false,
    };
    this.handleClickOutside.bind(this);
  }

  toggleDropdown() {
    const { showDropdown } = this.state;
    this.setState({
      showDropdown: !showDropdown,
    });
  }

  handleClickOutside = event => {
    this.setState({
      showDropdown: false,
    });
  };

  render() {
    const { style, className, dropdown } = this.props;
    const { showDropdown } = this.state;
    return (
      <div
        onClick={this.toggleDropdown.bind(this)}
        style={style}
        className={className}
      >
        {this.props.children}
        {showDropdown && dropdown}
      </div>
    );
  }
}

export default onClickOutside(DropdownButton);
