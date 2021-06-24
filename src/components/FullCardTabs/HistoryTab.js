import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

class HistoryTab extends Component {
  constructor(props) {
    super(props);
  }

  renderHistoryEntry = (entry, index) => {
    let { drmUsers } = this.props;
    const user = drmUsers.data.find(u => u.id === entry.userId) || {};
    let displayName =
      user.firstname && user.lastname
        ? `${user.firstname} ${user.lastname}`
        : user.username;

    return (
      <ul key={index}>
        <li>{moment(entry.createdAt).format('MMM D, YYYY')}</li>
        <li>{displayName}</li>
        <li>{entry.section}</li>
        <li>{entry.operation}</li>
      </ul>
    );
  };

  render() {
    let { history } = this.props;
    return (
      <div className="open-full-wrapper_body_inner">
        <div className="history-tab-wrapper">
          <div className="history-table">
            <div className="history-table-header">
              <ul>
                <li>Date</li>
                <li>User</li>
                <li>Section</li>
                <li>Change</li>
              </ul>
            </div>
            <div className="history-table-body">
              {history.data.map((entry, index) =>
                this.renderHistoryEntry(entry, index),
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ history, drmUsers }) => {
  return { history, drmUsers };
};

export default connect(mapStateToProps, {})(HistoryTab);
