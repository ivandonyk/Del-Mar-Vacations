import React, { Component } from 'react';
import _ from 'lodash';
import sendIcon from '../../assets/send.svg';
import sendIconGray from '../../assets/send-gray.svg';
import { MOCK_DATA } from '../../helpers/mock_data';
import ActionAccordion from '../Accordion/ActionAccordion';
import { Delete as DeleteIcon } from '@material-ui/icons/';

class NotifyOwnerTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerMsgPhotoTemp: [],
      message: '',
      sending: false,
    };
  }

  componentDidMount() {
    let { ownerMsg } = this.props;
    this.setState({
      message: ownerMsg.data ? ownerMsg.data.message : ''
    });
  }

  _generateNewOwnerMessage = () => {
    const { issue, updateIssueOwnerMessage } = this.props;
    updateIssueOwnerMessage({
      issueId: issue.id,
      status: MOCK_DATA.NOTIFY_OWNER_STATUSES.DRAFT,
      statusDate: new Date(),
    });
  };

  _updateOwnerMessage = updateData => {
    const { issue, updateIssueOwnerMessage } = this.props;
    updateIssueOwnerMessage({
      issueId: issue.id,
      ...updateData,
      statusDate: new Date(),
    });
  };

  resetSending = () => {
    this.setState({
      sending: false,
    });
  }

  _sendNotifyOwnerMessage = () => {
    if (!this._canSendNotification()) return;
    
    let { issue, sendNotifyOwnerMessage, ownerMsg } = this.props;

    this.setState({
      sending: true,
    }, () => {
      sendNotifyOwnerMessage(ownerMsg.data.id, {
        message: this.state.message,
        sentDate: new Date(),
        statusDate: new Date(),
        status: MOCK_DATA.NOTIFY_OWNER_STATUSES.SENT,
        issueId: issue.id,
      }, this.resetSending);
    });
  }

  _canSendNotification = () => {
    const { ownerMsg } = this.props;
    const ownerMsgObj = ownerMsg.data || {};
    return (
      ownerMsgObj.message &&
      ownerMsgObj.message.length > 0
    );
  }

  _getNotifyOwnerPhotosSkimmed = () => {
    const { ownerMsg, photos } = this.props;
    const ownerMsgObj = ownerMsg.data ? ownerMsg.data : {};

    const ownerMsgPhotos = ownerMsgObj.id
      ? photos.filter(
          file =>
            file.table_name === 'OwnerMessage' && file.parent_id === ownerMsgObj.id,
        )
      : [];

    return ownerMsgPhotos.map(photo => {
      return _.omit(
        {
          ...photo,
          parent_id: ownerMsg.data.id,
          table_name: 'OwnerMessage',
          column_name: 'owner_message_photo',
        },
        ['id', 'createdAt', 'updatedAt'],
      );
    });
  }

  _renderStatusHeader = ({ status }) => {
    switch (status) {
      case MOCK_DATA.NOTIFY_OWNER_STATUSES.DRAFT:
        return (
          <div className="open-full-wrapper_body_inner_header">
            <div className="open-full-wrapper_body_inner_header_left">
              <p
                className="grey-btn"
                style={MOCK_DATA.ESTIMATE_STATUS_COLORS.DRAFT}
              >
                {_.startCase(status)}
              </p>
            </div>
            {this.state.sending ? 
            <div className="open-full-wrapper_body_inner_header_right">
                 <p>Sending...</p>
            </div> :
            <div className="open-full-wrapper_body_inner_header_right">
              <p
                className={(!this._canSendNotification()) ? 'disabled' : ''}
                onClick={this._sendNotifyOwnerMessage}
              >
                Send to Homeowner
                <img src={this._canSendNotification() ? sendIcon : sendIconGray} />
              </p>
            </div>
            }
          </div>
        );
      case MOCK_DATA.NOTIFY_OWNER_STATUSES.SENT:
        return (
          <div className="open-full-wrapper_body_inner_header">
            <div className="open-full-wrapper_body_inner_header_left">
              <p
                className="grey-btn"
                style={MOCK_DATA.ESTIMATE_STATUS_COLORS.NOTIFY_OWNER_SENT_TO_HOMEOWNER}
              >
                SENT TO HOMEOWNER
              </p>
            </div>
            <div className="open-full-wrapper_body_inner_header_right">
              <p
                onClick={() =>
                  this._updateOwnerMessage({
                    status: MOCK_DATA.NOTIFY_OWNER_STATUSES.DRAFT,
                  })
                }
              >
                Revise
              </p>
            {this.state.sending ? 
              <p>
                  Sending...
              </p> :
              <p
                className={(!this._canSendNotification()) ? 'disabled' : ''}
                onClick={this._sendNotifyOwnerMessage}
              >
                Resend
                <img src={this._canSendNotification() ? sendIcon : sendIconGray} />
              </p>
            }
            </div>
          </div>
        );

      default:
        return (
          <div className="generate-invoice">
            <div className="invoice-grey-box generate-invoice_box">
              <h2 className="uppercase">MESSAGE HAS NOT BEEN DRAFTED</h2>
              <button
                className="orange-txt-btn"
                onClick={this._generateNewOwnerMessage}
              >
                Draft Message
              </button>
            </div>
            <div className="generate-overlay" />
          </div>
        );
    }
  };

  _onChangeData = (key, value) => {
    this.setState({ [key]: value });
  };

  isPhotoChecked = key => {
    const photos = this._getNotifyOwnerPhotosSkimmed();
    return photos.find(photo => photo.key === key);
  }

  _addRemovePhotoOwnerMsg = photo => {
    const { ownerMsg, photos } = this.props;
    if (!ownerMsg.data) return;
    let ownerMsgPhotos = this._getNotifyOwnerPhotosSkimmed();
    const isAdded = ownerMsgPhotos.find(it => it.key === photo.key);
    let deAssocId = false;

    // if isAdded is true we associate the file, else we deassociate
    if (!isAdded) {
      const alterPhoto = _.omit(
        {
          ...photo,
          parent_id: ownerMsg.data.id,
          table_name: 'OwnerMessage',
          column_name: 'owner_message_photo',
        },
        ['id', 'createdAt', 'updatedAt'],
      );
      ownerMsgPhotos.push(alterPhoto);
    } else {
      // grab the id of the photo record that will be deassociated so 
      // we can forward that to the action and reducer which will remove it from
      // the redux state
      deAssocId = photos.find(p => p.key === photo.key && p.table_name === 'OwnerMessage').id;
      ownerMsgPhotos = ownerMsgPhotos.filter(p => p.key !== photo.key);
    }

    this.props.syncFileAssociations('OwnerMessage', ownerMsgPhotos, deAssocId);
  };

  _saveAssociationFiles = () => {
    this.props.addFileAssociation(this.state.ownerMsgPhotoTemp);
    this.setState({
      ownerMsgPhotoTemp: [],
    });
  };

  _renderRightSection = () => {
    const { issue, photos, ownerMsg } = this.props;
    const { ownerMsgPhotoTemp } = this.state;

    const issuePhotos = photos.filter(
      file => file.table_name === 'Issues' && file.parent_id === issue.id,
    );

    return (
      <div className="estimates-tab-body_right">
        <div className="estimates-description ">
          <h1 className="grey-box-tittle">DESCRIPTION</h1>
          <p>{issue.issueDescription}</p>
        </div>

        <div className="estimates-description_photos">
          <p className="orange-txt">{issuePhotos.length} Photos </p>
          <div className="photos-attach">
            <div className="photos-attach_images">
              {issuePhotos.map((photo, index) => (
                <div key={index} className="photos-attach_images_image">
                  <span>
                    <input
                      defaultChecked={this.isPhotoChecked(photo.key)}
                      type="checkbox"
                      onClick={() => this._addRemovePhotoOwnerMsg(photo)}
                    />
                  </span>
                  <img src={`/file/${photo.key}`} />
                </div>
              ))}
            </div>
          </div>
          {
            //   estimatePhotosTemp.length > 0 && (
            //   <button
            //     className="orange-button"
            //     onClick={this._saveAssociationFiles}
            //   >
            //     Add
            //   </button>
            // )
          }
        </div>
        <div className="estimate-actons">
          <h1 className="grey-box-tittle">Actions</h1>
          {this._renderActions(issue.Actions)}
        </div>
      </div>
    );
  };

  _renderActions = actions =>
    actions.map((action, index) => (
      <ActionAccordion
        key={index}
        action={action}
        isPresentational
        currentPhotos={this._getNotifyOwnerPhotosSkimmed()}
        onSelectPhoto={photo => this._addRemovePhotoOwnerMsg(photo)}
      />
    ));

  render() {
    const { ownerMsg, updateIssueOwnerMessage, issue, photos } = this.props;
    const { ownerMsgPhotoTemp } = this.state;
    const ownerMsgObj = ownerMsg.data ? ownerMsg.data : {};
    const IS_EDITABLE =
      ownerMsgObj.status === MOCK_DATA.NOTIFY_OWNER_STATUSES.DRAFT;

    const ownerMsgPhotos = ownerMsgObj.id
      ? photos.filter(
          file =>
            file.table_name === 'OwnerMessage' &&
            file.parent_id === ownerMsgObj.id,
        )
      : [];

    return (
      <div className="open-full-wrapper_body_inner">
        {this._renderStatusHeader(ownerMsgObj)}
        <div className="estimates-tab-body">
          <div className="estimates-tab-body_left">
            <h1>NOTIFY HOMEOWNER ONLY</h1>
            <div className="estimate-messate">
              <p>Message to Homeowner</p>
              <textarea
                value={this.state.message}
                placeholder="Message to Homeowner"
                disabled={ownerMsgObj.status && !IS_EDITABLE}
                onBlur={evt => {
                  ownerMsgObj.message !== evt.target.value &&
                  updateIssueOwnerMessage({
                    issueId: issue.id,
                    message: evt.target.value,
                  });
                }}
                onChange={evt => this.setState({message: evt.target.value})}
              />
            </div>
            <div className="photos-attach">
              <p>{ownerMsgPhotos.length} Photo(s) Attached</p>
              <div className="photos-attach_images">
                {ownerMsgPhotos.map((photo, index) => {
                  return (
                    <div key={index} className="photos-attach_images_image">
                      <img src={`/file/${photo.key}`} />
                    </div>
                  );
                })}
              </div>

              {ownerMsgPhotoTemp.length > 0 && (
                <React.Fragment>
                  <p
                    style={{
                      borderTop: '1px solid black',
                      marginTop: '10px',
                    }}
                  >
                    {ownerMsgPhotoTemp.length} Selected Photos
                  </p>
                  <div className="photos-attach_images">
                    {ownerMsgPhotoTemp.map((photo, index) => (
                      <div key={index} className="photos-attach_images_image">
                        <img src={`/file/${photo.key}`} />
                      </div>
                    ))}
                  </div>
                  <button
                    className="orange-button"
                    onClick={this._saveAssociationFiles}
                  >
                    Add
                  </button>
                </React.Fragment>
              )}
            </div>
          </div>
          {IS_EDITABLE && this._renderRightSection()}
        </div>
      </div>
    );
  }
}

export default NotifyOwnerTab;
