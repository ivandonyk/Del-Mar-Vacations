import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InputAutoComplete from '../common/InputAutoComplete';
import moment from 'moment';
import {
  updateAction,
} from '../../actions';

class NewAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action_goal: '',
      action_instructions: '',
      action_date: '',
      action_start_time: '',
      action_end_time: '',
      action_assigned_user: -1,
      actionId: null,
      assignedUserTemp: null,
    };
  }

  componentWillMount() {
    let { editMode, action, drmUsers } = this.props;
    if (editMode && action) {
      let assignedUserTemp = '';
      let foundAssignedUser = drmUsers.data.find(u => u.id === action.assignedUser);
      if (action.assignedUser && foundAssignedUser) {
        assignedUserTemp = foundAssignedUser.username;
      }

      this.setState({
        action_goal: action.goal || '',
        action_instructions: action.instructions || '',
        action_date: moment(action.assignedDay).format('YYYY-MM-DD'),
        action_start_time: action.timeStart ?  moment(action.timeStart).format('HH:mm') : '',
        action_end_time: action.timeEnd ? moment(action.timeEnd).format('HH:mm') : '',
        assignedUserTemp,
        action_assigned_user: action.assignedUser || null,
        actionId: action.id,
      });
    }
  }

  _onChangeData = (key, value) => {
    this.setState({ [key]: value });
  };

  _cleanUpdateData = action => {
    const {
      action_goal,
      action_instructions,
      action_date,
      action_start_time,
      action_end_time,
      action_assigned_user,
    } = action;

    return {
      goal: action_goal,
      instructions: action_instructions,
      assignedDay: action_date,
      timeStart: action_start_time,
      timeEnd: action_end_time,
      assignedUser: action_assigned_user,
      gridStart: 0,
      gridEnd: 4,
    };
  }

  onSaveData = () => {
    const { issueId, actionStatus } = this.props;
    const {
      action_goal,
      action_instructions,
      action_date,
      action_start_time,
      action_end_time,
      action_assigned_user,
      actionId,
    } = this.state;
    let action = null;
    if (action_goal && action_instructions) {
      action = {
        action_goal,
        action_instructions,
        action_date: action_date
          ? `${action_date} 01:00:00`
          : new moment().format('YYYY-MM-DD 01:00:00'),
        action_start_time:
          action_date && action_start_time !== ''
            ? this._formatTime(action_date, action_start_time)
            : undefined,
        action_end_time:
          action_date && action_end_time !== ''
            ? this._formatTime(action_date, action_end_time)
            : undefined,
        action_assigned_user: action_assigned_user || -1,
        action_status: actionStatus,
      };
    }
    if (action) {
      console.log('action', action);
      if (this.props.editMode) {
        let updateData = this._cleanUpdateData(action);
        this.props.updateAction(actionId, updateData);
      } else {
        this.props.onCreateAction({
          issueId,
          action,
        });
      }

      this.props.onClose();
    }
  };

  _formatTime = (date, time) => `${date} ${this._formatHHmm(time)}:00`;

  _formatHHmm = time => {
    const splitted = time.split(':');
    const hours = splitted[0];
    let minutes = Math.round(splitted[1] / 15) * 15;
    minutes = minutes === 60 ? 59 : minutes;
    return `${hours}:${minutes}`;
  };

  render() {
    const {
      action_goal,
      action_instructions,
      action_date,
      action_start_time,
      action_end_time,
      assignedUserTemp,
    } = this.state;
    const { onClose, drmUsers, editMode } = this.props;
    return (
      <div className="action-wrapper">
        <div className="new-issues-full">
          <p style={{ fontWeight: '600' }}>{editMode ? 'Edit' : 'New'} Action Item</p>
          <div className="new-issue-full">
            <p>Goal</p>
            <input
              type="text"
              placeholder="What should the action accomplish"
              value={action_goal}
              onChange={evt =>
                this._onChangeData('action_goal', evt.target.value)
              }
            />
          </div>
          <div className="new-issue-full">
            <p>Instructions</p>
            <textarea
              type="text"
              placeholder="Short statement description here"
              onChange={evt =>
                this._onChangeData('action_instructions', evt.target.value)
              }
            >
              {action_instructions}
            </textarea>
          </div>
        </div>

        <div className="new-issues-half">
          <div className="new-issue-left">
            <p>Schedule for</p>
          </div>
          <div className="new-issue-right">
            <input
              type="date"
              value={action_date}
              onChange={evt => {
                let val = evt.target.value;
                if (val !== 'Invalid Date') {
                  let parts = val.split('-');
                  if (parts[0].length > 4) return;
                }
                this._onChangeData('action_date', evt.target.value)
              }}
            />
          </div>

          <div className="new-issue-left">
            <p>At</p>
          </div>
          <div className="new-issue-right">
            <input
              type="time"
              style={{ marginRight: '3px' }}
              value={action_start_time}
              onChange={evt =>
                this._onChangeData('action_start_time', evt.target.value)
              }
            />
            <input
              type="time"
              value={action_end_time}
              onChange={evt =>
                this._onChangeData('action_end_time', evt.target.value)
              }
              min={`${action_start_time}:00`}
            />
          </div>

          <div className="new-issue-left">
            <p>Assignee</p>
          </div>
          <div className="new-issue-right">
            <InputAutoComplete
              value={assignedUserTemp}
              placeholderText="Assign To"
              onItemSelect={item =>
                this._onChangeData('action_assigned_user', item.id)
              }
              onClearData={() =>
                this._onChangeData('action_assigned_user', null)
              }
              data={drmUsers.data.map(user => ({
                ...user,
                id: user.id,
                name: user.firstname
                  ? `${user.firstname} ${user.lastname}`
                  : user.username,
              }))}
            />
          </div>
        </div>
        <div className="new-issue-wrapper_footer">
          <button className="empty-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="orange-btn"
            onClick={this.onSaveData}
            // disabled={!action_date}
          >
            {editMode ? 'Update' : 'Create'} Action
          </button>
        </div>
      </div>
    );
  }
}

NewAction.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
  houseNum: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  issueId: PropTypes.number,
  actionStatus: PropTypes.string,
  onCreateAction: PropTypes.func,
  drmDeals: PropTypes.object,
};

const mapStateToProps = ({ drmDeals, drmUsers }) => ({
  drmDeals,
  drmUsers,
});

export default connect(mapStateToProps, {
  updateAction,
})(NewAction);
