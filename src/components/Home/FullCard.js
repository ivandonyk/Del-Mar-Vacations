import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import moment from 'moment';
import {
  addEstimateServices,
  addFileAssociation,
  addInvoiceServices,
  createOneAction,
  deleteFile,
  getFiles,
  getIssueEstimate,
  getIssueHistory,
  getIssueInvoice,
  getIssueOwnerMessage,
  getIssuesWithUnscheduledActions,
  removeEstimateService,
  removeInvoiceService,
  toggleGalleryModal,
  updateIssueEstimate,
  updateIssueInvoice,
  updateIssueOwnerMessage,
  uploadFile,
  sendNotifyOwnerMessage,
  removeFileAssociation,
  deleteIssueInvoice,
  deleteIssueEstimate,
  reviseIssueEstimate,
  reviseIssueInvoice,
  resolveOneIssue,
  archiveOneIssue,
  syncFileAssociations,
} from '../../actions';
import CONSTANTS from '../ScheduleTimeline/constants';
import GalleryModal from '../GalleryModal';
import EstimateTab from '../FullCardTabs/EstimateTab';
import IssueTab from '../FullCardTabs/IssueTab';
import InvoiceTab from '../FullCardTabs/InvoiceTab';
import closeIcon from '../../assets/close_orange.svg';
import shrinkIcon from '../../assets/shrink.svg';
import arrowLeft from '../../assets/new/arrow-left.svg';
import HistoryTab from '../FullCardTabs/HistoryTab';
import NotifyOwnerTab from '../FullCardTabs/NotifyOwnerTab';

class FullCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newIssue: false,
      cancelNewIssue: false,
      timelineDate: new moment(),
      tabIndex: 0,
    };
  }

  componentDidMount() {
    const {
      issue,
      getFiles,
      getIssueEstimate,
      getIssueHistory,
      getIssueOwnerMessage,
      getIssueInvoice,
      fullCardTabIndex,
    } = this.props;

    getFiles('Issues', issue.id);
    getFiles(
      'Actions',
      issue.Actions.map(item => item.id),
    );
    getIssueEstimate(issue.id);
    getIssueInvoice(issue.id);
    getIssueHistory(issue.id);
    getIssueOwnerMessage(issue.id);

    this.setState({
      tabIndex: fullCardTabIndex
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.issue &&
      JSON.stringify(nextProps.issue) !== JSON.stringify(this.props.issue)
    ) {
      const { issue } = nextProps;
      this.props.getFiles('Issues', issue.id);
      this.props.getFiles(
        'Actions',
        issue.Actions.map(item => item.id),
      );
      this.props.getIssueEstimate(issue.id);
      this.props.getIssueInvoice(issue.id);
      this.props.getIssueHistory(issue.id);
      this.props.getIssueOwnerMessage(issue.id);
    }
    let hasDataChanged = false;
    // refetch all issues on update to reapply the categories
    if (nextProps.estimateIssue !== this.props.estimateIssue) {
      hasDataChanged = true;

      if (nextProps.estimateIssue.data) {
        this.props.getFiles('Quotes', nextProps.estimateIssue.data.id);
      }
    }

    // refetch all issues on update to reapply the categories
    if (nextProps.invoiceIssue !== this.props.invoiceIssue) {
      hasDataChanged = true;
      if (nextProps.invoiceIssue.data) {
        this.props.getFiles('Invoices', nextProps.invoiceIssue.data.id);
      }
    }

    if (nextProps.owner_message !== this.props.owner_message) {
      hasDataChanged = true;
      if (nextProps.owner_message.data) {
        this.props.getFiles('OwnerMessage', nextProps.owner_message.data.id);
      }
    }

    if (hasDataChanged) {
      this.props.getIssuesWithUnscheduledActions();
    }
  }

  componentWillUnmount() {
    this.props.getIssueEstimate(-1);
    this.props.getIssueInvoice(-1);
  }

  toggle = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  _handleKeyDown = e => {
    const { issue } = this.props;
    if (e.keyCode === 13 && e.target.value !== issue.issueTitle) {
      this._updateIssue({ issueTitle: e.target.value });
    }
  };

  _onBlur = (e, key) => {
    this._updateIssue({ [key]: e.target.value });
  }

  _updateIssue = updateObject => {
    const { issue, onUpdateIssue } = this.props;
    if (!issue.id) return;
    onUpdateIssue({
      issueId: issue.id,
      ...updateObject,
    });
  };

  _closeFullCard = () => {
    let { toggleState } = this.props;
    toggleState('isFullCardOpen', false);
    toggleState('fullCardTabIndex', 0);
  }

  changeTabIndex = newIndex => {
    this.setState({
      tabIndex: newIndex,
    });
  }

  render() {
    const {
      toggleState,
      issue,
      estimateIssue,
      invoiceIssue,
      galleryHandler,
      files,
      drmDeals,
    } = this.props;

    if (!issue) return null;

    return (
      <div className="open-full-wrapper status-line">
        {galleryHandler.isOpen && galleryHandler.data && (
          <GalleryModal
            images={galleryHandler.data}
            onClose={() => this.props.toggleGalleryModal('')}
            isOpen={galleryHandler.isOpen && galleryHandler.data}
          />
        )}
        <div
          className="status-line"
          style={{
            background:
              CONSTANTS.STATUS_COLORS[
                (issue.status || issue.urgency).toLowerCase()
              ],
          }}
        />
        <div className="open-full-wrapper_header">
          <div>
            <img
              src={arrowLeft}
              onClick={this._closeFullCard}
            />
            <h1>#{issue.DrmDeal.houseNum}</h1>
            <input
              type="text"
              defaultValue={issue.issueTitle}
              onBlur={e => this._onBlur(e, 'issueTitle')}
              onKeyDown={this._handleKeyDown}
            />
          </div>
          <div className="close-modal">
            <div onClick={this._closeFullCard}>
              <img src={shrinkIcon} />
            </div>
            <div
              onClick={async () => {
                await toggleState('issueOpened', false);
                await this._closeFullCard();
              }}
            >
              <img src={closeIcon} />
            </div>
          </div>
        </div>

        <div className="open-full-wrapper_body">
          <Tabs selectedIndex={this.state.tabIndex} onSelect={tabIndex => this.setState({ tabIndex })}>
            <div className="open-full-wrapper_body_tabs">
              <TabList>
                <Tab>Issue</Tab>
                <Tab>Estimate</Tab>
                <Tab>Invoice</Tab>
                <Tab>Notify Owner</Tab>
                <Tab>History</Tab>
              </TabList>
              <span />
            </div>
            <TabPanel>
              <IssueTab 
                changeTabIndex={this.changeTabIndex}
                updateIssue={this._updateIssue}
                {...this.props} 
              />
            </TabPanel>
            <TabPanel>
              <EstimateTab
                estimate={estimateIssue}
                issue={issue}
                deleteIssueEstimate={this.props.deleteIssueEstimate}
                updateIssueEstimate={this.props.updateIssueEstimate}
                reviseIssueEstimate={this.props.reviseIssueEstimate}
                addEstimateServices={this.props.addEstimateServices}
                removeEstimateService={this.props.removeEstimateService}
                addFileAssociation={this.props.addFileAssociation}
                syncFileAssociations={this.props.syncFileAssociations}
                removeFileAssociation={this.props.removeFileAssociation}
                photos={files.data || []}
              />
            </TabPanel>
            <TabPanel>
              <InvoiceTab
                invoice={invoiceIssue}
                issue={issue}
                updateIssueInvoice={this.props.updateIssueInvoice}
                addInvoiceServices={this.props.addInvoiceServices}
                reviseIssueInvoice={this.props.reviseIssueInvoice}
                removeInvoiceService={this.props.removeInvoiceService}
                addFileAssociation={this.props.addFileAssociation}
                syncFileAssociations={this.props.syncFileAssociations}
                removeFileAssociation={this.props.removeFileAssociation}
                deleteIssueInvoice={this.props.deleteIssueInvoice}
                photos={files.data || []}
                drmDeals={drmDeals.data}
              />
            </TabPanel>
            <TabPanel>
              <NotifyOwnerTab
                issue={issue}
                photos={files.data || []}
                ownerMsg={this.props.owner_message}
                addFileAssociation={this.props.addFileAssociation}
                removeFileAssociation={this.props.removeFileAssociation}
                updateIssueOwnerMessage={this.props.updateIssueOwnerMessage}
                syncFileAssociations={this.props.syncFileAssociations}
                sendNotifyOwnerMessage={this.props.sendNotifyOwnerMessage}
              />
            </TabPanel>
            <TabPanel>
              <HistoryTab />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({
  files,
  upload,
  galleryHandler,
  drmUsers,
  estimateIssue,
  invoiceIssue,
  history,
  owner_message,
  drmDeals,
}) => ({
  files,
  upload,
  galleryHandler,
  drmUsers,
  estimateIssue,
  invoiceIssue,
  history,
  owner_message,
  drmDeals,
});

export default connect(mapStateToProps, {
  getFiles,
  uploadFile,
  deleteFile,
  toggleGalleryModal,
  createOneAction,
  updateIssueEstimate,
  addEstimateServices,
  removeEstimateService,
  getIssuesWithUnscheduledActions,
  addFileAssociation,
  getIssueHistory,
  getIssueOwnerMessage,
  updateIssueOwnerMessage,
  updateIssueInvoice,
  addInvoiceServices,
  removeInvoiceService,
  getIssueEstimate,
  getIssueInvoice,
  sendNotifyOwnerMessage,
  removeFileAssociation,
  deleteIssueInvoice,
  reviseIssueEstimate,
  deleteIssueEstimate,
  reviseIssueInvoice,
  resolveOneIssue,
  archiveOneIssue,
  syncFileAssociations,
})(FullCard);
