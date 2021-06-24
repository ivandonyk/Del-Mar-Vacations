import { CLOSE_GALLERY, OPEN_GALLERY } from '../constants';

const initialState = {
  data: [],
  column_name: null,
  isOpen: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_GALLERY: {
      return {
        data: action.payload,
        isOpen: true,
      };
    }
    case CLOSE_GALLERY: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
