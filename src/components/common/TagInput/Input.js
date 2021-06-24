import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Input extends Component {
  tagEvent(e) {
    const tag = this.text.value;
    if (tag.length === 20 && e.keyCode !== 8 && e.keyCode !== 13) {
      e.preventDefault();
      return;
    }

    // const tagGroup = tag.split(' ');
    const { tiles } = this.props;
    const hasTiles = Object.keys(tiles).length > 0;

    // if (e.keyCode === 32 || e.keyCode === 13) {
    if (e.keyCode === 13) {
      e.preventDefault();
      // tagGroup.map(tag => this.props.addTile(tag));
      this.props.addTile(tag);
      this.tagForm.reset();
    }

    if (e.keyCode === 8 && hasTiles && tag === '') {
      e.preventDefault();
      this.props.editLastTile();
      // this trigger the default value eachtime we hit delete
      this.tagForm.reset();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.text.selectionStart = this.text.value.length;
      this.text.selectionEnd = this.text.value.length;
    }
  }

  render() {
    const { onClick } = this.props;
    return (
      <div className="input-wrapper">
        <form ref={input => (this.tagForm = input)}>
          <input
            ref={input => (this.text = input)}
            type="text"
            name="new-item"
            placeholder="type and press enter"
            autoComplete="off"
            defaultValue={this.props.value}
            onKeyDown={e => this.tagEvent(e)}
          />
        </form>
        <div className="tag-buttons">
          <button className="empty-btn" onClick={onClick}>
            Close
          </button>
          {
            // <button
            //   className="orange-btn"
            //   // onClick={this.onSaveData}
            // >
            //   Save
            // </button>
          }
        </div>
      </div>
    );
  }
}

Input.propTypes = {
  addTile: PropTypes.func,
  editLastTile: PropTypes.func,
  tiles: PropTypes.array.isRequired,
  value: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Input;
