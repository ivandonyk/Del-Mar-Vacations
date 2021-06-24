import React, { Component } from 'react';
import _ from 'lodash';
import users from '../../assets/new/users.svg';
import calendarX from '../../assets/calendar-orange-x.svg';
import moment from 'moment';
import { connect } from 'react-redux';

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hold: false,
      status: 'urgent',
      title: 'First Floor Toilet Leaking',
      house_num: 121,
      name: 'Colin',
      description: 'to call homeowner on Dec 6',
      date: 'Last updated 2 days ago by Colin Perel',
      tagsOpen: false,
    };
  }

  toggleShowEditor = () => {

  }

  renderTags = () => {
    const { Tags } = this.props.issue;
    const { tagsOpen } = this.state;

    if (tagsOpen) {
      return Tags.map((tag, index) => (
        <p key={index} onClick={this.toggleShowEditor} className="grey-box">
          {tag.name}
        </p>
      ));
    }

    const truncatedTags = Tags.slice(0, 2);
    return truncatedTags.map((tag, index) => (
      <p key={index} className="grey-box">
        {tag.name}
      </p>
    ));
  };

  renderDate = date => moment(date).fromNow();

  renderAssignedUsers = () => {
    const { drmUsers } = this.props;
    const { Actions } = this.props.issue;
    let users = Actions.reduce((prev, cur) => {
      let u = drmUsers.data.find(us => us.id === cur.assignedUser);
      prev = prev.concat(u);
      return prev;
    }, []);

    return users.map((user, index) => (
      <p key={index} className="grey-box">{user ? user.firstname || user.username : ''}</p>
    ));
  }

  render() {
    const {
      hold = false,
      urgency,
      issueTitle,
      issueDescription,
      createdAt,
      updatedAt,
      DrmDeal,
      updatedUser,
      Tags,
    } = this.props.issue;
    const { tagsOpen } = this.state;
    const { onCardClick = () => {}, drmUsers } = this.props;
    const cardBackground = hold === true ? 'card-hold-background' : '';

    const user = drmUsers.data.find(u => u.id === updatedUser);

    let showMoreTagsIndicator = Tags.length > 2;

    const cardStatus = `card-${urgency.toLowerCase()}`;
    return (
      <div
        className={`main-card ${cardStatus} ${cardBackground} `}
        onClick={onCardClick}
      >
        <div className="main-card_header">
          <h1>#{DrmDeal.houseNum}</h1>
          {hold === true ? (
            <div className="card-hold-header">
              <p>hold</p>
              <span>2 days</span>
            </div>
          ) : null}
          <img src={users} alt="" />
          <p className="status-urgent">{urgency}</p>
        </div>
        <div className="main-card_body">
          <div className="main-card_body_issue">
            <h1>{issueTitle}</h1>
          </div>
          <div className="issue-action">
            <img src={calendarX} />
            {this.renderAssignedUsers()}
            <p className="issue-description">{issueDescription}</p>
          </div>
          <div className="main-card_body_status">
            {this.renderTags()}
            {showMoreTagsIndicator && !tagsOpen &&
              <span 
                onClick={(e) => { 
                  e.stopPropagation();
                  this.setState({ tagsOpen: true })
                }}>
                  +{Tags.length - 2}
                </span>
            }
            {tagsOpen && 
              <span 
                onClick={e => {
                  e.stopPropagation();
                  this.setState({ tagsOpen: false })
                }}>
                Collapse
              </span>
            }
          </div>
          <div className="main-card_footer">
            <p>
              {`Last Updated ${this.renderDate(updatedAt || createdAt)} by  ${
                user
                  ? user.firstname && user.lastname
                    ? `${user.firstname} ${user.lastname}`
                    : user.username
                  : 'Unknown User'
              }`}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ drmUsers }) => ({ drmUsers });

export default connect(mapStateToProps)(Card);
