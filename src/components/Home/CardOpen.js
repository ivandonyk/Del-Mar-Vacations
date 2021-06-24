import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash';
import arrowLeft from '../../assets/new/arrow-left.svg';
import expandIcon from '../../assets/expand.svg';
import closeIcon from '../../assets/close_orange.svg';
import usersIcons from '../../assets/new/users.svg';
import plusIcon from '../../assets/plus.svg';
import clockGreen from '../../assets/clock-green.svg';
import clock_blue from '../../assets/clock-blue.svg';
import checkmarkIcon from '../../assets/checkmark.svg';
import calendar_blue from '../../assets/calendar-blue.svg';
import CONSTANTS from '../ScheduleTimeline/constants';
import NewAction from './NewAction';
import TagInput from '../common/TagInput/TagInput';
import CompleteButton from '../common/CompleteButton';
import { MOCK_DATA } from '../../helpers/mock_data';
import {
  archiveOneIssue,
  resolveOneIssue,
  updateIssueInvoice,
  updateIssueEstimate,
  updateIssueOwnerMessage,
} from '../../actions';
import guestIcon from '../../assets/guest.svg';
import homeownerIcon from '../../assets/homeowner.svg';
import delmarWindowIcon from '../../assets/delmar_window.png';
import alarmIcon from '../../assets/alarm.svg';
import RadioInput from '../common/RadioInput';
import Utils from '../../helpers/utils';
import ResolvePrompt from '../common/ResolvePrompt';
import { confirmAlert } from 'react-confirm-alert';

/**
 * @augments {Component<Props, State>}
 */
class CardOpen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newAction: false,
      editAction: false,
      actionToEdit: null,
      showResolvePrompt: false,
    };
  }

  _renderCompletedAction = (action, itemIndex) => {
    const { drmUsers, drmDeals, goToAction = () => {} } = this.props;
    const formatDate = new moment(action.assignedDay).local().format('ddd, MMM DD');
    const st = new moment(action.timeStart).utc();
    const en = new moment(action.timeEnd).utc();
    const diff =
      st.isValid() && en.isValid() ? moment.duration(en.diff(st)) : 0;
    const assignedUser =
      drmUsers.find(user => user.id === action.assignedUser) || {};
    const action_photos = action.ActionPhotos || [];
    return (
      <div
        key={action.id}
        className="open-card-action"
        // onClick={() => goToAction(action.assignedDay, action.id)}
      >
        <div className="open-card-action_top">
          <p className="light-grey-box">{itemIndex}</p>
          <div>
            <img src={checkmarkIcon} alt="" />
            <p> {formatDate}</p>
          </div>
          <div>
            <img src={clockGreen} alt="" />
            <p>{diff !== 0 ? diff.asHours() : 0} hrs</p>
          </div>
          <p className="light-grey-box">
            {action.assignedUser !== -1
              ? assignedUser.firstname
                ? `${assignedUser.firstname} ${assignedUser.lastname}`
                : assignedUser.username
              : 'Unassigned'}
          </p>
        </div>
        <div className="open-card-action_body">
          <h2>{action.goal}</h2>
        </div>
        <div className="open-card-action_body">
          <p className="pre-line">{action.instructions}</p>
        </div>
        <div className="open-card-action_footer">
          {action_photos.length > 0 ? (
            <React.Fragment>
              <img src={arrowLeft} alt="" />
              <p className="orange-underline">{action_photos.length} Photos</p>
            </React.Fragment>
          ) : (
            <p className="orange-underline">No Photos</p>
          )}
        </div>
      </div>
    );
  };

  editAction = action => {
    this.setState({
      actionToEdit: action,
      editAction: true,
    });
  }

  _renderActiveAction = (action, itemIndex) => {
    const {
      drmUsers,
      drmDeals,
      goToAction = () => {},
      onUpdateAction,
    } = this.props;
    const formatDate = new moment(action.assignedDay).format('ddd, MMM DD');
    let startHr = new moment(action.timeStart).utc();
    let endHr = new moment(action.timeEnd).utc();
    startHr = startHr.isValid() ? startHr.format('H:mm A') : false;
    endHr = endHr.isValid() ? endHr.format('H:mm A') : false;

    const assignedUser =
      drmUsers.find(user => user.id === action.assignedUser) || {};

    return (
      <div
        key={action.id}
        className="open-card-action"
        // onClick={() => goToAction(action.assignedDay, action.id)}
      >
        <button 
          onClick={() => this.editAction(action)}
          className="empty-btn blue edit-action">
            Edit Action
        </button>
        <div className="open-card-action_top">
          <p className="light-grey-box">{itemIndex}</p>
          <div className="light-grey-box">
            <img src={calendar_blue} alt="" />
            <p> {formatDate}</p>
          </div>
          {startHr && endHr ? (
            <div className="light-grey-box">
              <img src={clock_blue} alt="" />
              <p>
                {startHr} - {endHr}
              </p>
            </div>
          ) : (
            <div className="light-grey-box">
              <p>Not assigned</p>
            </div>
          )}
          <p className="light-grey-box">
            {action.assignedUser !== -1
              ? assignedUser.firstname
                ? `${assignedUser.firstname} ${assignedUser.lastname}`
                : assignedUser.username
              : 'Unassigned'}
          </p>
        </div>
        <div className="open-card-action_body">
          <h2>{action.goal}</h2>
        </div>
        <div className="open-card-action_body">
          <p className="pre-line">{action.instructions}</p>
        </div>

        <div className="open-card-action_btn">
          <CompleteButton
            onClick={() =>
              onUpdateAction({
                id: parseInt(action.id),
                assignedDay: new moment(action.assignedDay),
                status: 'complete',
              })
            }
          />
        </div>
      </div>
    );
  };

  _renderActions = actions =>
    _.sortBy(actions, 'timeStart').map((action, index) => {
      const isActionCompleted = action.status === 'complete';
      const itemIndex = index + 1;
      return isActionCompleted
        ? this._renderCompletedAction(action, itemIndex)
        : this._renderActiveAction(action, itemIndex);
    });

  renderQuoteInvoice = () => {
    let { Quotes } = this.props.issue;
    if(!Quotes){
      return;
    }

    return Quotes.map(quote => {
      const quoteTotal = quote.QuoteRows.reduce((a, b) => a + ((b.quantity * b.unitCost) || 0), 0);
      return(
        <div className="open-card-quote">
          <div className="open-card-quote_header">
            <h2 className="uppercase">Estimate</h2>
            <div>
              {/* <p> Sent 5 days ago </p> */}
              <h2>{ quote.status }</h2>
            </div>
          </div>
          <div className="invoice-wrapper">
            <div className="open-card-quote_total">
              <p>Total</p>
              <p className="price-txt">{ '$' + quoteTotal || "None"}</p>
            </div>
            {quote.QuoteRows.map(quoterow => {
              return(
                <div className="open-card-quote_parts">
                  <p>{ quoterow.productService }</p>
                  <p className="price-txt">$ { quoterow.quantity * quoterow.unitCost }</p>
                </div>
              )
            })}
            <div className="open-card-quote_invoice">
              <h2 className="uppercase">Invoice</h2>
              <div>
                <p className="price-txt">No Invoice</p>
                <p className="orange-underline">Generate</p>
              </div>
            </div>
          </div>
        </div>
      )

    })
  }

  generateInvoice = () => {
    const { issue, updateIssueInvoice } = this.props;
    this.props.toggleState('fullCardTabIndex', 2);
    this.props.toggleState('isFullCardOpen', true);
    if (issue.Invoices.length < 1) {
      updateIssueInvoice({
        issueId: issue.id,
        status: MOCK_DATA.INVOICE_STATUSES.DRAFT,
        statusDate: new Date(),
      });
    }
  }

  generateEstimate = () => {
    const { issue, updateIssueEstimate } = this.props;
    this.props.toggleState('fullCardTabIndex', 1);
    this.props.toggleState('isFullCardOpen', true);
    updateIssueEstimate({
      issueId: issue.id,
      status: MOCK_DATA.INVOICE_STATUSES.DRAFT,
      statusDate: new Date(),
    });
  }

  renderFinanceStatus = (status, statusDate) => {
    switch(status) {
      case MOCK_DATA.ESTIMATE_STATUSES.DECLINED:
        return (
          <p className="declined">Declined</p>
        );
      case MOCK_DATA.ESTIMATE_STATUSES.CHANGES_REQUESTED:
        return (
          <p className="changes_requested">Changes requested</p>
        );
      case MOCK_DATA.ESTIMATE_STATUSES.APPROVED:
        return (
          <p className="approved">Approved</p>
        );
      case MOCK_DATA.INVOICE_STATUSES.DRAFT:
        return (
          <p className="draft_status">Draft</p>
        );
      case MOCK_DATA.ESTIMATE_STATUSES.AWAITING_RESPONSE:
        return (
          <p className="awaiting_response">Awaiting response</p>
        )
      case MOCK_DATA.INVOICE_STATUSES.SENT:
        const sentDate = moment(statusDate).format('MMM DD, YYYY');
        const sentDays =
          moment().diff(moment(statusDate), 'days') > 0
            ? `Sent ${moment().diff(
                moment(statusDate),
                'days',
              )} day(s) ago (${sentDate})`
            : `Sent Today (${sentDate})`;
          return (
            <p className="sent">{sentDays}</p>
          );
      
      default:
        return null;
    }
  }

  renderInvoiceSection = () => {
    let { showAllInvoiceRows } = this.state;
    const { Invoices } = this.props.issue;

    if (Invoices.length === 0) {
      return (
        <div className="open-card-description open-card-quote open-card-invoice">
          <div className="open-card-quote_header">
            <h2 className="uppercase">Invoice</h2>
            <p className="no-invoice">No Invoice</p>
          </div>
        </div>
      );
    }

    let sortedInvoices = _.sortBy(Invoices, 'createdAt').reverse();
    let invoice = sortedInvoices[0];
    let displayedServices = invoice.InvoiceRows.slice(0, 2);
    let remainingServices = invoice.InvoiceRows.slice(2, invoice.InvoiceRows.length);
    let invoiceHasMoreThanTwoServices = invoice.InvoiceRows.length > 2;
    let total = invoice.InvoiceRows.reduce((prev, cur) => prev + (cur.unitCost * cur.quantity), 0);

    return (
      <div className="open-card-description open-card-quote open-card-invoice">
        <div className="open-card-quote_header">
          <h2 className="uppercase">Invoice</h2>
          <div>
            {this.renderFinanceStatus(invoice.status, invoice.statusDate)}
          </div>
        </div>
        <div className="invoice-wrapper">
          <div className="open-card-quote_total">
            <p>Total</p>
            <p className="price-txt">$ {total}</p>
          </div>
          {displayedServices.map((service, index) => (
            <div key={index} className="open-card-quote_parts">
              <p>{service.productService}</p>
              <p className="price-txt">$ {service.unitCost * service.quantity}</p>
            </div>
          ))}
          {
            !showAllInvoiceRows &&  invoiceHasMoreThanTwoServices && 
            <p className="pointer-red-txt" onClick={() => this.setState({ showAllInvoiceRows: true })}>{remainingServices.length} more item(s)</p>
          }
          {showAllInvoiceRows && remainingServices.map((service, index) => (
            <div key={index} className="open-card-quote_parts">
              <p>{service.productService}</p>
              <p className="price-txt">$ {service.unitCost * service.quantity}</p>
            </div>
          ))}
          {showAllInvoiceRows && <p className="pointer-red-txt" onClick={() => this.setState({ showAllInvoiceRows: false })}>Collapse</p>}
        </div>
      </div>
    );
  }

  renderEstimateSection = () => {
    let { showAllQuoteRows } = this.state;
    const { Quotes } = this.props.issue;

    if (Quotes.length === 0) {
      return (
        <div className="open-card-description open-card-quote">
          <div className="open-card-quote_header">
            <h2 className="uppercase">Estimate</h2>
            <div>
              <p onClick={this.generateEstimate} className="generate">Generate</p>
            </div>
          </div>
        </div>
      );
    }

    let sortedQuotes = _.sortBy(Quotes, 'createdAt').reverse();
    let estimate = sortedQuotes[0];
    let displayedServices = estimate.QuoteRows.slice(0, 2);
    let remainingServices = estimate.QuoteRows.slice(2, estimate.QuoteRows.length);
    let estimateHasMoreThanTwoServices = estimate.QuoteRows.length > 2;
    let total = estimate.QuoteRows.reduce((prev, cur) => prev + (cur.unitCost * cur.quantity), 0);

    return (
      <div className="open-card-description open-card-quote">
        <div className="open-card-quote_header">
          <h2 className="uppercase">Estimate</h2>
          <div>
            {this.renderFinanceStatus(estimate.status, estimate.statusDate)}
          </div>
        </div>
        <div className="invoice-wrapper">
          <div className="open-card-quote_total">
            <p>Total</p>
            <p className="price-txt">$ {total}</p>
          </div>
          {displayedServices.map((service, index) => (
            <div key={index} className="open-card-quote_parts">
              <p>{service.productService}</p>
              <p className="price-txt">$ {service.unitCost * service.quantity}</p>
            </div>
          ))}
          {
            !showAllQuoteRows &&  estimateHasMoreThanTwoServices && 
            <p className="pointer-red-txt" onClick={() => this.setState({ showAllQuoteRows: true })}>{remainingServices.length} more item(s)</p>
          }
          {showAllQuoteRows && remainingServices.map((service, index) => (
            <div key={index} className="open-card-quote_parts">
              <p>{service.productService}</p>
              <p className="price-txt">$ {service.unitCost * service.quantity}</p>
            </div>
          ))}
          {showAllQuoteRows && <p className="pointer-red-txt" onClick={() => this.setState({ showAllQuoteRows: false })}>Collapse</p>}
        </div>
      </div>
    );
  }

  renderReportedOrFollowUpBubbles = items => {
    return items.map((item, index) => {
      let icon = guestIcon;
      if (item === 'Homeowner') icon = homeownerIcon;
      else if (item === 'Del Mar Staff') icon = delmarWindowIcon;

      return (
        <div key={index} className="bubble">
          <img src={icon} />
          <span>{item}</span>
        </div>
      );
    });
  }

  renderUrgencyText = () => {
    const { issue } = this.props;
    if (issue.urgency === 'urgent') {
      return (
        <p className="urgency urgent-text">URGENT</p>
      );
    } else if (issue.urgency === 'medium') {
      return (
        <p className="urgency medium-text">MEDIUM</p>
      );
    } else if (issue.urgency === 'turnover') {
      return (
        <p className="urgency turnover-text">TURNOVER</p>
      );
    }
  }

  generateNotifyOwner = () => {
    const { issue, updateIssueOwnerMessage } = this.props;
    this.props.toggleState('fullCardTabIndex', 3);
    this.props.toggleState('isFullCardOpen', true);
    if (issue.OwnerMessages.length < 1) {
      updateIssueOwnerMessage({
        issueId: issue.id,
        status: MOCK_DATA.NOTIFY_OWNER_STATUSES.DRAFT,
        statusDate: new Date(),
      });
    }
  }

  onPostResolve = resolveType => {
    this.setState({
      showResolvePrompt: false,
    }, () => {
      if (resolveType === 'invoice') {
        this.generateInvoice();
      } else if (resolveType === 'notify') {
        this.generateNotifyOwner();
      } else {
        this.props.onClose();
      }
    });
  }

  _showArchiveConfirmDialog = () => {
    confirmAlert({
      title: 'Are you sure?',
      message: 'Are you sure you wish to archive this issue? Archiving the issue is an irreversible process',
      buttons: [
        {
          label: 'Yes',
          onClick: this.archiveIssue
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  }

  archiveIssue = () => {
    const { issue, archiveOneIssue, onClose } = this.props;
    archiveOneIssue(issue.id);
    onClose();
  }

  render() {
    const {
      issue,
      onClose,
      onOpenFullView,
      resolutionInfo = false,
      showSchedule = true,
      showIssues = false,
      onUpdateIssue = () => {},
      drmUsers,
    } = this.props;
    const { newAction, editAction, actionToEdit, showResolvePrompt } = this.state;
    let createdBy = drmUsers.find(user => user.id === issue.createdUser);
    let updatedBy =  drmUsers.find(user => user.id === issue.updatedUser);
    return (
      <div className="open-card-wrapper">
        <div className="open-card">
          <div
            className="status-line"
            style={{
              background:
                CONSTANTS.STATUS_COLORS[
                  (issue.status || issue.urgency).toLowerCase()
                ],
            }}
          />
          <div style={{ position: 'relative' }}>
          <div className="open-card-header">
            <div className="open-card-header_number">
              <div onClick={onClose}>
                <img src={arrowLeft} alt="" />
              </div>

              <h1>#{issue.DrmDeal.houseNum}</h1>
            </div>
            <div className="open-card-header_close">
              <div onClick={onOpenFullView}>
                <img src={expandIcon} alt="" />
              </div>
              <div onClick={onClose}>
                <img src={closeIcon} alt="" />
              </div>
            </div>
          </div>
          <div className="open-card-issue-title">
            <h1>{issue.issueTitle}</h1>
          </div>
          {issue.DrmDeal.alarm_code && null
            // <div className="open-card-alarm-code">
            //   <img src={alarmIcon} />
            //   <h1>{issue.DrmDeal.alarm_code}</h1>
            // </div>
          }
          <div className="open-card-header-subheader">
            <p className="urgency-heading">Urgency</p>
            {this.renderUrgencyText()}
          </div>
          <div className="open-card-header-subheader">
            <p className="reportedby-heading">Reported by</p>
            <div className="bubble-container">
              {this.renderReportedOrFollowUpBubbles(issue.reportingUser ? [issue.reportingUser] : [])}
            </div>
          </div>
          <div className="open-card-header-subheader">
            <p className="followup-heading">Follow up</p>
            <div className="bubble-container">
              {this.renderReportedOrFollowUpBubbles(issue.followUpUser ? issue.followUpUser.split(',') : [])}
            </div>
          </div>
          {/* <div className="open-card-below-header">
            <div
              className="open-card-below-header_left select"
              style={{
                width: '40%',
                height: '31px',
              }}
            >
              {
                // <p>{issue.urgency}</p>
                // <img src={arrowDown} alt="" />
              }
              <select
                value={issue.urgency}
                onChange={evt =>
                  onUpdateIssue({
                    issueId: issue.id,
                    urgency: evt.target.value,
                  })
                }
              >
                <option value="urgent">Urgent</option>
                <option value="medium">Medium</option>
                <option value="turnover">Turnover</option>
              </select>
            </div>

            <div className="reported-input">
              <img src={usersIcons} alt="" />
              <select
                value={issue.reportingUser}
                onChange={evt =>
                  onUpdateIssue({
                    issueId: issue.id,
                    reportingUser: evt.target.value,
                  })
                }
              >
                {MOCK_DATA.REPORTED_BY.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div> */}
          <div className="open-card-issue">
            <div className="open-card-description open-card-tag">
              <h2 className="uppercase">Tags</h2>
              <TagInput associate={issue} inputType={'issue'} />
            </div>
          </div>
          <div className="open-card-description">
            <h2 className="uppercase">Description</h2>
            <p>{issue.issueDescription}</p>
          </div>

          {/* {resolutionInfo === true ? (
            <div className="open-card-resolution">
              <h2 className="uppercase">RESOLUTION</h2>
              <p>Fix the leaking toilet or replace as needed. </p>
            </div>
          ) : null} */}

          <div className="open-card-actions">
            <div className="open-card-actions_header">
              <h2 className="uppercase">Actions ({issue.Actions.length})</h2>
              <button
                className="orange-txt-btn"
                onClick={() => this.setState({ newAction: true })}
              >
                <img src={plusIcon} alt="" />
                New
              </button>
            </div>
            {this._renderActions(issue.Actions)}
          </div>
            
          {this.renderEstimateSection()}
          {this.renderInvoiceSection()}

          <div className="open-card_footer">
            <div>
              <p>Created { moment(issue.createdAt).format('MMMM Do YYYY') } by {createdBy ? Utils.getFullNameOrUsername(createdBy) : 'System'}</p> {/* TZ offset? */}
              <p>Last Updated { moment(issue.updatedAt).format('MMMM Do YYYY') } by {updatedBy ? Utils.getFullNameOrUsername(updatedBy) : 'System'}</p>
            </div>
            {issue.overallStatus === 'archived' ? 
            <div className="resolved-status">Archived</div> :
            issue.overallStatus === 'resolved' ?
            <button onClick={this._showArchiveConfirmDialog} className="orange-button">Archive Issue</button> :
            <button onClick={() => this.setState({ showResolvePrompt: true })} className="orange-button">Resolve Issue</button>
            }
          </div>

          {showResolvePrompt && 
          <ResolvePrompt 
            onCancel={() => {
              this.setState({
                showResolvePrompt: false,
              })
            }}
            callback={this.onPostResolve} 
            issueId={issue.id}
          />}

          {(newAction || editAction) && (
            <NewAction
              onClose={() => this.setState({ 
                newAction: false,
                editAction: false,
                actionToEdit: null,
              })}
              action={actionToEdit}
              editMode={this.state.editAction}
              title={issue.title}
              houseNum={issue.DrmDeal.houseNum}
              issueId={issue.id}
              actionStatus={issue.urgency}
              onCreateAction={this.props.onCreateAction}
            />
          )}
        </div>
        </div>
      </div>
    );
  }
}

CardOpen.propTypes = {
  /** Issue derived from unscheduled_issues array. */
  issue: PropTypes.object.isRequired,
  /** Close active sidebar. */
  onClose: PropTypes.func.isRequired,
  /** Open Full card info view. */
  onOpenFullView: PropTypes.func.isRequired,
  /** Action prop for creating action. */
  onCreateAction: PropTypes.func.isRequired,
  /** All Users fetched from DRM. */
  drmDeals: PropTypes.array,
  goToAction: PropTypes.func,
  drmUsers: PropTypes.array,
};

const mapStateToProps = ({  }) => ({  });

export default connect(mapStateToProps, {
  archiveOneIssue,
  resolveOneIssue,
  updateIssueInvoice,
  updateIssueEstimate,
  updateIssueOwnerMessage,
})(CardOpen);