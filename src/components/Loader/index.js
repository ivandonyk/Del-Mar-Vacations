import React from 'react';
import DelmarWindowImageGif from '../../assets/delmar_window.gif';
import './style.scss';

export const Loader = props => (
  <img src={DelmarWindowImageGif} className="loader" alt="" />
);
