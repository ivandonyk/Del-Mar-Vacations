import {
  FETCHING_INVOICE,
  FETCHING_INVOICE_FAILURE,
  FETCHING_INVOICE_SUCCESS,
} from '../constants';

const initialState = {
  data: null,
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_INVOICE: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_INVOICE_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }

    case FETCHING_INVOICE_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
