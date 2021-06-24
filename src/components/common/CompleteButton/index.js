import React from 'react';
import checkmarkIcon from '../../../assets/checkmark_complete.svg';
import './index.scss';
const CompleteButton = ({ onClick = () => {} }) => (
  <div className="btn_wrapper" onClick={onClick}>
    <img src={checkmarkIcon} alt="checkmarkIcon" />
    <p>Mark Complete</p>
  </div>
);

export default CompleteButton;
