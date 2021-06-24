import React from 'react';
import users from '../../assets/new/users.svg';
import calendarX from '../../assets/calendar-blue.svg';
import Utils from '../../helpers/utils';
import CONSTANTS from '../ScheduleTimeline/constants';
import TagInput from '../common/TagInput/TagInput';
import moment from 'moment';

const ActionCard = ({
  hold = false,
  status = 'urgent',
  title = 'First Floor Toilet Leaking',
  house_num = 121,
  assignedUser = 'Colin',
  description = 'to call homeowner on Dec 6',
  onCardClick,
  followUpUser,
  action,
}) => {
  const cardStatus = `card-${status.toLowerCase()}`;

  const actionTime = Utils.parseSpansToTime(
    action.gridStart,
    action.gridEnd,
    action.assignedDay ? moment(action.assignedDay).toDate() : new Date(),
  );

  return (
    <div
      className={`main-card ${cardStatus}`}
      onClick={onCardClick}
      style={{ margin: 0 }}
    >
      <div className="main-card_header">
        <h1>#{house_num}</h1>
        {hold === true ? (
          <div className="card-hold-header">
            <p>hold</p>
            <span>2 days</span>
          </div>
        ) : null}
        {followUpUser ? <img src={users} alt="" /> : ''}
        <p className="status-urgent">{status}</p>
      </div>
      <div className="main-card_body">
        <div className="main-card_body_issue">
          <h1>{title}</h1>
        </div>
        <div className="issue-action">
          <img src={calendarX} />
          <p>
            {`${actionTime.timeStart.format(
              'ddd, MMM DD',
            )}   ${actionTime.timeStart.format(
              'hh:mm a',
            )} - ${actionTime.timeEnd.format('hh:mm a')}`}
          </p>
          <p className="grey-box">
          {assignedUser ?
              assignedUser.firstname && assignedUser.lastName
                ? `${assignedUser.firstname} ${assignedUser.lastname}`
                : assignedUser.username
              : 'Unassigned'}
          </p>
        </div>
        <p className="pre-line issue-description">{description}</p>
        <div className="main-card_body_status">
          <TagInput associate={action} inputType="action" truncateTags />
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
