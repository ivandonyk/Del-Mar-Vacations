import React from 'react';
import './index.scss';
const Switch = ({ checked = true, onToggle = () => {}, style = {} }) => (
  <div className="ToggleSwitch ToggleSwitch__rounded" style={{ ...style }}>
    <div className="ToggleSwitch__wrapper">
      <div className={`Slider ${checked && 'isChecked'}`} onClick={onToggle} />
    </div>
  </div>
);

export default Switch;
