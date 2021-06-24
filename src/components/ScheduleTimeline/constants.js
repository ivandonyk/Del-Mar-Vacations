const HOUR_SPAN = 24;
const MIN_SPAN = 15;
const MIN_HOUR_SPAN = 60 / MIN_SPAN;
const NUM_COLS = MIN_HOUR_SPAN * HOUR_SPAN;
const PERCENTAGES = new Array(NUM_COLS + 1)
  .fill(0)
  .map((item, index) => index * (100 / NUM_COLS));

const STATUS_COLORS = {
  urgent: '#c32121',
  turnover: '#827fed',
  medium: '#f3bc2d',
  complete: 'rgb(0, 207, 146)',
};

const STATUSES = ['URGENT', 'MEDIUM', 'TURNOVER', 'COMPLETE'];

const CONSTANTS = {
  HOUR_SPAN,
  MIN_SPAN,
  MIN_HOUR_SPAN,
  NUM_COLS,
  PERCENTAGES,
  STATUS_COLORS,
  STATUSES,
};

export default CONSTANTS;
