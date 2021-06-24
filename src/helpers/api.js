import axios from 'axios';
import API_ENDPOINTS from './api_endpoints';

const API = {};

API.getUser = () => axios.get(API_ENDPOINTS.USER);

API.login = (username, password) =>
  new Promise((resolve, reject) => {
    axios
      .post(
        API_ENDPOINTS.LOGIN,
        {
          username,
          password,
        },
        { withCredentials: true },
      )
      .then(response => {
        resolve(response);
      })
      .catch(err => {
        reject(err);
      });
  });

API.getActivePropeties = (token, activeTab, offset = 0, rows) =>
  axios.post(API_ENDPOINTS.ACTIVE_PROPERTIES, {
    token,
    activeTab,
    offset,
    rows,
  });

API.getAllCells = () => axios.get(API_ENDPOINTS.ALL_CELLS);

API.createCellsBulk = () => axios.post(API_ENDPOINTS.CREATE_CELLS_BULK, {});

API.updateCellsBulk = formData =>
  axios.put(API_ENDPOINTS.UPDATE_CELLS_BULK, formData);

API.drmUnifiedRequest = (method, endpoint, token, data) =>
  axios.post(API_ENDPOINTS.DRM_UNIFIED, {
    method,
    endpoint,
    token,
    data,
  });

API.getTodaysActions = day =>
  axios.get(API_ENDPOINTS.GET_TODAYS_ACTIONS, { params: { day } });

API.scheduleAction = action =>
  axios.post(API_ENDPOINTS.SCHEDULE_ACTION, {
    action,
  });

API.getIssuesWithUnscheduledActions = () =>
  axios.get(API_ENDPOINTS.GET_UNSCHEDULED_ISSUES);


API.getResolvedIssues = (page, pageSize) =>
  axios.get(API_ENDPOINTS.GET_UNRESOLVED_ISSUES, { params: { page, pageSize } });

API.logout = () =>
  new Promise((resolve, reject) => {
    axios
      .get(API_ENDPOINTS.LOGOUT, { withCredentials: true })
      .then(response => {
        resolve(response);
      })
      .catch(err => {
        reject(err);
      });
  });

API.getAllIssueTags = () => axios.get(API_ENDPOINTS.GET_ALL_ISSUE_TAGS);

API.removeTag = (tag, associate_id, table) =>
  axios.post(API_ENDPOINTS.DELETE_TAG, { tag, associate_id, table });

API.addTag = (tag, associate_id, table) =>
  axios.post(API_ENDPOINTS.ADD_TAG, { tag, associate_id, table });

API.getBulkColumnValues = (username, year) =>
  axios.get(API_ENDPOINTS.BULK_COLUMNS(username, year));

API.setBulkColumnHeaders = formData =>
  axios.post(API_ENDPOINTS.SET_CELLS_BULK, formData);

API.getGroupsMapping = () => axios.get(API_ENDPOINTS.AMP_GROUPS_MAPPING);

API.createAction = issueData =>
  axios.post(API_ENDPOINTS.CREATE_ACTION, issueData);

API.createIssue = issueData =>
  axios.post(API_ENDPOINTS.ISSUE_CREATE, issueData);

API.updateIssue = issueData =>
  axios.post(API_ENDPOINTS.ISSUE_UPDATE, issueData);

API.getDrmDeals = () => axios.get(API_ENDPOINTS.DRM_DEALS);

API.uploadFiles = formData =>
  axios({
    method: 'post',
    url: API_ENDPOINTS.UPLOAD_FILE,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

API.getFiles = (parentTable, parentId) =>
  axios.get(API_ENDPOINTS.GET_FILES(parentTable, parentId));

API.getMultipleFiles = (parentTable, parentId) =>
  axios.get(API_ENDPOINTS.GET_MULTIPLE_FILES(parentTable, parentId));

API.deleteFile = id => axios.delete(API_ENDPOINTS.DELETE_FILE(id));

API.addFileAssociation = associations =>
  axios.post(API_ENDPOINTS.ASSOCIATE_FILES, { data: associations });

API.getDrmUsers = () => axios.get(API_ENDPOINTS.DRM_USERS);

API.getDrmGroups = () => axios.get(API_ENDPOINTS.DRM_GROUPS);

// Estimates API
API.getEstimate = issueId =>
  axios.get(`${API_ENDPOINTS.ESTIMATE_ISSUE}/${issueId}`);
API.putEstimate = estimateObj =>
  axios.post(`${API_ENDPOINTS.ESTIMATE_ISSUE}/create`, {
    quote: {
      ...estimateObj,
    },
  });
API.addEstimateServices = service =>
  axios.post(`${API_ENDPOINTS.ESTIMATE_ISSUE}/services`, { service });
API.removeEstimateService = serviceId =>
  axios.delete(`${API_ENDPOINTS.ESTIMATE_ISSUE}/services/${serviceId}`);
// End Estimates api

// Invoice API
API.getInvoice = issueId =>
  axios.get(`${API_ENDPOINTS.INVOICE_ISSUE}/${issueId}`);
API.putInvoice = invoiceObj =>
  axios.post(`${API_ENDPOINTS.INVOICE_ISSUE}/create`, {
    invoice: {
      ...invoiceObj,
    },
  });
API.addInvoiceServices = service =>
  axios.post(`${API_ENDPOINTS.INVOICE_ISSUE}/services`, { service });
API.removeInvoiceService = serviceId =>
  axios.delete(`${API_ENDPOINTS.INVOICE_ISSUE}/services/${serviceId}`);
// End Invoice API

API.updateAction = (id, data) =>
  axios.post(API_ENDPOINTS.UPDATE_ACTION(id), data);

API.getIssueHistory = id => axios.get(API_ENDPOINTS.GET_ISSUE_HISTORY(id));

API.getIssueOwnerMessage = id =>
  axios.get(API_ENDPOINTS.GET_ISSUE_OWNER_MESSAGE(id));

API.putOwnerMsg = ownerMsg =>
  axios.post(API_ENDPOINTS.CREATE_OR_UPDATE_OWNER_MESSAGE, {
    ownerMsg,
  });

API.sendNotifyOwnerMessage = (id, ownerMsg) =>
  axios.post(API_ENDPOINTS.SEND_NOTIFY_OWNER_MESSAGE(id), {
    ownerMsg
  });

API.deassociateFile = id =>
  axios.get(API_ENDPOINTS.DEASSOCIATE_FILE(id));

API.archiveIssue = issueId =>
  axios.post(API_ENDPOINTS.ARCHIVE_ISSUE, {
    issueId,
  });

API.resolveIssue = (issueId, resolvedType) =>
  axios.post(API_ENDPOINTS.RESOLVE_ISSUE, {
    issueId,
    resolvedType,
  });

API.getAllIssues = (page, pageSize, filter, sortMethod) =>
  axios.post(API_ENDPOINTS.GET_ALL_ISSUES, { page, pageSize, filter, sortMethod });

API.deleteIssueInvoice = issueId =>
  axios.delete(API_ENDPOINTS.DELETE_INVOICE(issueId));

API.reviseEstimate = (issueId, quote) => 
  axios.post(API_ENDPOINTS.REVISE_ESTIMATE(issueId), { quote });

API.deleteEstimate = issueId => 
  axios.delete(API_ENDPOINTS.DELETE_ESTIMATE(issueId));

API.reviseInvoice = (issueId, invoice) => 
  axios.post(API_ENDPOINTS.REVISE_INVOICE(issueId), { invoice });
  
API.syncFileAssociations = (tableName, data) =>
  axios.post(API_ENDPOINTS.SYNC_FILE_ASSOCIATIONS(tableName), { data });

export default API;
