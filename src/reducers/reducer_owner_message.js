import {
  FETCHING_OWNER_MESSAGE,
  FETCHING_OWNER_MESSAGE_FAILURE,
  FETCHING_OWNER_MESSAGE_SUCCESS,
} from '../constants';

const initialState = {
  data: null,
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_OWNER_MESSAGE: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_OWNER_MESSAGE_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }

    case FETCHING_OWNER_MESSAGE_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
