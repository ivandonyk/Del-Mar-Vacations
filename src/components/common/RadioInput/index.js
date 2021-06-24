import React from 'react';
import './style.scss';

export default (props) => {
    return (
        <div className="radio-container">
            <div onClick={props.onClick} className={"radio-btn" + (props.checked ? " checked" : "")}></div>
            <label>{props.label}</label>
        </div>
    )
}