import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

class Dropdown extends Component {
  renderDropDownItems(items) {
    const dropdownItems = items.map((item, index) => {
      if (item.hide) return null;

      if (item.render) {
        return item.render(index);
      }

      let icon = null;

      if (item.icon) {
        icon = React.cloneElement(item.icon, { key: index });
      }

      if (item.icon && !item.text) {
        return icon;
      }

      return (
        <Link
          to={item.link}
          key={index}
          onClick={item.onClick ? item.onClick : null}
          style={item.style}
          className={`app-dropdown-item ${
            item.className ? item.className : ''
          }`}
        >
          {icon}
          <span>{item.text}</span>
        </Link>
      );
    });

    return dropdownItems;
  }

  render() {
    const { items, show, style, className } = this.props.data;
    if (show) {
      return (
        <div className={`app-dropdown ${className}`} style={style}>
          {this.renderDropDownItems(items)}
        </div>
      );
    }

    return null;
  }
}

export default Dropdown;
