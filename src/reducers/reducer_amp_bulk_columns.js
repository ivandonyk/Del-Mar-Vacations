import {
  FETCHING_BULK_COLUMNS,
  FETCHING_BULK_COLUMNS_FAILURE,
  FETCHING_BULK_COLUMNS_SUCCESS,
} from '../constants';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_BULK_COLUMNS: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_BULK_COLUMNS_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }
    case FETCHING_BULK_COLUMNS_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
