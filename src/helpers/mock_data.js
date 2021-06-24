export const MOCK_DATA = {
  REPORTED_BY: ['Guest', 'Homeowner', 'Del Mar Staff'],
  FOLLOW_UP_BY: ['Guest', 'Homeowner'],
  TIMELINE: ['URGENT', 'MEDIUM', 'TURNOVER'],
  ISSUE_SORT_OPTIONS: [
    { name: 'House Number', value: 'houseNum' },
    { name: 'Urgency', value: 'urgency' },
    { name: 'Newest', value: 'newest' },
    { name: 'Oldest', value: 'oldest' },
  ],
  ESTIMATE_STATUSES: {
    DRAFT: 'DRAFT',
    AWAITING_RESPONSE: 'AWAITING_RESPONSE',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    DELETED: 'DELETED',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
  },
  ESTIMATE_STATUS_COLORS: {
    DRAFT: {
      background: '#eaeaea',
      color: '#000000',
    },
    AWAITING_RESPONSE: {
      background: 'rgba(136, 61, 232, 0.2)',
      color: '#883DE8',
    },
    CHANGES_REQUESTED: {
      background: 'rgba(61, 129, 232, 0.2)',
      color: '#3D81E8',
    },
    DELETED: {
      background: '#f64b3c',
      color: '#c81912',
    },
    APPROVED: {
      background: 'rgba(139, 197, 67, 0.41)',
      color: 'green',
    },
    DECLINED: {
      background: '#ffe75e',
      color: '#feb72b',
    },
    SENT_TO_HOMEOWNER: {
      background: 'rgba(139, 197, 67, 0.43)',
      color: 'black',
    },
    PENDING_APPROVAL: {
      background: 'rgba(167, 204, 211, 0.69)',
      color: 'black',
    },
    NOTIFY_OWNER_SENT_TO_HOMEOWNER: {
      background: 'rgba(139, 197, 67, 0.41)',
      color: 'black',
    }
  },
  ESTIMATE_SERVICE_TITLES: [
    '',
    'Billable Labor',
    'Parts and Purchases',
    'Contracted Services',
    'Del Mar Offset',
  ],
  NOTIFY_OWNER_STATUSES: {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
  },
  INVOICE_STATUSES: {
    DRAFT: 'DRAFT',
    SENT_TO_HOMEOWNER: 'SENT_TO_HOMEOWNER',
    SENT: 'SENT',
  },
};
