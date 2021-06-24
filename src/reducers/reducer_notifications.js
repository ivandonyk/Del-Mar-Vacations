import { CLOSE_NOTIFICATION, OPEN_NOTIFICATION } from '../constants';

const initialState = {
  isOpen: false,
  message: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_NOTIFICATION: {
      return {
        isOpen: true,
        message: action.message,
      };
    }
    case CLOSE_NOTIFICATION: {
      return {
        isOpen: false,
        message: null,
      };
    }

    default:
      return state;
  }
};
