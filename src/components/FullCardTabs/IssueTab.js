import React, { Component } from 'react';
import alarmIcon from '../../assets/alarm.svg';
import usersIcons from '../../assets/new/users.svg';
import minusIcon from '../../assets/minus_red.svg';
import plusIcon from '../../assets/plus.svg';
import arrowDown from '../../assets/arrow-down.svg';
import { MOCK_DATA } from '../../helpers/mock_data';
import TagInput from '../common/TagInput/TagInput';
import FileDrop from '../common/FileDrop';
import MultiSelect from '../common/MultiSelect';
import NewAction from '../Home/NewAction';
import { Delete as DeleteIcon } from '@material-ui/icons/';
import Accordion from '../Accordion/ActionAccordion';
import ResolvePrompt from '../common/ResolvePrompt';
import { confirmAlert } from 'react-confirm-alert';

class IssueTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photoUploaderOpen: false,
      newAction: false,
      showResolvePrompt: false,
    };
  }

  getFollowUpOptions = () => {
    const options = MOCK_DATA.FOLLOW_UP_BY.map(item => ({
      name: item,
      key: item,
    }));
    return options;
  };

  toggle = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  togglePhotoUploader = () => {
    const { photoUploaderOpen } = this.state;

    if (photoUploaderOpen) {
      this.props.getFiles('Issues', this.props.issue.id);

      if (typeof this.props.handleSync === 'function') {
        this.props.handleSync();
      }
    }

    this.setState({ photoUploaderOpen: !photoUploaderOpen });
  };

  transformOldNumericFollowUpToNewFormat = followUp => [
    MOCK_DATA.REPORTED_BY[followUp - 1],
  ];

  _addNewActionToIssue = action => {
    const { createOneAction } = this.props;

    createOneAction(action);
  };

  deleteFile = id => {
    this.props.deleteFile(id);
  };

  getIssuePhotos = () => {
    const { files, issue } = this.props;
    return (files.data || []).filter(
      file =>
        file.parent_id === issue.id &&
        file.table_name === 'Issues' &&
        file.column_name === 'issue_photo',
    );
  }

  renderPhotosSection = () => {
    const { files, issue, toggleGalleryModal } = this.props;
    const photos = (files.data || []).filter(
      file =>
        file.parent_id === issue.id &&
        file.table_name === 'Issues' &&
        file.column_name === 'issue_photo',
    );

    return photos.map((photo, index) => (
      <div
        onClick={() => toggleGalleryModal(photos)}
        target="__blank"
        key={index}
        className="photo-wrapper_inner delete-icon-wrapper pointer"
      >
        <DeleteIcon
          className="delete-icon"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.deleteFile(photo.id);
          }}
        />
        <img src={`/file/${photo.key}`} />
      </div>
    ));
  };

  generateInvoice = () => {
    const { issue, updateIssueInvoice, changeTabIndex } = this.props;
    changeTabIndex(2);
    if (issue.Invoices.length < 1) {
      updateIssueInvoice({
        issueId: issue.id,
        status: MOCK_DATA.INVOICE_STATUSES.DRAFT,
        statusDate: new Date(),
      }); 
    }
  }

  generateNotifyOwner = () => {
    const { issue, updateIssueOwnerMessage, changeTabIndex } = this.props;
    changeTabIndex(3);
    if (issue.OwnerMessages.length < 1) {
      updateIssueOwnerMessage({
        issueId: issue.id,
        status: MOCK_DATA.NOTIFY_OWNER_STATUSES.DRAFT,
        statusDate: new Date(),
      });
    }
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

  archiveIssue = () => {
    const { issue, archiveOneIssue, onClose } = this.props;
    archiveOneIssue(issue.id);
    onClose();
  }

  editAction = action => {
    this.setState({
      editAction: true,
      actionToEdit: action,
    });
  }

  renderActionsAccordion = issue =>
    issue.Actions.map((action, index) => (
      <Accordion editAction={this.editAction} key={index} action={action} />
    ));

  render() {
    const { toggleState, issue, files, galleryHandler } = this.props;
    const { photoUploaderOpen, newAction, showResolvePrompt, editAction, actionToEdit } = this.state;
    return (
      <div className="open-full-wrapper_body_inner">
        {/* <div className="open-full-wrapper_body_inner_alarm">
          <img src={alarmIcon} />
          <h2>Alarm Info:</h2>
          <p>{ issue.DrmDeal.alarm_code ? issue.DrmDeal.alarm_code : "N/A"} </p>
        </div> */}
        <div className="open-full-wrapper_body_inner_filters">
          <div className="reported-input-container">
            <p>Reported by</p>
            <div className="reported-input">
              <img src={usersIcons} />
              <div className="select-option">
                <select
                  value={issue.reportingUser}
                  onChange={evt =>
                    this.props.updateIssue({
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
                <img src={arrowDown} alt="" />
              </div>
            </div>
          </div>
          <div className="follow-by-filter">
            <p>Follow up with</p>
            <div className="select-option">
              <MultiSelect
                // unEditable={true}
                list={this.getFollowUpOptions()}
                selected={
                  issue.followUpUser
                    ? !isNaN(issue.followUpUser)
                      ? this.transformOldNumericFollowUpToNewFormat(
                          issue.followUpUser,
                        )
                      : issue.followUpUser.split(',')
                    : []
                }
                handleChange={e =>
                  this.props.updateIssue({
                    followUpUser: (e.filter(v => v !== null) || '').join(','),
                  })
                }
              />
            </div>
          </div>

          <div className="timeline-filter">
            <p>Timeline</p>
            <div className="select-option select">
              <select
                value={issue.urgency}
                onChange={evt =>
                  this.props.updateIssue({ urgency: evt.target.value })
                }
              >
                <option value="urgent">Urgent</option>
                <option value="medium">Medium</option>
                <option value="turnover">Turnover</option>
              </select>
            </div>
          </div>
        </div>
        <div className="open-full-wrapper_body_inner_tags">
          <h2 className="uppercase">Tags</h2>
          <div className="open-full-wrapper_body_inner_tags_inner">
            <TagInput associate={issue} inputType={'issue'} />
          </div>
        </div>
        <div className="open-full-wrapper_body_inner_description">
          <div className="description_title_wrapper">
            <h2 className="uppercase">Description</h2>
            <button
              className="orange-txt-btn"
              onClick={this.togglePhotoUploader}
            >
              <img
                className="open-full-wrapper_body_inner_description_photos_toggle-icon"
                src={photoUploaderOpen ? minusIcon : plusIcon}
              />
              {photoUploaderOpen ? 'Collapse' : 'Add Photos'}
            </button>
          </div>
          <textarea 
            onBlur={e => {
              this.props.updateIssue({
                issueDescription: e.target.value
              })
            }}
          >
            {issue.issueDescription}
          </textarea>
          <div className="open-full-wrapper_body_inner_description_photos">
            <div
                className="photo-wrapper"
                style={
                  this.getIssuePhotos().length < 1
                    ? { display: 'block' }
                    : { overflowY: 'auto' }
                }
              >
              {this.renderPhotosSection()}
            </div>
          </div>
          <div>
            {photoUploaderOpen ? (
              <FileDrop
                columnName="issue_photo"
                parentTable="Issues"
                parentId={issue.id}
                close={this.togglePhotoUploader}
              />
            ) : (
              ''
            )}
          </div>
        </div>

        <div className="open-full-wrapper_body_inner_actions">
          <div className="open-full-wrapper_body_inner_actions_header">
            <div>
              <h2 className="uppercase">Actions ({issue.Actions.length})</h2>
              {/* <button 
                    onClick={() => this.setState({ expandedActions: true })}
                    className="orange-txt-btn">
                      Expand All
                  </button> */}
            </div>
            {
              // <div>
              //   <button
              //     className="orange-txt-btn"
              //     onClick={() => this.toggle('newIssue', true)}
              //   >
              //     New Action
              //   </button>
              // </div>
            }
            {!newAction && (
              <button
                onClick={() => this.toggle('newAction', true)}
                className="orange-txt-btn"
              >
                <img src={plusIcon} />
                New Action
              </button>
            )}
            {newAction && (
              <div className="new-action_header">
                <button
                  className="orange-txt-btn"
                  onClick={() => this.toggle('newAction', false)}
                >
                  Cancel
                </button>
                <button
                  className="org-border-btn"
                  onClick={() => console.log('save')}
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {(newAction || editAction) && (
            <NewAction
              action={actionToEdit}
              editMode={editAction}
              issueId={issue.id}
              onCreateAction={action => this._addNewActionToIssue(action)}
              actionStatus={issue.urgency}
              onClose={() => this.setState({
                newAction: false,
                editAction: false,
                actionToEdit: null,
              })}
            />
          )}

          <div className="actions-wrapper">
            {this.renderActionsAccordion(issue)}
          </div>
          
          <div className="issue-tab-footer">
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

        </div>
      </div>
    );
  }
}

export default IssueTab;
