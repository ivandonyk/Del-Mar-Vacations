import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import users from '../../assets/new/users.svg';
import TagInput from '../common/TagInput/TagInput';
import ActionItem from './ActionItem';

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tagsOpen: false,
      editorOpen: false,
    };
  }

  renderActions = () => {
    const { actions = [], status } = this.props;
    const unscheduledActions = actions.filter(
      action =>
        (action.timeStart === 'Invalid date' &&
          action.timeEnd === 'Invalid date') ||
        (action.timeStart === null && action.timeEnd === null),
    );

    return (
      _.sortBy(unscheduledActions, 'id')
        // _.sortBy(actions, 'timeStart')
        .map((action, indexItem) => (
          <ActionItem key={indexItem} action={action} status={status} />
        ))
    );
  };

  toggleShowEditor = () => {
    this.setState(prevState => ({ editorOpen: !prevState.editorOpen }));
  };

  handleToggleAllTags = () => {
    this.setState(prevState => ({ tagsOpen: !prevState.tagsOpen }));
  };

  render() {
    const {
      status = 'Urgent',
      title = 'First Floor Toilet Leaking',
      house_num = 121,
      tags,
      issue,
      onCardClick = () => {},
    } = this.props;

    const cardStatus = `card-${status.toLowerCase()}`;
    return (
      <div className={`main-card ${cardStatus}`}>
        <div className="main-card_header">
          <h1 onClick={onCardClick}>#{house_num}</h1>
          <img src={users} alt="" />
          <p className="status-urgent">{status}</p>
        </div>
        <div className="main-card_body">
          <div className="main-card_body_issue">
            <h1>{title}</h1>
          </div>
          <div className="main-card_body_action">{this.renderActions()}</div>
          <div className="main-card_body_status">
            <TagInput associate={issue} inputType="issue" truncateTags />

            {
              //   tagCount > 0 && !editorOpen ? (
              //   <p className="expander" onClick={this.handleToggleAllTags}>
              //     {!tagsOpen ? (tagCount > 2 ? `+ ${tagCount - 2}` : '') : 'x'}
              //   </p>
              // ) : (
              //   <p className="expander" onClick={this.toggleShowEditor}>
              //     {editorOpen ? '' : 'No Tags'}
              //   </p>
              // )
            }
          </div>
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string,
  status: PropTypes.string,
  house_num: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  issue: PropTypes.object.isRequired,
  actions: PropTypes.array,
  tags: PropTypes.array,
  onCardClick: PropTypes.func,
};

export default Card;
