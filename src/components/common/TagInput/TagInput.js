import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tag from './Tag';
import Input from './Input';
import { connect } from 'react-redux';
import { addTag, removeTag } from '../../../actions';
import plusIcon from '../../../assets/plus.svg';
import './index.scss';

/**
 * Random Component
 * @augments {Component<Props, State>}
 */
class TagInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tileIds: [],
      currentValue: '',
      suggestions: [],
      editorOpen: false,
    };
  }

  addTile = tile => {
    const { associate, addTag, inputType } = this.props;

    if (tile.length > 2) {
      addTag(tile, associate.id, inputType);
    }
  };

  removeTile = id => {
    const { removeTag, associate, inputType } = this.props;
    const tags = associate.Tags;
    removeTag(tags[id], associate.id, inputType);
  };

  editLastTile = () => {
    const { removeTag, associate, inputType } = this.props;
    const tags = associate.Tags;

    tags.length > 0 &&
      removeTag(tags[tags.length - 1], associate.id, inputType);
  };

  renderTags = truncateTags => {
    const { associate } = this.props;
    const tags = associate.Tags || [];
    if (!tags || tags.length === 0) {
      return (
        <p className="expander" onClick={this.toggleShowEditor}>
          Add Tags
        </p>
      );
    }
    return (truncateTags ? tags.slice(0, 3) : tags).map((tag, index) => (
      <p key={index} onClick={this.toggleShowEditor} className="grey-box">
        {tag.name}
      </p>
    ));
  };

  toggleShowEditor = () => {
    this.setState(prevState => ({ editorOpen: !prevState.editorOpen }));
  };

  handleToggleAllTags = () => {
    this.setState(prevState => ({ tagsOpen: !prevState.tagsOpen }));
  };

  render() {
    const { addTags = true, truncateTags = false, associate } = this.props;
    const { editorOpen } = this.state;

    const tags = associate.Tags || [];
    return editorOpen ? (
      <div className="field-container">
        {tags.map((tag, index) => (
          <Tag key={index} id={index} tile={tag} removeTile={this.removeTile} />
        ))}
        <Input
          addTile={this.addTile}
          editLastTile={this.editLastTile}
          tiles={tags}
          value={this.state.currentValue}
          onClick={this.toggleShowEditor}
        />
      </div>
    ) : (
      <div className="grey-boxes">
        {this.renderTags(truncateTags)}
        {truncateTags && tags.length > 3 && <p> +{tags.length - 3}</p>}
        {addTags ? (
          <div>
            <img src={plusIcon} alt="" onClick={this.toggleShowEditor} />
          </div>
        ) : null}
      </div>
    );
  }
}

TagInput.propTypes = {
  associate: PropTypes.object.isRequired,
  /** Should truncate tags in view mode(default false). */
  truncateTags: PropTypes.bool,
};

const mapStateToProps = ({}) => ({});

export default connect(mapStateToProps, {
  removeTag,
  addTag,
})(TagInput);
