import {
  FETCHED_USER_FAILURE,
  FETCHED_USER_SUCCESS,
  FETCHING_USER,
} from '../constants';

const initialState = {
  data: null,
  isFetching: false,
  fetched: false,
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_USER:
      return { data: null, isFetching: true, fetched: false };
    case FETCHED_USER_SUCCESS:
      return { data: action.payload, isFetching: false, fetched: true };
    case FETCHED_USER_FAILURE:
      return {
        data: null,
        isFetching: false,
        fetched: true,
        error: action.payload,
      };
    default:
      return state;
  }
};
