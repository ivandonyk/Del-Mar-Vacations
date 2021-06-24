import { AUTH_USER, AUTH_USER_FAILURE, AUTH_USER_SUCCESS } from '../constants';

const initialState = {
  data: null,
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case AUTH_USER: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case AUTH_USER_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }
    case AUTH_USER_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
