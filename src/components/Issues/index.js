import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Card from './Card';
import CardOpen from '../Home/CardOpen';
import FullCard from '../Home/FullCard';
import NewIssue from '../Home/NewIssue';
import searchOrange from '../../assets/new/search-orange.svg';
import searchGrey from '../../assets/search-grey.svg';
import plusWhite from '../../assets/plus_white.svg';
import moment from 'moment';
import arrowLeft from '../../assets/new/arrow-left.svg';
import arrowRight from '../../assets/new/arrow-right.svg';

import {
  createIssue,
  createOneAction,
  getDrmDeals,
  getDrmUsers,
  getIssuesWithUnscheduledActions,
  getTodaysActions,
  updateOneAction,
  updateOneIssue,
  getResolvedIssues,
  getAllIssues,
} from '../../actions';

import {
  ACTION_REQUIRED,
  ALL_ISSUES,
  ESTIMATES_ISSUES,
  NEW_ISSUES,
  SCHEDULED_ISSUES,
  UNSCHEDULED_ISSUES,
  RESOLVED,
  INVOICE_ISSUES,
  NOTIFY_OWNER_ISSUES,
} from '../../constants';

import './main.scss';

import { MOCK_DATA } from '../../helpers/mock_data';

const priorityMap = {
  urgent: 1,
  medium: 2,
  turnover: 3,
};

const pageLength = 6; //Arbitrary

class Issues extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSidebarOpen: false,
      issueOpened: false,
      isOpenNewIssue: false,
      isFullCardOpen: false,
      // unscheduledIssues: [],
      activeIssue: {},
      filterCategory: ACTION_REQUIRED,
      // resolvedPage: 0,
      allPage: 0,
      searchTerm: '',
      assigneeFilter: '',
      sortIssues: '',
      fullCardTabIndex: 0,
    };
  }

  componentDidMount() {
    this.props.getDrmUsers();
    this.props.getDrmDeals();
    this.props.getIssuesWithUnscheduledActions();
    // this.props.getResolvedIssues(this.state.resolvedPage, pageLength);
    this.props.getResolvedIssues();
    this.props.getAllIssues(this.state.allPage, pageLength);
    document.body.classList.add('overflow-scroll');
  }

  componentDidUpdate(prevProps, prevState) {
    let filters = {};
    let { searchTerm, assigneeFilter, allPage, sortIssues } = this.state;
    let change = false;

    if (prevState.searchTerm !== searchTerm) {
      change = true;
      filters.searchTerm = searchTerm;
    }

    if (prevState.assigneeFilter !== assigneeFilter) {
      change = true;
      filters.assignee = assigneeFilter;
    }

    if (prevState.sortIssues !== sortIssues) {
      change = true;
    }

    if (change) {
      this.setState({
        allPage: 0,
      }, () => {
        this.props.getAllIssues(0, pageLength, filters, sortIssues);
      });
    }
  }

  componentWillUnmount() {
    document.body.classList.remove('overflow-scroll');
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.unscheduled_issues &&
      JSON.stringify(nextProps.unscheduled_issues.data) !==
        JSON.stringify(this.props.unscheduled_issues.data)
    ) {
      this.setState({
        activeIssue: this.state.activeIssue
          ? nextProps.unscheduled_issues.data.find(
              item => item.id === this.state.activeIssue.id,
            )
          : {},
        isOpenNewIssue: false,
      });
    }
  }

  buildFiltersForPagination = () => {
    return {
      assignee: this.state.assigneeFilter,
      searchTerm: this.state.searchTerm,
    };
  }

  toggleState = (key, value) =>
    this.setState({
      [key]: value,
    });

  renderIssues = issues => {
  // if( issues.length === 0 ){
  //   return;
  // }

  const issuePage = issues.page && issues.page !== -1 ? issues.page : 0;
  const issueData = issues.payload ? issues.payload : issues;

  return (
      <div>
        <div className="issues-card-wrapper">
          {issueData.map(issue => (
            <Card
              issue={issue}
              key={issue.id}
              onCardClick={() =>
                this.setState({ isSidebarOpen: true, activeIssue: issue })
              }
            />
          ))}
        </div>
        { issuePage ? this.renderPageArrows(issuePage) : '' }
      </div>
    )
  };

  renderPageArrows = (issuePage) => {
    return(
      <div className="bottom-wrapper">
        <div className="arrows" onClick={() => this.changePage(-1)}>
          <img
            src={arrowLeft}
            className="bottom-wrapper_left-caret"
          />
        </div>
        <div className="bottom-wrapper_center-number">
          <p>
            { issuePage }
          </p>
        </div>
        <div className="arrows" onClick={() => this.changePage(1)}>
          <img src={arrowRight} />
        </div>
      </div>
    )
  } 

  changePage = (change) => { //Bit hacky
    const { resolvedPage, allPage, filterCategory, sortIssues } = this.state;
    const { resolved_issues, all_issues } = this.props;

    switch (filterCategory) {
      case ALL_ISSUES:
        if( allPage + change + 1 <= 0 || allPage === -1 || allPage + change >= all_issues.data.totalPages ){
          return;
        }

        this.setState({ allPage: allPage + change },
          () => {
              this.props.getAllIssues(this.state.allPage, pageLength, this.buildFiltersForPagination(), sortIssues);
            }
          );
      default:
        return;
    }
  }

  // Begin filter functions
  actionRequiredFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(
        i =>
          i.overallStatus === 'active' &&
          i.Actions.length > 0 &&
          i.Actions.every(action => action.status === 'complete'),
      );
    }

    return [];
  };

  newIssuesFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(
        i => (
          i.Actions.length < 1 &&
          !i.Tags.find(it => it.name.toLowerCase().trim() === 'amp') &&
          i.overallStatus === 'active'
        )
      );
    }

    return [];
  };

  estimatesFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(i => (
        i.Quotes.length > 0 &&
        i.Invoices.length < 1 &&
        i.overallStatus === 'active'
      ));
    }

    return [];
  };

  resolvedFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(i => (
        i.overallStatus === 'resolved'
      ));
    }

    return [];
  };

  scheduledFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(
        i => (
          i.Actions.length > 0 && 
          i.Actions.some(a => a.timeStart !== null) && 
          i.overallStatus === 'active'
        )
      );
    }

    return [];
  };

  unscheduledFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(
        i => (
          i.Actions.length > 0 && 
          i.Actions.every(a => a.timeStart === null) &&
          i.overallStatus === 'active'
        )
      );
    }

    return [];
  };

  invoiceFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(
        i => i.Invoices.length > 0 && 
        i.overallStatus !== 'archived'
      );
    }

    return [];
  }

  notifyOwnerFilter = _issues => {
    if (_.isArray(_issues)) {
      return _issues.filter(
        i => (
          i.OwnerMessages.length > 0 &&
          i.overallStatus !== 'archived'
        )
      );
    }

    return [];
  }

  assigneeFilter = _issues => {
    const { assigneeFilter } = this.state;
    if (assigneeFilter === "") {
      return _issues;
    }

    const filteredIssues = _issues.filter( issue => issue.Actions.filter(action => action.assignedUser === assigneeFilter).length > 0 );
    return filteredIssues;
  }

  keywordFilter = _issues => { //Checks issue title, houseNUm, action titles, action and issue tag names
    const { searchTerm } = this.state;
    if (searchTerm === "") {
      return _issues;
    }

    const filteredIssues = _issues.filter(issue => {
      const checkList = [
        issue.issueTitle,
        issue.DrmDeal.houseNum,
        ...issue.Actions.map(action => [action.goal, ...action.Tags.map(tag => tag.name)]).flat(),
        ...issue.Tags.map(tag => tag.name),
      ];
      return checkList.some(substr => substr.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return filteredIssues;
  }
  // End filter functions

  // Begin sort functions
  sortBySort = _issues => {
    const { sortIssues } = this.state;
    if(sortIssues === "") {
      return _issues;
    }

    switch (sortIssues) {
      case "houseNum":
        return this.sortByHouseNum(_issues);
      case "urgency":
        return _issues; // Should be default sorted on urgency, will change if unexpected behavior
      case "newest":
        return this.sortUnscheduledIssues(_issues); // I believe this is the same, will separate if they diverge
      case "oldest":
        return this.sortUnscheduledIssues(_issues).reverse();
      default:
        return _issues;
    }
  }

  sortByHouseNum = issues => {
    return issues.sort((a, b) => (a.DrmDeal.houseNum > b.DrmDeal.houseNum) ? 1 : -1);
  }

  sortUnscheduledIssues = issues => {
    const cmp = (a, b) => {
      const sortedActionsA = _.sortBy(a.Actions, 'createdAt').reverse();
      const sortedActionsB = _.sortBy(b.Actions, 'createdAt').reverse();
      if (sortedActionsA.length > 0 && sortedActionsB.length < 1) {
        return -1;
      }
      if (sortedActionsA.length < 1 && sortedActionsB.length > 0) {
        return 1;
      }
      if (sortedActionsA.length > 0 && sortedActionsB.length > 0) {
        if (
          moment(sortedActionsA[0].createdAt).unix() >
          moment(sortedActionsB[0].createdAt).unix()
        ) {
          return -1;
        }
        if (
          moment(sortedActionsA[0].createdAt).unix() <
          moment(sortedActionsB[0].createdAt).unix()
        ) {
          return 1;
        }
      }

      return 0;
    };

    return issues.sort(cmp);
  };

  sortNotfifyOnlyIssues = issues => {
    let draft = issues.filter(i => 
      i.OwnerMessages.some(msg => msg.status === 'DRAFT')
    );

    let notDraft = issues.filter(i => 
      i.OwnerMessages.every(msg => msg.status !== 'DRAFT')  
    );

    let genericNotifyOwnerCmp = (a, b) => {
      let notifyA = a.OwnerMessages;
      let notifyB = b.OwnerMessages;
      notifyA = _.sortBy(notifyA, 'createdAt').reverse();
      notifyB = _.sortBy(notifyB, 'createdAt').reverse();

      if (notifyA.length > 0 && notifyB.length < 1) {
        return -1;
      }

      if (notifyA.length > 0 && notifyB.length < 1) {
        return 0;
      }

      if (moment(notifyA[0].createdAt).isAfter(moment(notifyB[0].createdAt))) {
        return -1;
      } else if (moment(notifyB[0].createdAt).isAfter(moment(notifyA[0].createdAt))) {
        return 1;
      } else {
        return 0;
      }
    }

    draft = draft.sort(genericNotifyOwnerCmp);
    notDraft = notDraft.sort(genericNotifyOwnerCmp);
    return [].concat(draft, notDraft);
  }

  sortInvoiceIssues = issues => {
    let pendingApprovalCmp = (a, b) => {
      let invoicesA = a.Invoices;
      let invoicesB = b.Invoices;
      invoicesA = _.sortBy(invoicesA, 'sentToFinanceDate').reverse();
      invoicesB = _.sortBy(invoicesB, 'sentToFinanceDate').reverse();

      if (invoicesA.length > 0 && invoicesB.length < 1) {
        return -1;
      }

      if (invoicesB.length > 0 && invoicesA.length < 1) {
        return 0;
      }

      if (invoicesA[0].sentToFinanceDate && !invoicesB[0].sentToFinanceDate) {
        return -1;
      }

      if (invoicesB[0].sentToFinanceDate && !invoicesA[0].sentToFinanceDate) {
        return 1;
      }

      if (moment(invoicesA[0].sentToFinanceDate).unix() > moment(invoicesB[0].sentToFinanceDate).unix()) {
        return -1;
      } else if (moment(invoicesB[0].sentToFinanceDate).unix() > moment(invoicesA[0].sentToFinanceDate).unix()) {
        return 1;
      } else {
        return 0;
      }
    }

    let genericInvoiceCmp = (a, b) => {
      let invoicesA = a.Invoices;
      let invoicesB = b.Invoices;
      invoicesA = _.sortBy(invoicesA, 'createdAt').reverse();
      invoicesB = _.sortBy(invoicesB, 'createdAt').reverse();

      if (invoicesA.length > 0 && invoicesB.length < 1) {
        return -1;
      }

      if (invoicesB.length > 0 && invoicesA.length < 1) {
        return 0;
      }

      if (moment(invoicesA[0].createdAt).isAfter(moment(invoicesB[0].createdAt))) {
        return -1;
      } else if (moment(invoicesB[0].createdAt).isAfter(moment(invoicesB[0].createdAt))) {
        return 1;
      } else {
        return 0;
      }
    }

    let pendingApproval = issues.filter(i => 
      i.Invoices.some(inv => inv.status === 'PENDING_APPROVAL')
    );

    pendingApproval = pendingApproval.sort(pendingApprovalCmp);

    let draft = issues.filter(i => 
      i.Invoices.some(inv => inv.status === 'DRAFT')
    );

    draft = draft.sort(genericInvoiceCmp);
    let joined = [].concat(pendingApproval, draft);
    joined = _.uniqBy(joined, 'id');
    return joined;
  };

  sortEstimatesIssues = issues => {

    const estimatesPriorityMap = {
      APPROVED: 0,
      CHANGES_REQUESTED: 1,
      DECLINED: 2,
      DRAFT: 3,
      AWAITING_RESPONSE: 4,
    };

    let quotes = issues.reduce((prev, cur) => {
      let temp = [].concat(cur.Quotes);
      temp = _.sortBy(temp, 'createdAt').reverse();
      prev.push(temp[0]);
      return prev;
    }, []);

    const cmp = (a, b) =>
      estimatesPriorityMap[a.status] - estimatesPriorityMap[b.status];

    quotes = _.sortBy(quotes, 'statusDate').reverse();
    quotes = quotes.sort(cmp);

    let sortedIssues = quotes.map(q => issues.find(i => i.id == q.issueId));
    return _.uniqBy(sortedIssues, 'id');
  };

  sortScheduledIssues = issues => {
    const cmp = (a, b) => {
      const sortedActionsA = _.sortBy(a.Actions, 'updatedAt').reverse();
      const sortedActionsB = _.sortBy(b.Actions, 'updatedAt').reverse();
      if (sortedActionsA.length > 0 && sortedActionsB.length < 1) {
        return -1;
      }
      if (sortedActionsA.length < 1 && sortedActionsB.length > 0) {
        return 1;
      }
      if (sortedActionsA.length > 0 && sortedActionsB.length > 0) {
        if (
          moment(sortedActionsA[0].updatedAt).unix() >
          moment(sortedActionsB[0].updatedAt).unix()
        ) {
          return -1;
        }
        if (
          moment(sortedActionsA[0].updatedAt).unix() <
          moment(sortedActionsB[0].updatedAt).unix()
        ) {
          return 1;
        }
      }

      return 0;
    };

    return issues.sort(cmp);
  };

  sortActionRequiredIssues = issues => {
    const actionCmp = (a, b) => {
      const dateA = moment(a.updatedAt);
      const dateB = moment(b.updatedAt);
      if (
        a.status === 'complete' &&
        b.status === 'complete' &&
        dateA.isAfter(dateB)
      ) {
        return -1;
      }
      if (a.status === 'complete' && b.status !== 'complete') {
        return -1;
      }
      if (
        a.status === 'complete' &&
        b.status === 'complete' &&
        dateB.isAfter(dateA)
      ) {
        return 1;
      }
      if (b.status === 'complete' && a.status !== 'complete') {
        return 1;
      }

      return 0;
    };

    const issueCmp = (a, b) => {
      const sortedActionsA = a.Actions.sort(actionCmp);
      const sortedActionsB = b.Actions.sort(actionCmp);
      if (sortedActionsA.length > 0 && sortedActionsB.length < 1) {
        return -1;
      }
      if (sortedActionsA.length < 1 && sortedActionsB.length > 0) {
        return 1;
      }
      if (sortedActionsA.length > 0 && sortedActionsB.length > 0) {
        if (
          moment(sortedActionsA[0].updatedAt).unix() >
          moment(sortedActionsB[0].updatedAt).unix()
        ) {
          return -1;
        }
        if (
          moment(sortedActionsA[0].updatedAt).unix() <
          moment(sortedActionsB[0].updatedAt).unix()
        ) {
          return 1;
        }
      }

      return 0;
    };

    return issues.sort(issueCmp);
  };

  sortNewIssues = issues => {
    const cmp = (a, b) => {
      if (priorityMap[a.urgency] < priorityMap[b.urgency]) {
        return -1;
      }
      if (priorityMap[b.urgency] < priorityMap[a.urgency]) {
        return 1;
      }
      if (moment(a.createdAt).unix() > moment(b.createdAt).unix()) {
        return -1;
      }
      if (moment(b.createdAt).unix() > moment(a.createdAt).unix()) {
        return 1;
      }
      return 0;
    };

    return issues.sort(cmp);
  };
  //End sort functions

  renderIssuesByCategory() {
    const { filterCategory } = this.state;
    const { resolved_issues, unscheduled_issues, all_issues } = this.props;
    const unscheduled_data = unscheduled_issues.data;
    const resolved_data = resolved_issues.data;
    const all_data = all_issues.data;
    let filteredIssues, sortedIssues;

    switch (filterCategory) {
      case ACTION_REQUIRED:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case NEW_ISSUES:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case UNSCHEDULED_ISSUES:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case SCHEDULED_ISSUES:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case ESTIMATES_ISSUES:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case RESOLVED:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case INVOICE_ISSUES:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case NOTIFY_OWNER_ISSUES:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
      case ALL_ISSUES:
        return this.renderIssues(all_data);
      default:
        filteredIssues = this.issuesFilter(unscheduled_data, filterCategory);
        sortedIssues = this.sortIssuesThroughCategory(filteredIssues, filterCategory);
        return this.renderIssues(sortedIssues);
    }
  }

  renderHeaders(){
    const {
      filterCategory,
    } = this.state;
    const { unscheduled_issues, resolved_issues, all_issues } = this.props;
    const resolvedData = resolved_issues.data || [];
    const headers = [
      NEW_ISSUES,
      ACTION_REQUIRED,
      ESTIMATES_ISSUES,
      SCHEDULED_ISSUES,
      UNSCHEDULED_ISSUES,
      INVOICE_ISSUES,
      NOTIFY_OWNER_ISSUES,
      RESOLVED,
      ALL_ISSUES,
    ];

    return(
      <div className="top-section_bottom">
        {headers.map((header, index) => {
          let length = 0;
          if( header === RESOLVED ){ //Probably should be more elegant
            length = resolved_issues.data.totalCount >= 0 ? resolved_issues.data.totalCount : 0;
          } else if( header === ALL_ISSUES ){
            length = all_issues.data.totalCount >= 0 ? all_issues.data.totalCount : 0;
          } 
          else {
            length = this.issuesFilter(unscheduled_issues.data, header).length || 0;
          }
          return(
            <div
              key={index}
              className="status-card"
              onClick={() => this.setState({ filterCategory: header })}
              className={`status-card ${
                filterCategory === header ? 'active-state' : ''
              }`}
            >
              <h1>{ length }</h1>
              <h2>{ this.processHeaderTitle(header) }</h2>
            </div>
            )
        })}
      </div>
    )
  }

  renderCustomOptions(){
    const { searchTerm, assigneeFilter, sortIssues, filterCategory } = this.state;
    const { drmUsers } = this.props;

    let users = drmUsers.data;
    users = _.sortBy(users, 'username');

    return (
      <div className="top-section_middle">
        <div className="top-section_middle_left">
          <input
            type="search"
            className="search-filed"
            placeholder="Search by keyword"
            value={searchTerm}
            onChange={evt => this.toggleState('searchTerm', evt.target.value)}
          />
          <img src={searchOrange} />
        </div>
        <div className="top-section_middle_right">
          <div className="issues-filters_filter">
            <p>Assignee</p>
            <div className="select">
              <select
                onChange={evt =>
                  this.toggleState('assigneeFilter', evt.target.value)
                }
                value={assigneeFilter}
              >
                <option value="">All</option>
                {users.map((user, index) => {
                  return (<option value={user.id} key={index}>{user.username}</option>)
                })}
              </select>
            </div>
          </div>
          <div className="issues-filters_filter">
            <p>Sort by</p>
            <div className="select">
              <select
                onChange={evt =>
                  this.toggleState('sortIssues', evt.target.value)
                }
                value={sortIssues}
              >
                <option value="">Standard</option>
                {MOCK_DATA.ISSUE_SORT_OPTIONS.map(
                  (sort_option, index) => (
                    <option value={sort_option.value} key={index}>
                      {sort_option.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  processHeaderTitle(title){
    const mainTitle = title.replace(/_ISSUES/g,'');
    const spacedTitle = mainTitle.replace(/_/g,' ').toLowerCase();

    var finalTitle = spacedTitle.toLowerCase().split(' ');
    for (var i = 0; i < finalTitle.length; i++) {
      finalTitle[i] = finalTitle[i].charAt(0).toUpperCase() + finalTitle[i].substring(1);     
    }
    return finalTitle.join(' '); 

    return finalTitle;
  }

   issuesFilter = (_issues, header) => {
    const { filterCategory } = this.state;
    const check = filterCategory === ALL_ISSUES;

    const assigneeFiltered = !check ? this.assigneeFilter(_issues) : _issues;
    const keywordFiltered = !check ? this.keywordFilter(assigneeFiltered) : _issues;

    switch ( header ) {
      case ACTION_REQUIRED:
        return this.actionRequiredFilter(keywordFiltered);
      case NEW_ISSUES:
        return this.newIssuesFilter(keywordFiltered);
      case UNSCHEDULED_ISSUES:
        return this.unscheduledFilter(keywordFiltered);
      case SCHEDULED_ISSUES:
        return this.scheduledFilter(keywordFiltered);
      case ESTIMATES_ISSUES:
        return this.estimatesFilter(keywordFiltered);
      case RESOLVED:
        return this.resolvedFilter(keywordFiltered);
      case INVOICE_ISSUES:
        return this.invoiceFilter(keywordFiltered);
      case NOTIFY_OWNER_ISSUES:
        return this.notifyOwnerFilter(keywordFiltered);
      case ALL_ISSUES:
      default:
        return keywordFiltered;
    }
   }

  sortIssuesThroughCategory = (issues, cat) => {
    const { sortIssues } = this.state;

    if(sortIssues){
      return this.sortBySort(issues);
    }

    switch (cat) {
      case ACTION_REQUIRED:
        return this.sortActionRequiredIssues(issues);
      case NEW_ISSUES:
        return this.sortNewIssues(issues);
      case UNSCHEDULED_ISSUES:
        return this.sortUnscheduledIssues(issues);
      case SCHEDULED_ISSUES:
        return this.sortScheduledIssues(issues);
      case ESTIMATES_ISSUES:
        return this.sortEstimatesIssues(issues);
      case RESOLVED:
        return _.sortBy(issues, 'resolvedDate');
      case INVOICE_ISSUES:
        return this.sortInvoiceIssues(issues);
      case NOTIFY_OWNER_ISSUES:
        return this.sortNotfifyOnlyIssues(issues);
      case ALL_ISSUES:
        return _.sortBy(issues, 'createdAt');
      default:
        return issues;
    }
  }

  render() {
    const {
      isSidebarOpen,
      isOpenNewIssue,
      isFullCardOpen,
      filterCategory,
      allPage,
      resolvedPage,
    } = this.state;
    const { drmDeals, drmUsers, resolved_issues } = this.props;
    const resolvedData = resolved_issues.data || [];

    return (
      <div className="section issues-section">
        <div className="main-left">
          <div className="top-section">
            <div className="top-section_header">
              <h1>Issues Dashboard</h1>
              <button
                className="orange-button"
                onClick={() => this.toggleState('isOpenNewIssue', true)}
              >
                <img src={plusWhite} />
                New Issue
              </button>
            </div>


            { this.renderCustomOptions() }

            { this.renderHeaders() }
          </div>
          { this.renderIssuesByCategory() }
        </div>
        {isSidebarOpen ? (
          <div className="main-right issues-sidebar">
            <CardOpen
              issue={this.state.activeIssue}
              resolutionInfo
              showSchedule={false}
              showIssues
              onClose={() =>
                this.setState({ isSidebarOpen: false, activeIssue: {} })
              }
              onOpenFullView={() => this.toggleState('isFullCardOpen', true)}
              drmDeals={drmDeals.data}
              drmUsers={drmUsers.data}
              onCreateAction={this.props.createOneAction}
              onUpdateAction={this.props.updateOneAction}
              onUpdateIssue={this.props.updateOneIssue}
              toggleState={this.toggleState}
            />
          </div>
        ) : null}
        {isOpenNewIssue && (
          <div className="main-right issues-sidebar">
            <NewIssue
              isOpen={isOpenNewIssue}
              onClose={() => this.toggleState('isOpenNewIssue', false)}
              onCreateIssue={this.props.createIssue}
              drmDeals={drmDeals.data}
              drmUsers={drmUsers.data}
              pageLength={pageLength}
              allPage={allPage}
              resolvedPage={resolvedPage}
            />
          </div>
        )}

        {isFullCardOpen && (
          <FullCard
            fullCardTabIndex={this.state.fullCardTabIndex}
            toggleState={this.toggleState}
            issue={this.state.activeIssue || {}}
            onUpdateIssue={this.props.updateOneIssue}
            onClose={() => this.setState({ 
              isSidebarOpen: false, 
              activeIssue: {},
              isFullCardOpen: false,
            })}
          />
        )}
      </div>
    );
  }
}
const mapStateToProps = ({
  unscheduled_issues,
  resolved_issues,
  all_issues,
  actions,
  drmDeals,
  drmUsers,
}) => ({
  unscheduled_issues,
  resolved_issues,
  all_issues,
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
  updateOneIssue,
  getDrmUsers,
  updateOneAction,
  getResolvedIssues,
  getAllIssues,
})(Issues);
