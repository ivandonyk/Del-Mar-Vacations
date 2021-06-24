import React, { Component } from 'react';
import _ from 'lodash';
import plusIcon from '../../assets/plus.svg';
import sendIcon from '../../assets/send.svg';
import sendIconGray from '../../assets/send-gray.svg';
import closeIcon from '../../assets/close_orange.svg';
import greenCheck from '../../assets/green-check.svg';
import { Delete as DeleteIcon } from '@material-ui/icons/';
import { MOCK_DATA } from '../../helpers/mock_data';
import Utils from '../../helpers/utils';
import ActionAccordion from '../Accordion/ActionAccordion';

class EstimateTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      services: [],
      tempService: null,
      estimatePhotosTemp: [],
    };
  }

  _generateEstimate = () => {
    const { issue, updateIssueEstimate } = this.props;
    updateIssueEstimate({
      issueId: issue.id,
      status: MOCK_DATA.ESTIMATE_STATUSES.DRAFT,
      statusDate: new Date(),
    });
  };

  _updateEstimate = updateData => {
    const { issue, updateIssueEstimate } = this.props;
    updateIssueEstimate({
      issueId: issue.id,
      ...updateData,
      statusDate: new Date(),
    });
  };

  _reviseEstimate = updateData => {
    const { issue, reviseIssueEstimate } = this.props;
    reviseIssueEstimate(issue.id, {
      issueId: issue.id,
      ...updateData,
      statusDate: new Date(),
    });
  }

  _deleteEstimate = () => {
    let { issue, deleteIssueEstimate } = this.props;
    deleteIssueEstimate(issue.id);
  }

  _canSendEstimate = () => {
    const { estimate } = this.props;
    const estimateObj = estimate.data || {};
    return (
      estimateObj.message &&
      estimateObj.message.length > 0 &&
      estimateObj.services &&
      estimateObj.services.length > 0 &&
      estimateObj.services[0].productService && estimateObj.services[0].productService.length > 0 &&
      estimateObj.services[0].quantity && estimateObj.services[0].quantity > 0 &&
      estimateObj.services[0].unitCost && estimateObj.services[0].unitCost > 0
    );
  }

  _renderStatusHeader = ({ status }) => {
    switch (status) {
      case MOCK_DATA.ESTIMATE_STATUSES.DRAFT:
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
            <div className="open-full-wrapper_body_inner_header_right">
              <p
                onClick={this._deleteEstimate}
              >
                Delete Estimate
              </p>
              <p
                className={(!this._canSendEstimate()) ? 'disabled' : ''}
                onClick={() => {
                  if (!this._canSendEstimate()) return;
                  this._updateEstimate({
                    status: MOCK_DATA.ESTIMATE_STATUSES.AWAITING_RESPONSE,
                  })
                }}
              >
                Send Estimate to Homeowner
                <img src={this._canSendEstimate() ? sendIcon : sendIconGray} />
              </p>
            </div>
          </div>
        );
      case MOCK_DATA.ESTIMATE_STATUSES.AWAITING_RESPONSE:
        return (
          <div className="open-full-wrapper_body_inner_header">
            <div className="open-full-wrapper_body_inner_header_left">
              <p
                className="grey-btn"
                style={MOCK_DATA.ESTIMATE_STATUS_COLORS.AWAITING_RESPONSE}
              >
                {_.startCase(status)}
              </p>
            </div>
            <div className="open-full-wrapper_body_inner_header_right">
              <p
                onClick={() =>
                  this._reviseEstimate({
                    status: MOCK_DATA.ESTIMATE_STATUSES.DRAFT,
                  })
                }
              >
                Revise
              </p>
              <p
                onClick={() =>
                  this._updateEstimate({
                    status: MOCK_DATA.ESTIMATE_STATUSES.AWAITING_RESPONSE,
                  })
                }
              >
                Resend
                <img src={sendIcon} />
              </p>
            </div>
          </div>
        );

      case MOCK_DATA.ESTIMATE_STATUSES.CHANGES_REQUESTED:
        return (
          <div className="open-full-wrapper_body_inner_header">
            <div className="open-full-wrapper_body_inner_header_left">
              <p
                className="grey-btn"
                style={MOCK_DATA.ESTIMATE_STATUS_COLORS.CHANGES_REQUESTED}
              >
                {_.startCase(status)}
              </p>
            </div>
            <div className="open-full-wrapper_body_inner_header_right">
              <p
                onClick={() =>
                  this._reviseEstimate({
                    status: MOCK_DATA.ESTIMATE_STATUSES.DRAFT,
                  })
                }
              >
                Revise
              </p>
            </div>
          </div>
        );

      case MOCK_DATA.ESTIMATE_STATUSES.APPROVED:
        return (
          <div className="generate-invoice">
            <div className="invoice-grey-box generate-invoice_box">
              <h2
                className="uppercase"
                style={{
                  color: MOCK_DATA.ESTIMATE_STATUS_COLORS.APPROVED.color,
                }}
              >
                <strong>ESTIMATE HAS BEEN APPROVED</strong>
              </h2>
            </div>
            <div className="generate-overlay" />
          </div>
        );
        
      case MOCK_DATA.ESTIMATE_STATUSES.DECLINED:
        return (
          <div className="open-full-wrapper_body_inner_header">
            <div className="open-full-wrapper_body_inner_header_left">
              <p
                className="uppercase"
                style={{
                  color: MOCK_DATA.ESTIMATE_STATUS_COLORS.DECLINED.color,
                }}
              >
                <strong>ESTIMATE HAS BEEN DECLINED</strong>
              </p>
            </div>
            <div className="open-full-wrapper_body_inner_header_right">
              <p
                onClick={() =>
                  this._reviseEstimate({
                    status: MOCK_DATA.ESTIMATE_STATUSES.DRAFT,
                  })
                }
              >
                Revise
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="generate-invoice">
            <div className="invoice-grey-box generate-invoice_box">
              <h2 className="uppercase">ESTIMATE HAS NOT BE GENERATED</h2>
              <button
                className="orange-txt-btn"
                onClick={this._generateEstimate}
              >
                Generate Estimate
              </button>
            </div>
            <div className="generate-overlay" />
          </div>
        );
    }
  };

  _renderProductServices = estimate => {
    const services = estimate.services || [];
    const { status } = estimate;

    return services.map(service => {
      switch (status) {
        case MOCK_DATA.ESTIMATE_STATUSES.DRAFT:
          // case MOCK_DATA.ESTIMATE_STATUSES.CHANGES_REQUESTED:
          return this._renderEditableRow(service);

        default:
          return this._renderUneditableRow(service);
      }
    });
  };

  _renderEditableRow = service => {
    const { addEstimateServices, removeEstimateService, issue } = this.props;
    return (
      <div key={service.id} className="estimates-table_body">
        <div className="estimates-table_body_top">
          <select
            value={service.productService}
            onChange={evt =>
              addEstimateServices(issue.id, {
                ...service,
                productService: evt.target.value,
              })
            }
          >
            {MOCK_DATA.ESTIMATE_SERVICE_TITLES.map((title, index) => (
              <option key={index} value={title}>
                {title}
              </option>
            ))}
          </select>
          <input
            type="number"
            defaultValue={service.quantity}
            onBlur={evt =>
              addEstimateServices(issue.id, {
                ...service,
                quantity: evt.target.value,
              })
            }
          />
          <input
            type="number"
            defaultValue={service.unitCost}
            onBlur={evt =>
              addEstimateServices(issue.id, {
                ...service,
                unitCost: evt.target.value,
              })
            }
          />
          <p>{Utils.formatMoney(service.quantity * service.unitCost || 0)}</p>
          <div
            className="estimates-table_body_buttons"
            style={{ justifyContent: 'center' }}
          >
            <img
              src={closeIcon}
              onClick={() => removeEstimateService(issue.id, service.id)}
            />
          </div>
        </div>
        <div className="estimates-table_body_bottom">
          <textarea
            placeholder={`${service.productService} Description`}
            defaultValue={service.description}
            onBlur={evt =>
              addEstimateServices(issue.id, {
                ...service,
                description: evt.target.value,
              })
            }
          />
        </div>
      </div>
    );
  };

  _renderUneditableRow = service => (
    <div key={service.id} className="estimates-table_body">
      <div className="estimates-table_body_top">
        <p>{service.productService}</p>
        <p>{service.quantity}</p>
        <p>{service.unitCost}</p>
        <p>{Utils.formatMoney(service.quantity * service.unitCost || 0)}</p>
      </div>
    </div>
  );

  _addTempService = isCreating => {
    if (!this.props.estimate.data) return;
    this.setState({
      tempService: isCreating
        ? {
            quoteId: this.props.estimate.data.id,
            productService: '',
            quantity: null,
            unitCost: null,
            description: '',
          }
        : null,
    });
  };

  _getEstimatePhotosSkimmed = () => {
    const { estimate, photos } = this.props;
    const estimateObj = estimate.data ? estimate.data : {};

    const estimatePhotos = estimateObj.id
      ? photos.filter(
          file =>
            file.table_name === 'Quotes' && file.parent_id === estimateObj.id,
        )
      : [];

    return estimatePhotos.map(photo => {
      return _.omit(
        {
          ...photo,
          parent_id: estimate.data.id,
          table_name: 'Quotes',
          column_name: 'estimate_photo',
        },
        ['id', 'createdAt', 'updatedAt'],
      );
    });
  }

  _onChangeData = (key, value) => {
    this.setState({ [key]: value });
  };

  _addRemovePhotoEstimate = photo => {
    const { estimate, photos } = this.props;
    if (!estimate.data) return;
    let estimatePhotos = this._getEstimatePhotosSkimmed();
    const isAdded = estimatePhotos.find(it => it.key === photo.key);
    let deAssocId = false;

    // if isAdded is true we associate the file, else we deassociate
    if (!isAdded) {
      const alterPhoto = _.omit(
        {
          ...photo,
          parent_id: estimate.data.id,
          table_name: 'Quotes',
          column_name: 'estimate_photo',
        },
        ['id', 'createdAt', 'updatedAt'],
      );
      estimatePhotos.push(alterPhoto);
    } else {
      // sort the photos so we always have the newest id first
      let sortedPhotos = _.sortBy(photos, 'id').reverse();

      // grab the id of the photo record that will be deassociated so 
      // we can forward that to the action and reducer which will remove it from
      // the redux state
      deAssocId = sortedPhotos.find(p => p.key === photo.key && p.table_name === 'Quotes').id;
      estimatePhotos = estimatePhotos.filter(p => p.key !== photo.key);
    }

    this.props.syncFileAssociations('Quotes', estimatePhotos, deAssocId);
  };

  _saveAssociationFiles = () => {
    console.log('save', this.state.estimatePhotosTemp);
    this.props.addFileAssociation(this.state.estimatePhotosTemp);
    this.setState({
      estimatePhotosTemp: [],
    });
  };

  _renderRightSection = () => {
    const { issue, photos, estimate } = this.props;
    const { estimatePhotosTemp } = this.state;

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
                      onClick={() => this._addRemovePhotoEstimate(photo)}
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

  isPhotoChecked = key => {
    const photos = this._getEstimatePhotosSkimmed();
    return photos.find(photo => photo.key === key);
  }

  _renderActions = actions =>
    actions.map((action, index) => (
      <ActionAccordion
        key={index}
        action={action}
        isPresentational
        currentPhotos={this._getEstimatePhotosSkimmed()}
        onSelectPhoto={photo => this._addRemovePhotoEstimate(photo)}
      />
    ));

  render() {
    const {
      estimate,
      updateIssueEstimate,
      addEstimateServices,
      issue,
      photos,
    } = this.props;
    const { tempService, estimatePhotosTemp } = this.state;
    const estimateObj = estimate.data ? estimate.data : {};
    const IS_EDITABLE =
      estimateObj.status === MOCK_DATA.ESTIMATE_STATUSES.DRAFT;
    // ||
    // estimateObj.status === MOCK_DATA.ESTIMATE_STATUSES.CHANGES_REQUESTED;
    const estimatePhotos = estimateObj.id
      ? photos.filter(
          file =>
            file.table_name === 'Quotes' && file.parent_id === estimateObj.id,
        )
      : [];

    return (
      <div className="open-full-wrapper_body_inner">
        {this._renderStatusHeader(estimateObj)}
        <div className="estimates-tab-body">
          <div className="estimates-tab-body_left">
            <h1>ESTIMATE</h1>
            {estimateObj.note &&
              estimateObj.status ===
                MOCK_DATA.ESTIMATE_STATUSES.CHANGES_REQUESTED && (
                <div className="estimate-msg">
                  <p> {estimateObj.note}</p>
                </div>
              )}
            <div className="estimate-messate">
              <p>Message to Homeowner</p>

              <textarea
                placeholder="Message to Homeowner"
                defaultValue={estimateObj.message ? estimateObj.message : ''}
                disabled={estimateObj.status && !IS_EDITABLE}
                onBlur={evt =>
                  estimateObj.message !== evt.target.value &&
                  updateIssueEstimate({
                    issueId: issue.id,
                    message: evt.target.value,
                  })
                }
              />
            </div>
            <div className="photos-attach">
              <p>{estimatePhotos.length} Photo Attached</p>
              <div className="photos-attach_images">
                {estimatePhotos.map((photo, index) => (
                  <div key={index} className="photos-attach_images_image">
                    <img src={`/file/${photo.key}`} />
                  </div>
                ))}
              </div>

              {estimatePhotosTemp.length > 0 && (
                <React.Fragment>
                  <p
                    style={{
                      borderTop: '1px solid black',
                      marginTop: '10px',
                    }}
                  >
                    {estimatePhotosTemp.length} Selected Photos
                  </p>
                  <div className="photos-attach_images">
                    {estimatePhotosTemp.map((photo, index) => (
                      <div key={index} className="photos-attach_images_image">
                        <img src={`/file/${photo.key}`} />
                      </div>
                    ))}
                  </div>
                  {/* <button
                    className="orange-button"
                    onClick={this._saveAssociationFiles}
                  >
                    Add
                  </button> */}
                </React.Fragment>
              )}
            </div>

            <div className="estimates-table">
              <div className="estimates-table_header">
                <p>Product/Service</p>
                <p>Quantity</p>
                <p>Unit Cost</p>
                <p>Total</p>
              </div>
              {this._renderProductServices(estimateObj || [])}
              {tempService && (
                <div className="estimates-table_body">
                  <div className="estimates-table_body_top">
                    <select
                      value={tempService.productService}
                      onChange={evt =>
                        this._onChangeData('tempService', {
                          ...tempService,
                          productService: evt.target.value,
                        })
                      }
                    >
                      {MOCK_DATA.ESTIMATE_SERVICE_TITLES.map((title, index) => (
                        <option key={index} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={tempService.quantity}
                      onChange={evt =>
                        this._onChangeData('tempService', {
                          ...tempService,
                          quantity: evt.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      value={tempService.unitCost}
                      onChange={evt =>
                        this._onChangeData('tempService', {
                          ...tempService,
                          unitCost: evt.target.value,
                        })
                      }
                    />
                    <p>
                      {Utils.formatMoney(
                        tempService.quantity * tempService.unitCost || 0,
                      )}
                    </p>
                    <div className="estimates-table_body_buttons">
                      <img
                        src={closeIcon}
                        onClick={() => this._addTempService()}
                      />
                      <img
                        src={greenCheck}
                        onClick={() => {
                          addEstimateServices(issue.id, tempService);
                          this._addTempService();
                        }}
                      />
                    </div>
                  </div>
                  <div className="estimates-table_body_bottom">
                    <textarea
                      placeholder={`${tempService.productService} Description`}
                      value={tempService.description}
                      onChange={evt =>
                        this._onChangeData('tempService', {
                          ...tempService,
                          description: evt.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
              {IS_EDITABLE && (
                <div className="add-line-item">
                  <p onClick={() => this._addTempService(true)}>
                    <img src={plusIcon} />
                    Line Item
                  </p>
                </div>
              )}

              <div className="estimates-total">
                <p>Total</p>
                <p>
                  {Utils.formatMoney(
                    (estimateObj.services || []).reduce(
                      (a, b) => a + b.unitCost * b.quantity,
                      0,
                    ),
                  )}
                </p>
              </div>
            </div>

            <div className="estimate-msg">
              <p>
                This is an estimate for the work requested or recommended based
                on labor + materials OR a subcontractor quote. Should the actual
                time or materials to complete the work exceed the estimated
                amount, you will be responsible for the final invoice.
              </p>
            </div>
          </div>
          {IS_EDITABLE && this._renderRightSection()}
        </div>
      </div>
    );
  }
}

export default EstimateTab;
