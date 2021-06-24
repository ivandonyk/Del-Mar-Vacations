import React, { Component } from 'react';
import _ from 'lodash';
import CONSTANTS from './constants';
import Utils from '../../helpers/utils';
import { Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ActionCard from '../Home/ActionCard';
import forward_icon from '../../assets/forward-icon.svg';

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0)',
    margin: 0,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: theme.typography.pxToRem(15),
    marginTop: '7px',
    padding: 0,
  },
}))(Tooltip);
class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseDownEvt: null,
    };
  }

  componentWillUnmount() {
    this.stopDragging();
    this.stopResize();
    this.stopMove();
  }

  _toggleMouseEvt = type => {
    this.setState({
      mouseDownEvt: type,
    });
  };

  dragStart = async e => {
    const { target } = e;

    const { rowId, actionItem } = this.props;
    e.dataTransfer.setData(
      'cardData',
      JSON.stringify({
        cardId: target.id,
        actionId: actionItem.id,
        gridStart: actionItem.gridStart,
        gridEnd: actionItem.gridEnd,
        rowId,
      }),
    );
  };

  initMove = e => {
    e.stopPropagation();
    this._toggleMouseEvt('MOVE');
    window.addEventListener('mouseup', this.stopMove, false);
  };

  dragCapture = e => {
    e.stopPropagation();
    if (this.state.mouseDownEvt !== 'MOVE') {
      this._toggleMouseEvt('MOVE');
    }
  };

  stopMove = () => {
    setTimeout(() => this._toggleMouseEvt(null), 200);

    window.removeEventListener('mouseup', this.stopMove, false);
  };

  initResize = async e => {
    e.stopPropagation();
    this._toggleMouseEvt('RESIZE');
    window.addEventListener('mousemove', this.resize, false);
    window.addEventListener('mouseup', this.stopResize, false);
  };

  startDragging = async e => {
    const { onChangeItemPosition, rowId, actionItem } = this.props;
    this.state.mouseDownEvt !== 'DRAG' && this._toggleMouseEvt('DRAG');
    const distance =
      parseInt(actionItem.gridEnd) - parseInt(actionItem.gridStart);
    const spanCol = parseInt(this.getRelativePosition(e));

    if (spanCol < 1 || spanCol + distance > CONSTANTS.NUM_COLS + 1) return;
    if (actionItem.gridStart === spanCol) return;
    return await onChangeItemPosition(
      rowId,
      actionItem.id,
      spanCol,
      spanCol + distance,
    );
  };

  resize = async e => {
    const { onChangeItemPosition, rowId, actionItem } = this.props;
    const spanCol = this.getRelativePosition(e);
    if (spanCol + 2 <= actionItem.gridStart) return;

    return await onChangeItemPosition(
      rowId,
      actionItem.id,
      actionItem.gridStart,
      spanCol + 2,
    );
  };

  stopDragging = async evt => {
    if (this.state.mouseDownEvt === 'DRAG') this.handleDropAction();
    setTimeout(() => this._toggleMouseEvt(null), 200);

    window.removeEventListener('mousemove', this.startDragging, false);
    window.removeEventListener('mouseup', this.stopDragging, false);
  };

  stopResize = async e => {
    if (this.state.mouseDownEvt === 'RESIZE') this.handleDropAction();
    setTimeout(() => this._toggleMouseEvt(null), 200);

    window.removeEventListener('mousemove', this.resize, false);
    window.removeEventListener('mouseup', this.stopResize, false);
  };

  itemClick = (e, id) => {
    e.stopPropagation();

    if (this.state.mouseDownEvt !== null) return;
    console.log('on click id', id, this.state.mouseDownEvt);
    this.props.onItemClick();
  };

  getRelativePosition = e => {
    const { subRowId } = this.props;
    const parentElem = document.getElementById(subRowId); // e.target.parentElement;
    const parentDim = parentElem.getBoundingClientRect();

    const draggableXPercentage =
      ((e.clientX - parentDim.left) / parentDim.width) * 100;

    const belongToCol =
      CONSTANTS.PERCENTAGES.findIndex(
        item => parseFloat(item) > parseFloat(draggableXPercentage),
      ) - 1;
    return belongToCol;
  };

  handleDropAction = e => {
    const { timelineDate, rowId, actionItem } = this.props;
    if (actionItem.gridStart === actionItem.gridEnd) return;

    const parsed = Utils.parseSpansToTime(
      actionItem.gridStart,
      actionItem.gridEnd,
      timelineDate,
    );

    const action = {
      id: actionItem.id,
      gridStart: parsed.timeStart,
      gridEnd: parsed.timeEnd,
      assignedDay: timelineDate,
      assignedUser: rowId,
    };

    this.props.updateOneAction(action);
  };

  removeGhostElement = () => {
    const ghost = document.getElementById('drag-ghost');
    if (ghost) {
      ghost.remove();
    }
    setTimeout(() => this._toggleMouseEvt(null), 200);
  };

  render() {
    const {
      id,
      color = '#00CF92',
      actionItem,
      onItemClick,
      followUpUser,
      timelineDate,
      drmUsers,
    } = this.props;
    if (!actionItem.Issue) return null;

    return (
      <HtmlTooltip
        interactive
        title={
          this.state.mouseDownEvt === null ? (
            <div className="tooltip-wrapper">
              <Tooltip title="Unschedule action">
                <img
                  className="action-archive"
                  src={forward_icon}
                  onClick={() =>
                    this.props.updateOneAction({
                      id: actionItem.id,
                      gridStart: null,
                      gridEnd: null,
                      assignedDay: timelineDate,
                      assignedUser: -1,
                    })
                  }
                />
              </Tooltip>
              <ActionCard
                id={actionItem.Issue.id}
                title={actionItem.Issue.issueTitle}
                description={actionItem.instructions}
                status={actionItem.status}
                house_num={actionItem.Issue.DrmDeal.houseNum}
                action={actionItem}
                onCardClick={onItemClick}
                followUpUser={followUpUser}
                assignedUser={
                  drmUsers.find(user => user.id === actionItem.assignedUser) ||
                  null
                }
              />
            </div>
          ) : (
            ''
          )
        }
      >
        <li
          id={actionItem.id}
          className="action-item"
          name={`item-${actionItem.id}`}
          draggable={this.state.mouseDownEvt === 'MOVE'}
          onDragStart={this.dragStart}
          onDragCapture={this.dragCapture}
          onDragEnd={this.removeGhostElement}
          onMouseDown={this.initMove}
          style={{
            gridColumn: `${actionItem.gridStart}/${actionItem.gridEnd}`,
            borderColor: color,
          }}
          // onClick={e => {
          //   console.log('action item', actionItem);
          //   this.itemClick(e, id);
          // }}
          // onMouseUp={this.handleDropAction}
        >
          <p className={this.state.mouseDownEvt !== 'MOVE' ? 'noselect' : null}>
            {actionItem.goal}
          </p>
          <div
            className="timeline-card-status"
            style={{
              background: color,
            }}
            onMouseDown={this.initResize}
          />
        </li>
      </HtmlTooltip>
    );
  }
}

export default Item;
