import React, { Component } from 'react';

import PropTypes from 'prop-types';
import moment from 'moment';
import InputAutoComplete from '../common/InputAutoComplete';
import closeIcon from '../../assets/close_orange.svg';
import { MOCK_DATA } from '../../helpers/mock_data';
import MultiSelect from '../common/MultiSelect';
import { connect } from 'react-redux';
import plusIcon from '../../assets/plus.svg';

class NewIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      houseNum: '',
      urgency: '',
      dealId: null,
      issueTitle: '',
      issueDescription: '',
      reportedByUser: null,
      followUpUser: null,
      action_goal: '',
      action_instructions: '',
      action_date: '',
      action_start_time: '',
      action_end_time: '',
      action_assigned_user: '',
      addAction: false,
    };

    this.outsideClickRef = React.createRef();
    this.followUpMultiSelect = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  onSaveData = () => {
    const {
      urgency,
      dealId,
      issueTitle,
      issueDescription,
      followUpUser,
      reportedByUser,
      action_goal,
      action_instructions,
      action_date,
      action_start_time,
      action_end_time,
      action_assigned_user,
    } = this.state;
    const {
      user,
      allPage,
      resolvedPage,
      pageLength
    } = this.props;
    console.log({
      urgency,
      dealId,
      issueTitle,
      issueDescription,
      followUpUser,
      reportedByUser,
    });
    let action = null;
    if (action_goal && action_instructions) {
      action = {
        action_goal,
        action_instructions,
        action_date: action_date
          ? `${action_date} 12:00:00`
          : new moment().format('YYYY-MM-DD 12:00:00'),
        action_start_time:
          action_date && action_start_time !== ''
            ? this._formatTime(action_date, action_start_time)
            : undefined,
        action_end_time:
          action_date && action_end_time !== ''
            ? this._formatTime(action_date, action_end_time)
            : undefined,
        action_assigned_user: action_assigned_user || -1,
        action_status: urgency,
      };
    }
    console.log('action', action);
    this.props.onCreateIssue({
      urgency,
      dealId,
      issueTitle,
      issueDescription,
      action,
      followUpUser,
      reportedByUser,
    },
    allPage,
    resolvedPage,
    pageLength);
    this._clearNewIssueForm();
  };

  _formatTime = (date, time) => `${date} ${this._formatHHmm(time)}:00`;

  _formatHHmm = time => {
    const splitted = time.split(':');
    const hours = splitted[0] - 4;
    const minutes = Math.round(splitted[1] / 15) * 15;
    return `${hours}:${minutes}`;
  };

  _clearNewIssueForm = () => {
    this.setState({
      houseNum: '',
      urgency: '',
      dealId: null,
      issueTitle: '',
      issueDescription: '',
      reportedByUser: null,
      followUpUser: null,
      action_goal: '',
      action_instructions: '',
      action_date: '',
      action_start_time: '',
      action_end_time: '',
      action_assigned_user: '',
    });
  };

  handleClickOutside = event => {
    // if (
    //   this.outsideClickRef &&
    //   !this.outsideClickRef.contains(event.target) &&
    //   this.props.isOpen
    // ) {
    //   this.props.onClose();
    // }
  };

  _onChangeData = (key, value) => {
    this.setState({ [key]: value });
  };

  getFollowUpOptions = () => {
    const options = MOCK_DATA.FOLLOW_UP_BY.map(item => ({
      name: item,
      key: item,
    }));
    return options;
  };

  renderNewActionItem = action => {
    const {
      action_goal,
      action_instructions,
      action_date,
      action_start_time,
      action_end_time,
    } = this.state;

    const { drmUsers } = this.props;

    return (
      <React.Fragment>
        <div className="new-issues-full">
          <p style={{ fontWeight: '700' }}>New Action Item</p>
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
          <div className="new-issue-right time-inputs">
            <input
              type="time"
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
            {
              //   <select>
              //   <option>Keli Hitchcock</option>
              //   <option>Callan Banner</option>
              // </select>
              // <input type="text" placeholder="" disabled value={action_assigned_user} />
            }

            <InputAutoComplete
              placeholderText="Assign To"
              onItemSelect={item =>
                this._onChangeData('action_assigned_user', item.id)
              }
              onClearData={() =>
                this._onChangeData('action_assigned_user', null)
              }
              data={drmUsers.map(user => ({
                ...user,
                id: user.id,
                name: user.firstname
                  ? `${user.firstname} ${user.lastname}`
                  : user.username,
              }))}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }

  toggleAddAction = () => {
    this.setState({
      addAction: !this.state.addAction,
    }, () => {
      if (!this.state.addAction) {
        this.setState({
          action_goal: '',
          action_instructions: '',
          action_date: '',
          action_start_time: '',
          action_end_time: '',
          action_assigned_user: '',
        });
      }
    });
  }

  renderAddActionItemButton = () => {
    const { addAction } = this.state;
    return (
      <div className="add-action-wrapper">
        <button
          className="add-action orange-txt-btn"
          onClick={this.toggleAddAction}
        >
          {!addAction &&
            <img
              className="open-full-wrapper_body_inner_description_photos_toggle-icon"
              src={plusIcon}
            />
          }
          {addAction ? 'Remove Action' : 'Add Action'}
        </button>
      </div>
    );
  }

  render() {
    const { onClose, isOpen, onCreateIssue, drmDeals, drmUsers } = this.props;
    const {
      urgency,
      issueDescription,
      issueTitle,
      followUpUser,
      reportedByUser,
      dealId,
      addAction,
    } = this.state;

    return (
      <div
        className={['new-issue-wrapper', `${isOpen ? 'slide-in' : ''}`].join(
          ' ',
        )}
        ref={ref => (this.outsideClickRef = ref)}
      >
        <div className="new-issue-wrapper_header">
          <p>Create New Issue</p>
          <img src={closeIcon} onClick={onClose} />
        </div>
        <div className="new-issues-half">
          <div className="new-issue-left" style={{ paddingRight: '5px' }}>
            <p className="lg-p">#</p>
            {
              // <input
              //   className="number-input"
              //   type="number"
              //   placeholder="000"
              //   value={houseNum}
              //   onChange={evt => this._onChangeData('houseNum', evt.target.value)}
              //   onBlur={this._onBlurHouseNum}
              // />
            }
            <InputAutoComplete
              placeholderText="000"
              onItemSelect={item => this._onChangeData('dealId', item.id)}
              onClearData={() => this._onChangeData('dealId', null)}
              data={drmDeals.map(user => ({
                ...user,
                id: user.id,
                name: user.houseNum,
              }))}
            />
          </div>

          <div className="new-issue-right select">
            <select
              value={urgency}
              onChange={evt => this._onChangeData('urgency', evt.target.value)}
            >
              <option>Select Urgency</option>
              <option value="urgent">Urgent</option>
              <option value="medium">Medium</option>
              <option value="turnover">Turnover</option>
            </select>
          </div>

          <div className="new-issue-left">
            <p>Reported By</p>
          </div>
          <div className="new-issue-right select">
            <select
              value={reportedByUser || ''}
              onChange={evt => {
                const { value } = evt.target;
                this._onChangeData('reportedByUser', value);
                if (value && value !== 'Del Mar Staff' && !followUpUser) {
                  this._onChangeData('followUpUser', value);
                  // propagate this to the multi select since it has
                  // a self contained state
                  this.followUpMultiSelect.handleChange({
                    target: {
                      value: [value],
                    },
                  });
                }
              }}
            >
              <option value={null}>Select Reporter</option>
              {MOCK_DATA.REPORTED_BY.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="new-issue-left">
            <p>Follow up with</p>
          </div>
          <div className="new-issue-right select">
            {
              //   <InputAutoComplete
              //   placeholderText="Follow up with"
              //   onItemSelect={item => this._onChangeData('followUpUser', item.id)}
              //   onClearData={() => this._onChangeData('followUpUser', null)}
              //   data={drmDeals.map(user => {
              //     return {
              //       ...user,
              //       id: user.id,
              //       name: `${user.firstName} ${user.lastName}`,
              //     };
              //   })}
              // />
            }

            <MultiSelect
              ref={node => (this.followUpMultiSelect = node)}
              list={this.getFollowUpOptions()}
              selected={followUpUser ? followUpUser.split(',') : []}
              handleChange={e => {
                const vals = e.filter(v => v !== null);
                const value = vals.join(',');
                this._onChangeData('followUpUser', value);
              }}
            />
          </div>
        </div>

        <div className="new-issues-full">
          <div className="new-issue-full">
            <p>Issue Title</p>
            <input
              type="text"
              placeholder="Short statement description here"
              value={issueTitle}
              onChange={evt =>
                evt.target.value.length < 150 &&
                this._onChangeData('issueTitle', evt.target.value)
              }
            />
          </div>
          <div className="new-issue-full">
            <div tabIndex="-1">
              <p tabIndex="-1">Describe Issue</p>
            </div>
            <input
              type="text"
              placeholder="Additional information"
              value={issueDescription}
              onChange={evt =>
                this._onChangeData('issueDescription', evt.target.value)
              }
            />
          </div>
          {this.renderAddActionItemButton()}
        </div>
        {addAction && this.renderNewActionItem()}
        <div className="new-issue-wrapper_footer">
          <button className="empty-btn" onClick={onClose}>
            Cancel
          </button>
          {urgency && dealId && issueTitle && issueDescription ? (
            <button className="orange-btn" onClick={this.onSaveData}>
              Create & Schedule
            </button>
          ) : (
            <button className="orange-button disabled-btn">
              Create & Schedule
            </button>
          )}
        </div>
      </div>
    );
  }
}

NewIssue.propTypes = {
  onClose: PropTypes.func,
  drmDeals: PropTypes.array,
  isOpen: PropTypes.bool,
  onCreateIssue: PropTypes.func,
};

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(NewIssue);
