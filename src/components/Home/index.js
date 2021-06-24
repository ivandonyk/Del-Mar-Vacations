import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Card from './Card';
import moment from 'moment';
import _ from 'lodash';
import {
  createIssue,
  createOneAction,
  getDrmDeals,
  getDrmGroups,
  getDrmUsers,
  getIssuesWithUnscheduledActions,
  getTodaysActions,
  updateOneAction,
  updateOneIssue,
} from '../../actions';
import NewIssue from './NewIssue';
import CardOpen from './CardOpen';
import ScheduleTimeline from '../ScheduleTimeline';
import { Loader } from '../Loader';
import FullCard from './FullCard';
import syncIcon from '../../assets/new/sync.svg';
import calendarOrange from '../../assets/new/calendar-orange.svg';
import arrowLeft from '../../assets/new/arrow-left.svg';
import arrowRight from '../../assets/new/arrow-right.svg';
import plusWhite from '../../assets/plus_white.svg';

import './style.scss';

import { MOCK_DATA } from '../../helpers/mock_data';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timelineDate: new moment().set({ hour: 1, minute: 0 }),
      issueOpened: false,
      on: false,
      show: true,
      showInvoice: false,
      generateInvoice: true,
      isFullCardOpen: false,
      isOpenNewIssue: false,
      unscheduledIssues: [],
      lastUpdatedDate: '',
      searchTerm: '',
      sortIssues: '',
      searchActionTerm: '',
      showAction: false,
      fullCardTabIndex: 0,
    };
  }

  componentDidMount() {
    this.handleSync();
    this.props.getDrmUsers();
    this.props.getDrmDeals();
    this.props.getDrmGroups();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.unscheduled_issues &&
      nextProps.unscheduled_issues.data !== this.props.unscheduled_issues.data
    ) {
      this.setState({
        unscheduledIssues: nextProps.unscheduled_issues.data,
        isOpenNewIssue: false,
      });
    }

    if (
      nextProps.actions.data &&
      nextProps.actions.data !== this.props.actions.data &&
      Object.keys(this.props.actions.data).length === 0
    ) {
      console.log('first time fetching', nextProps.actions.data);
    }

    // FIXME: If we are going to have feature - go to particular action
    // if (
    //   nextProps.actions.data &&
    //   nextProps.actions.data !== this.props.actions.data &&
    //   this.state.showAction
    // ) {
    //   setTimeout(() => {
    //     let elem = document.querySelectorAll(
    //       `[name^="item-${this.state.showAction}"]`,
    //     );
    //     if (elem) {
    //       elem[0].classList.add('pulse');
    //       elem[0].scrollIntoView({
    //         behavior: 'smooth',
    //         block: 'center',
    //         inline: 'end',
    //       });
    //       setTimeout(() => {
    //         elem[0].classList.remove('pulse');
    //       }, 1500);
    //     }
    //     console.log('showAction', elem, this.state.showAction);
    //   }, 700);
    // }
  }

  toggle = () => {
    this.setState({
      on: !this.state.on,
      show: !this.state.show,
    });
  };

  toggleState = (key, value) =>
    this.setState({
      [key]: value,
    });

  showInvoice = () => {
    this.setState({
      showInvoice: !this.state.showInvoice,
      generateInvoice: !this.state.generateInvoice,
    });
  };

  increaseDate = () => {
    const { timelineDate } = this.state;
    const newDay = new moment(timelineDate).add(1, 'day');

    this.setState({
      timelineDate: newDay,
    });
    this.props.getTodaysActions(newDay.toDate());
  };

  decreaseDate = () => {
    const { timelineDate } = this.state;
    const newDay = new moment(timelineDate).subtract(1, 'day');

    this.setState({
      timelineDate: newDay,
    });
    this.props.getTodaysActions(newDay.toDate());
  };

  setDate = date => {
    const newDay = new moment(date).set({ hour: 1, minute: 0 });
    this.setState({
      timelineDate: newDay,
    });
    this.props.getTodaysActions(newDay.toDate());
  };

  _isSearchValid = issue => {
    const { searchTerm } = this.state;

    const {
      issueTitle = '',
      urgency = '',
      DrmDeal: { houseNum = '' },
    } = issue;
    const tempHouseNum = `#${houseNum}`;
    const trimSearch = searchTerm.trim();
    if (trimSearch && trimSearch.startsWith('#')) {
      return tempHouseNum.indexOf(trimSearch) > -1;
    }
    if (trimSearch) {
      return (
        issueTitle.toLowerCase().indexOf(trimSearch.toLowerCase()) > -1 ||
        urgency.toLowerCase().indexOf(trimSearch.toLowerCase()) > -1 ||
        (trimSearch.startsWith('!') &&
          issue.IssueTags.find(
            issue =>
              issue.name
                .toLowerCase()
                .indexOf(trimSearch.toLowerCase().replace('!', '')) > -1,
          )) ||
        issue.Actions.find(
          action =>
            action.goal.toLowerCase().indexOf(trimSearch.toLowerCase()) > -1,
        )
      );
    }
    return true;
  };

  _isSearchActionValid = action => {
    const { searchActionTerm } = this.state;
    const tempSearch = searchActionTerm.toLowerCase();

    return (
      action.goal.toLowerCase().indexOf(tempSearch) > -1 ||
      action.status.toLowerCase().indexOf(tempSearch) > -1
    );
  };

  _renderSidebar = () => {
    const { searchTerm } = this.state;
    return (
      <div className="schedules_main_right">
        <div className="schedules_main_right_inner">
          <div className="sidebar-search">
            <input
              type="search"
              placeholder="Filter by tags or keywords you want to see"
              value={searchTerm}
              onChange={evt => this.toggleState('searchTerm', evt.target.value)}
            />
          </div>
          <div className="sidebar-sort-by">
            <p>Sort By</p>
            <div className="select">
              <select
                onChange={evt =>
                  this.toggleState('sortIssues', evt.target.value)
                }
              >
                <option value="">Standard</option>
                {MOCK_DATA.ISSUE_SORT_OPTIONS.map((sort_option, index) => (
                  <option value={sort_option.value} key={index}>
                    {sort_option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sidebar-cards">{this._renderSidebarIssues()}</div>
        </div>
      </div>
    );
  };

  _renderSidebarIssues = () => {
    const { unscheduledIssues, sortIssues } = this.state;

    let sortedIssues = unscheduledIssues;
    if (sortIssues !== '') {
      switch (sortIssues) {
        case 'houseNum':
          sortedIssues = _.sortBy(unscheduledIssues, 'DrmDeal.houseNum');
          break;
        case 'urgency':
          sortedIssues = _.sortBy(unscheduledIssues, 'urgency').reverse(); // Should be more stable. This is alphabetic.
          break;
        case 'newest':
          sortedIssues = _.sortBy(unscheduledIssues, 'updatedAt').reverse();
          break;
        case 'oldest':
          sortedIssues = _.sortBy(unscheduledIssues, 'updatedAt');
          break;
        default:
          sortedIssues = unscheduledIssues;
      }
    }

    return sortedIssues
      .filter(
        item =>
          item.Actions &&
          item.Actions.filter(
            action =>
              (action.timeStart === 'Invalid date' &&
                action.timeEnd === 'Invalid date') ||
              (action.timeStart === null && action.timeEnd === null),
          ).length > 0,
      )
      .filter(this._isSearchValid)
      .map((property, index) => (
        <Card
          key={index}
          id={property.id}
          title={property.issueTitle}
          status={property.urgency}
          house_num={property.DrmDeal.houseNum}
          issue={property}
          actions={property.Actions}
          tags={property.IssueTags}
          onCardClick={() => this.setState({ issueOpened: property })}
        />
      ));
  };

  handleSync = () => {
    const { timelineDate } = this.state;
    const newDay = new moment(timelineDate).toDate();

    this.props.getTodaysActions(newDay);
    this.props.getIssuesWithUnscheduledActions();
    this.setState({ lastUpdatedDate: new moment().format('h:mm a, L') });
  };

  _goToAction = (timelineDate, actionId) => {
    this.setState(
      {
        timelineDate: new moment(timelineDate),
        showAction: actionId,
      },
      this.handleSync,
    );
  };

  render() {
    const { actions, drmDeals, unscheduled_issues, drmUsers } = this.props;

    const {
      issueOpened,
      timelineDate,
      isFullCardOpen,
      isOpenNewIssue,
      lastUpdatedDate,
      unscheduledIssues,
      searchActionTerm,
      showAction,
    } = this.state;

    // filter out array data only for current chosen date;
    const todays_actions =
      actions.data[timelineDate.format('MM/DD/YYYY')] || [];
    if (
      actions.isFetching &&
      actions.data[timelineDate.format('MM/DD/YYYY')] === undefined
    ) {
      return <Loader />;
    }
    const todays_date = new moment().format('MM/DD/YYYY');
    return (
      <div className="section schedules-section issues-sidebar">
        {
          // <ServiceBanner closeSuccessBanner={() => {}} />
        }
        {issueOpened && (
          <CardOpen
            issue={unscheduled_issues.data.find(
              item => item.id === issueOpened.id,
            )}
            onClose={() => this.setState({ issueOpened: false })}
            onOpenFullView={() => this.toggleState('isFullCardOpen', true)}
            onCreateAction={this.props.createOneAction}
            onUpdateAction={this.props.updateOneAction}
            onUpdateIssue={this.props.updateOneIssue}
            drmDeals={drmDeals.data}
            drmUsers={drmUsers.data}
            goToAction={this._goToAction}
            toggleState={this.toggleState}
          />
        )}

        <NewIssue
          isOpen={isOpenNewIssue}
          onClose={() => this.toggleState('isOpenNewIssue', false)}
          onCreateIssue={this.props.createIssue}
          drmDeals={drmDeals.data}
          drmUsers={drmUsers.data}
        />

        {isFullCardOpen && (
          <FullCard
            fullCardTabIndex={this.state.fullCardTabIndex}
            toggleState={this.toggleState}
            issue={issueOpened}
            handleSync={this.handleSync}
            onUpdateIssue={this.props.updateOneIssue}
            onClose={() => this.setState({ issueOpened: false })}
          />
        )}
        <div className="schedules_main">
          <div className="schedules_main_left">
            <div className="top-section">
              <div className="top-section_header">
                <h1>Schedules</h1>
                <div className="latest-update">
                  <h2>
                    {'Last updated at '} <strong>{lastUpdatedDate}</strong>
                  </h2>
                  <span
                    className="sync-button"
                    onClick={() => this.handleSync()}
                  >
                    <img src={syncIcon} />
                    <p>Sync</p>
                  </span>
                  <button
                    className="orange-button"
                    onClick={() => this.toggleState('isOpenNewIssue', true)}
                  >
                    <img src={plusWhite} />
                    New Issue
                  </button>
                </div>
              </div>
              <div className="top-section_bottom">
                <div className="top-section_bottom_search">
                  <input
                    type="search"
                    value={searchActionTerm}
                    onChange={evt =>
                      this.toggleState('searchActionTerm', evt.target.value)
                    }
                    className="search-filed"
                    placeholder="Search Actions by name or status"
                  />
                </div>
                <div className="calendar-wrapper">
                  {timelineDate.format('MM/DD/YYYY') !== todays_date && (
                    <p
                      className="current-date"
                      onClick={() => this.setDate(new Date())}
                    >
                      Today
                    </p>
                  )}
                  <div className="arrows" onClick={this.decreaseDate}>
                    <img
                      src={arrowLeft}
                      className="calendar-wrapper_left-caret"
                    />
                  </div>
                  <div className="calendar-wrapper_date">
                    <p>
                      {timelineDate.isSame(new Date(), 'day')
                        ? 'Today'
                        : timelineDate.format('ddd')}
                      , {timelineDate.format('MMM DD, YYYY')}
                    </p>
                    <div>
                      <input
                        type="date"
                        onChange={evt => this.setDate(evt.target.value)}
                      />
                      <img src={calendarOrange} />
                    </div>
                  </div>
                  <div className="arrows" onClick={this.increaseDate}>
                    <img src={arrowRight} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bottom-section">
              <ScheduleTimeline
                timelineDate={timelineDate}
                todaysActions={todays_actions.filter(this._isSearchActionValid)}
                isFetchingActions={actions.isFetching}
                handleSync={this.handleSync}
                onClickIssue={issueId =>
                  this.setState({
                    issueOpened: unscheduledIssues.find(
                      item => item.id === issueId,
                    ),
                  })
                }
              />
            </div>
          </div>
          {this._renderSidebar()}
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  unscheduled_issues: PropTypes.object,
  actions: PropTypes.object,
  drmDeals: PropTypes.object,
};

const mapStateToProps = ({
  unscheduled_issues,
  actions,
  drmDeals,
  drmUsers,
}) => ({
  unscheduled_issues,
  actions,
  drmDeals,
  drmUsers,
});

export default connect(mapStateToProps, {
  getTodaysActions,
  getIssuesWithUnscheduledActions,
  getDrmDeals,
  createIssue,
  createOneAction,
  updateOneAction,
  updateOneIssue,
  getDrmUsers,
  getDrmGroups,
})(Home);
