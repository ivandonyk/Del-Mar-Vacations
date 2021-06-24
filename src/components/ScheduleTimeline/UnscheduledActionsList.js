import React, { Component } from 'react';
import moment from 'moment';
import ActionItem from '../Home/ActionItem';
import arrowDown from '../../assets/arrow-down.svg';
import calendarOrangeClose from '../../assets/calendar-orange-x.svg';
import closeIcon from '../../assets/close_orange.svg';

class UnscheduledActionsList extends Component {
  constructor(props) {
    super(props);
    this.outsideClickRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside, true);
    document.addEventListener('scroll', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, true);
    document.removeEventListener('scroll', this.handleClickOutside, true);
  }

  handleClickOutside = event => {
    if (this.outsideClickRef && !this.outsideClickRef.contains(event.target)) {
      this.props.onClose();
    }
  };

  render() {
    const { rowName, notAssignedItems, onClose } = this.props;

    return (
      <div
        className="open-card-issues unscheduled-row"
        ref={ref => (this.outsideClickRef = ref)}
      >
        {
          // <div className="open-card-issues_header">
          //   <h1>{rowName}</h1>
          //   <img src={closeIcon} onClick={onClose} />
          // </div>
        }
        <div className="open-card-issues_issues">
          <div className="open-card-inner">
            <div className="open-card-inner_name">
              <img src={arrowDown} />
              <p>Unscheduled ({notAssignedItems.length})</p>
            </div>
            {notAssignedItems.map((item, index) => {
              const issue = item.Issue;
              const drmDeal = issue.DrmDeal;
              return (
                <div key={index} className={`card-${item.status}`}>
                  <div className="border-color-box  ">
                    <div className="open-card-inner_header">
                      <p>#{drmDeal.houseNum}</p>
                      <h1>{issue.issueTitle}</h1>
                    </div>
                    <div className="open-card-inner_body">
                      <img src={calendarOrangeClose} />
                      <p className="grey-box">
                        {new moment(issue.updatedAt).format('ddd, MMM DD')}
                      </p>
                      <p className="grey-box">{`${drmDeal.firstName} ${drmDeal.lastName}`}</p>
                    </div>
                    <div className="open-card-inner_footer">
                      <ActionItem
                        action={item}
                        status={item.Issue.urgency}
                        onGrabItem={onClose}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default UnscheduledActionsList;
