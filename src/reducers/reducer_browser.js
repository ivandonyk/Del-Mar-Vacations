import { WINDOW_RESIZED } from '../constants';

const initialState = {
  innerWidth: window.innerWidth,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case WINDOW_RESIZED:
      return { innerWidth: window.innerWidth };
    default:
      return state;
  }
};
