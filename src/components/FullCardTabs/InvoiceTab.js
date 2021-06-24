import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import plusIcon from '../../assets/plus.svg';
import sendIcon from '../../assets/send.svg';
import sendIconGray from '../../assets/send-gray.svg';
import closeIcon from '../../assets/close_orange.svg';
import greenCheck from '../../assets/green-check.svg';
import { MOCK_DATA } from '../../helpers/mock_data';
import Utils from '../../helpers/utils';
import ActionAccordion from '../Accordion/ActionAccordion';
import arrowDown from '../../assets/arrow-down.svg';
import InputAutoComplete from '../common/InputAutoComplete';
import { Delete as DeleteIcon } from '@material-ui/icons/';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

class InvoiceTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      services: [],
      tempService: null,
      invoicePhotosTemp: [],
    };
  }

  _generateInvoice = () => {
    const { issue, updateIssueInvoice } = this.props;
    updateIssueInvoice({
      issueId: issue.id,
      status: MOCK_DATA.INVOICE_STATUSES.DRAFT,
      statusDate: new Date(),
    });
  };

  _updateInvoice = updateData => {
    const { issue, updateIssueInvoice } = this.props;
    updateIssueInvoice({
      issueId: issue.id,
      ...updateData,
      statusDate: new Date(),
    });
  };
  
  _deleteInvoice = () => {
    let { issue, deleteIssueInvoice } = this.props;
    deleteIssueInvoice(issue.id);
  }

  _reviseInvoice = updateData => {
    const { issue, reviseIssueInvoice } = this.props;
    reviseIssueInvoice(issue.id, {
      issueId: issue.id,
      ...updateData,
      statusDate: new Date(),
    });
  }

  _canSendInvoice = () => {
    const { invoice } = this.props;
    let invoiceObj = invoice.data || {};
    return (
      invoiceObj.message &&
      invoiceObj.message.length > 0 &&
      invoiceObj.services &&
      invoiceObj.services.length > 0 &&
      invoiceObj.services[0].productService && invoiceObj.services[0].productService.length > 0 &&
      invoiceObj.services[0].quantity && invoiceObj.services[0].quantity > 0 &&
      invoiceObj.services[0].unitCost && invoiceObj.services[0].unitCost > 0 &&
      invoiceObj.invoiceDate && Object.prototype.toString.call(new Date(invoiceObj.invoiceDate)) === '[object Date]' &&
      invoiceObj.serviceAddress && invoiceObj.serviceAddress.length > 0
    );
  }

  _showConfirmDialog = () => {
    if (!this._canSendInvoice()) return;
    confirmAlert({
      title: 'Are you sure?',
      message: 'Are you sure you want to send the invoice to both the homeowner and the finance department? This is an irreversible process',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            this._updateInvoice({
              status: MOCK_DATA.INVOICE_STATUSES.SENT,
              sentToFinanceDate: new Date(),
            });
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  }

  _renderStatusHeader = ({ status, statusDate }) => {
    switch (status) {
      case MOCK_DATA.INVOICE_STATUSES.DRAFT:
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
                onClick={this._deleteInvoice}
              >
                Delete Invoice
              </p>
              <p
                className={(!this._canSendInvoice()) ? 'disabled' : ''}
                onClick={this._showConfirmDialog}
              >
                Send To Homeowner &amp; Finance Department
                <img src={this._canSendInvoice() ? sendIcon : sendIconGray} />
              </p>
            </div>
          </div>
        );
      // case MOCK_DATA.INVOICE_STATUSES.PENDING_APPROVAL:
      //   return (
      //     <div className="open-full-wrapper_body_inner_header">
      //       <div className="open-full-wrapper_body_inner_header_left">
      //         <p
      //           className="grey-btn"
      //           style={MOCK_DATA.ESTIMATE_STATUS_COLORS.PENDING_APPROVAL}
      //         >
      //           {_.startCase(status)}
      //         </p>
      //       </div>
      //       <div className="open-full-wrapper_body_inner_header_right">
      //         <p
      //           onClick={() =>
      //             this._reviseInvoice({
      //               status: MOCK_DATA.INVOICE_STATUSES.DRAFT,
      //             })
      //           }
      //         >
      //           Revise
      //         </p>
      //         <p
      //           onClick={() =>
      //             this._updateInvoice({
      //               status: MOCK_DATA.INVOICE_STATUSES.SENT_TO_HOMEOWNER,
      //             })
      //           }
      //         >
      //           Send Invoice to Homeowner
      //           <img src={sendIcon} />
      //         </p>
      //       </div>
      //     </div>
      //   );

      case MOCK_DATA.INVOICE_STATUSES.SENT:
        const sentDate = moment(statusDate).format('MMM DD, YYYY');
        const sentDays =
          moment().diff(moment(statusDate), 'days') > 0
            ? `Sent ${moment().diff(
                moment(statusDate),
                'days',
              )} days ago (${sentDate})`
            : `Sent Today (${sentDate})`;
        return (
          <div className="open-full-wrapper_body_inner_header">
            <div
              className="open-full-wrapper_body_inner_header_left"
              style={{ flex: 1, justifyContent: 'space-between' }}
            >
              <p
                className="grey-btn"
                style={MOCK_DATA.ESTIMATE_STATUS_COLORS.SENT_TO_HOMEOWNER}
              >
                {_.startCase(status)}
              </p>
              <p className="sent-date-paragraph">{sentDays}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="generate-invoice">
            <div className="invoice-grey-box generate-invoice_box">
              <h2 className="uppercase">INVOICE HAS NOT BE GENERATED</h2>
            </div>
            <div className="generate-overlay" />
          </div>
        );
    }
  };

  _renderProductServices = invoice => {
    const services = invoice.services || [];
    const { status } = invoice;

    return services.map(service => {
      switch (status) {
        case MOCK_DATA.INVOICE_STATUSES.DRAFT:
          // case MOCK_DATA.INVOICE_STATUSES.CHANGES_REQUESTED:
          return this._renderEditableRow(service);

        default:
          return this._renderUneditableRow(service);
      }
    });
  };

  _renderEditableRow = service => {
    const { addInvoiceServices, removeInvoiceService, issue } = this.props;
    return (
      <div key={service.id} className="estimates-table_body">
        <div className="estimates-table_body_top">
          <select
            value={service.productService}
            onChange={evt =>
              addInvoiceServices(issue.id, {
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
              addInvoiceServices(issue.id, {
                ...service,
                quantity: evt.target.value,
              })
            }
          />
          <input
            type="number"
            defaultValue={service.unitCost}
            onBlur={evt =>
              addInvoiceServices(issue.id, {
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
              onClick={() => removeInvoiceService(issue.id, service.id)}
            />
          </div>
        </div>
        <div className="estimates-table_body_bottom">
          <textarea
            placeholder={`${service.productService} Description`}
            defaultValue={service.description}
            onBlur={evt =>
              addInvoiceServices(issue.id, {
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
    if (!this.props.invoice.data) return;
    this.setState({
      tempService: isCreating
        ? {
            invoiceId: this.props.invoice.data.id,
            productService: '',
            quantity: null,
            unitCost: null,
            description: '',
          }
        : null,
    });
  };

  _onChangeData = (key, value) => {
    this.setState({ [key]: value });
  };

  isPhotoChecked = key => {
    const photos = this._getInvoicePhotosSkimmed();
    return photos.find(photo => photo.key === key);
  }

  _addRemovePhotoInvoice = photo => {
    const { invoice, photos } = this.props;
    if (!invoice.data) return;
    let invoicePhotos = this._getInvoicePhotosSkimmed();
    const isAdded = invoicePhotos.find(it => it.key === photo.key);
    let deAssocId = false;

    // if isAdded is true we associate the file, else we deassociate
    if (!isAdded) {
      const alterPhoto = _.omit(
        {
          ...photo,
          parent_id: invoice.data.id,
          table_name: 'Invoices',
          column_name: 'invoice_photo',
        },
        ['id', 'createdAt', 'updatedAt'],
      );
      invoicePhotos.push(alterPhoto);
    } else {
      // grab the id of the photo record that will be deassociated so 
      // we can forward that to the action and reducer which will remove it from
      // the redux state
      deAssocId = photos.find(p => p.key === photo.key && p.table_name === 'Invoices').id;
      invoicePhotos = invoicePhotos.filter(p => p.key !== photo.key);
    }

    this.props.syncFileAssociations('Invoices', invoicePhotos, deAssocId);
  };

  _saveAssociationFiles = () => {
    console.log('save', this.state.invoicePhotosTemp);
    this.props.addFileAssociation(this.state.invoicePhotosTemp);
    this.setState({
      invoicePhotosTemp: [],
    });
  };

  _renderRightSection = () => {
    const { issue, photos, invoice } = this.props;
    const { invoicePhotosTemp } = this.state;

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
                      onClick={() => this._addRemovePhotoInvoice(photo)}
                    />
                  </span>
                  <img src={`/file/${photo.key}`} />
                </div>
              ))}
            </div>
          </div>
          {
            //   invoicePhotosTemp.length > 0 && (
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

  _getInvoicePhotosSkimmed = () => {
    const { invoice, photos } = this.props;
    const invoiceObj = invoice.data ? invoice.data : {};

    const invoicePhotos = invoiceObj.id
      ? photos.filter(
          file =>
            file.table_name === 'Invoices' && file.parent_id === invoiceObj.id,
        )
      : [];

    return invoicePhotos.map(photo => {
      return _.omit(
        {
          ...photo,
          parent_id: invoice.data.id,
          table_name: 'Invoices',
          column_name: 'invoice_photo',
        },
        ['id', 'createdAt', 'updatedAt'],
      );
    });
  }

  _renderActions = actions =>
    actions.map((action, index) => (
      <ActionAccordion
        key={index}
        action={action}
        isPresentational
        currentPhotos={this._getInvoicePhotosSkimmed()}
        onSelectPhoto={photo => this._addRemovePhotoInvoice(photo)}
      />
    ));

    _getRecipients = () => {
      let { DrmDeal } = this.props.issue;
      let recipients = [];
      recipients.push(DrmDeal.firstName + ' ' + DrmDeal.lastName);

      if (DrmDeal.h1_firstname && DrmDeal.h1_lastname) {
        recipients.push(DrmDeal.h1_firstname + ' ' + DrmDeal.h1_lastname);
      }

      if (DrmDeal.h2_firstname && DrmDeal.h2_lastname) {
        recipients.push(DrmDeal.h2_firstname + ' ' + DrmDeal.h2_lastname);
      }

      return recipients;
    }

  render() {
    const {
      invoice,
      updateIssueInvoice,
      addInvoiceServices,
      issue,
      photos,
      drmDeals,
    } = this.props;
    const { tempService, invoicePhotosTemp } = this.state;
    const invoiceObj = invoice.data ? invoice.data : {};
    const IS_EDITABLE = invoiceObj.status === MOCK_DATA.INVOICE_STATUSES.DRAFT;

    const invoicePhotos = invoiceObj.id
      ? photos.filter(
          file =>
            file.table_name === 'Invoices' && file.parent_id === invoiceObj.id,
        )
      : [];

    const amountDue = (invoiceObj.services || []).reduce(
      (a, b) => a + b.unitCost * b.quantity,
      0,
    );

    return (
      <div className="open-full-wrapper_body_inner">
        {this._renderStatusHeader(invoiceObj)}
        <div className="estimates-tab-body">
          <div className="estimates-tab-body_left">
            <h1>INVOICE</h1>
            {invoiceObj.note &&
              invoiceObj.status ===
                MOCK_DATA.INVOICE_STATUSES.CHANGES_REQUESTED && (
                <div className="estimate-msg">
                  <p> {invoiceObj.note}</p>
                </div>
              )}
            <div className="estimate-messate">
              <p>Message to Homeowner</p>

              <textarea
                placeholder="Message to Homeowner"
                defaultValue={invoiceObj.message ? invoiceObj.message : ''}
                disabled={invoiceObj.status && !IS_EDITABLE}
                onBlur={evt =>
                  invoiceObj.message !== evt.target.value &&
                  updateIssueInvoice({
                    issueId: issue.id,
                    message: evt.target.value,
                  })
                }
              />
            </div>
            <div className="photos-attach">
              <p>
                {invoicePhotos.length > 0
                  ? `${invoicePhotos.length} Photo Attached`
                  : 'No Photos Attached'}{' '}
              </p>
              <div className="photos-attach_images">
                {invoicePhotos.map((photo, index) => (
                  <div key={index} className="photos-attach_images_image">
                    <img src={`/file/${photo.key}`} />
                  </div>
                ))}
              </div>

              {invoicePhotosTemp.length > 0 && (
                <>
                  <p
                    style={{
                      borderTop: '1px solid black',
                      marginTop: '10px',
                    }}
                  >
                    {invoicePhotosTemp.length} Selected Photos
                  </p>
                  <div className="photos-attach_images">
                    {invoicePhotosTemp.map((photo, index) => (
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
                </>
              )}
            </div>

            <div className="invoice-info">
              <div className="invoice-info_data">
                <span>
                  <h2>Invoice #</h2>
                  <p>{invoiceObj.invoiceNum}</p>
                </span>
              </div>

              <div className="invoice-info_inner">
                <h2>Recipient</h2>
                <div className="select-option">
                  <select
                    disabled={!IS_EDITABLE}
                    value={invoiceObj.recipient || ''}
                    onChange={evt =>
                      invoiceObj.recipient !== evt.target.value &&
                      updateIssueInvoice({
                        issueId: issue.id,
                        recipient: evt.target.value,
                      })
                    }
                  >
                    {this._getRecipients().map((recipient, index) => (
                      <option key={index} value={recipient}>{recipient}</option>
                    ))}
                  </select>
                  <img src={arrowDown} alt="" />
                </div>
              </div>
              <div className="invoice-info_inner">
                <h2>Invoice Date </h2>
                <input
                  disabled={!IS_EDITABLE}
                  type="date"
                  defaultValue={Utils.convertTimeMsToString(invoiceObj.invoiceDate)}
                  onBlur={evt =>
                    invoiceObj.invoiceDate !== evt.target.value &&
                    updateIssueInvoice({
                      issueId: issue.id,
                      invoiceDate: evt.target.value,
                    })
                  }
                />
              </div>
              <div className="invoice-info_inner">
                <h2>Service Address</h2>
                <div className="select-option">
                  {
                    // <select
                    //   onChange={evt =>
                    //     invoiceObj.serviceAddress !== evt.target.value &&
                    //     updateIssueInvoice({
                    //       issueId: issue.id,
                    //       serviceAddress: evt.target.value,
                    //     })
                    //   }
                    // >
                    //   <option>Property #342</option>
                    //   <option>Property #342</option>
                    // </select>
                    // <img src={arrowDown} alt="" />
                  }
                  <InputAutoComplete
                    placeholderText="#000"
                    disabled={!IS_EDITABLE}
                    value={invoiceObj.serviceAddress}
                    onItemSelect={item => {
                      invoiceObj.serviceAddress !== item.name &&
                        updateIssueInvoice({
                          issueId: issue.id,
                          serviceAddress: item.name,
                          invoiceNum: `${item.name}-20`,
                        });
                    }}
                    onClearData={() =>
                      updateIssueInvoice({
                        issueId: issue.id,
                        serviceAddress: null,
                        invoiceNum: null,
                      })
                    }
                    data={drmDeals.map(user => ({
                      ...user,
                      id: user.id,
                      name: user.houseNum,
                    }))}
                  />
                </div>
              </div>
              <div className="invoice-info_inner">
                <h2>Amount Due</h2>
                <div className="select-option">
                  {
                    // <input
                    //   type="number"
                    //   // onChange={ invoiceObj.message !== evt.target.value &&
                    //   // updateIssueInvoice({
                    //   //   issueId: issue.id,
                    //   //   recipient: evt.target.value,
                    //   // })}
                    // />
                  }
                  <p style={{ fontSize: '18px' }}>
                    {Utils.formatMoney(amountDue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="estimates-table">
              <div className="estimates-table_header">
                <p>Product/Service</p>
                <p>Quantity</p>
                <p>Unit Cost</p>
                <p>Total</p>
              </div>
              {this._renderProductServices(invoiceObj || [])}
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
                          addInvoiceServices(issue.id, tempService);
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
                <p>Amount Due:</p>
                <p>{Utils.formatMoney(amountDue)}</p>
              </div>
            </div>
            {
              // <div className="estimate-msg">
              //   <p>
              //     This is an estimate for the work requested or recommended based
              //     on labor + materials OR a subcontractor quote. Should the actual
              //     time or materials to complete the work exceed the estimated
              //     amount, you will be responsible for the final invoice.
              //   </p>
              // </div>
            }
          </div>
          {IS_EDITABLE && this._renderRightSection()}
        </div>
      </div>
    );
  }
}

export default InvoiceTab;
