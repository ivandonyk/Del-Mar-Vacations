import React, { Component } from 'react';

import CONSTANTS from './constants';
import Utils from '../../helpers/utils';
import arrowRight from '../../assets/new/arrow-right.svg';
import UnscheduledActionsList from './UnscheduledActionsList';

class Row extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUnscheduled: false,
    };
    this.setGhostElem = null;
    this.timer = null;
    this.initDrag = false;
  }

  drop = async e => {
    const { id, timelineDate } = this.props;
    const data = e.dataTransfer.getData('cardData');
    if (!data) return;
    const dropItem = JSON.parse(e.dataTransfer.getData('cardData'));
    let card_id = dropItem.cardId;
    const action_id = dropItem.actionId;
    let action = {};
    const column = this.getRelativePosition(e);
    console.log('dropItem', dropItem, column);
    // this.initDrag = false;
    this.removeGhostElement();
    const prevRows = document.getElementsByClassName('drop-row');
    if (prevRows) {
      Array.from(prevRows).map(el => el.classList.remove('drop-row'));
    }
    if (!dropItem.isNew) {
      console.log('to column ', column);
      // move already existing card
      const ratio = column > -1 ? dropItem.gridEnd - dropItem.gridStart : 0;
      // Sets it to column
      const parsedSpans =
        column > -1
          ? Utils.parseSpansToTime(column, column + ratio, timelineDate)
          : {
              timeStart: null,
              timeEnd: null,
            };
      action = {
        id: parseInt(card_id),
        gridStart: parsedSpans.timeStart,
        gridEnd: parsedSpans.timeEnd,
        assignedDay: timelineDate,
        assignedUser: id,
      };

      return this.props.updateOneAction(action);
    }

    // add new card from Issues board
    const row_id = id;
    card_id = dropItem.id;

    const parsedSpans =
      column > -1
        ? Utils.parseSpansToTime(column, column + 6, timelineDate)
        : {
            timeStart: null,
            timeEnd: null,
          };
    action = {
      id: dropItem.id,
      gridStart: parsedSpans.timeStart,
      gridEnd: parsedSpans.timeEnd,
      assignedDay: timelineDate,
      assignedUser: row_id,
    };

    return this.props.updateOneAction(action);

    // this.props.onChangeItemData(null, row_id, card_id, action_id, column, {
    //   id: card_id,
    //   title,
    //   action_id,
    //   status,
    //   ...parsedSpans,
    // });
  };

  dragOver = async e => {
    e.preventDefault();

    const column = this.getRelativePosition(e);
    if (this.setGhostElem !== column) {
      const { subRowId, id } = this.props;
      this.removeGhostElement();
      const prevRows = document.getElementsByClassName('drop-row');
      if (prevRows) {
        Array.from(prevRows).map(el => el.classList.remove('drop-row'));
      }

      // Activates highlighting
      if (column < 0 || false) {
        return this.addDragOverOnRowName(id);
      }

      const tempElem = document.createElement('div');
      tempElem.id = 'drag-ghost';
      const isExistingElem = this._getDraggedElem();
      const isDraggedNewElem = !isExistingElem
        ? {
            gridColumnStart: column > 0 ? column : 1,
            gridColumnEnd: column > 0 ? column + 6 : 7,
          }
        : {
            gridColumnStart: column > 0 ? column : 1,
            gridColumnEnd:
              column > 0 ? column + isExistingElem.ratio : isExistingElem.ratio,
          };
      // console.log('column', column, isExistingElem.ratio);
      // if (!this.initDrag && isExistingElem) {
      //   console.log('first time dragging', isExistingElem);
      //   isDraggedNewElem = {
      //     gridColumnStart: isExistingElem.gridColumnStart,
      //     gridColumnEnd: isExistingElem.gridColumnEnd,
      //   };
      //   this.initDrag = true;
      // }

      tempElem.style.gridColumnStart = isDraggedNewElem.gridColumnStart;
      tempElem.style.gridColumnEnd = isDraggedNewElem.gridColumnEnd;
      const parentElem = document.getElementById(subRowId);
      parentElem.appendChild(tempElem);
    }
    this.setGhostElem = column;
  };

  _getDraggedElem = () => {
    const elem = document.querySelectorAll('[draggable="true"]');
    if (elem.length === 1) {
      const gridColumnStart = elem[0].style['grid-column-start'];
      const gridColumnEnd = elem[0].style['grid-column-end'];
      return {
        ratio: Math.abs(gridColumnEnd - gridColumnStart) || 1,
        gridColumnStart,
        gridColumnEnd,
      };
    }
    return false;
  };

  removeGhostElement = () => {
    const ghost = document.getElementById('drag-ghost');
    if (ghost) {
      ghost.remove();
    }
  };

  addDragOverOnRowName = rowId => {
    let parentRow = document.getElementsByName(`row-${rowId}`); // document.querySelectorAll(`[name="row-${rowId}"]`); //document.getElementById(rowId);

    if (!parentRow || parentRow.length === 0) return;
    parentRow = parentRow[0];
    if (parentRow && !parentRow.firstChild.classList.contains('drop-row')) {
      parentRow.firstChild.classList.add('drop-row');
    }
  };

  getRelativePosition = e => {
    const { subRowId } = this.props;
    const parentElem = document.getElementById(subRowId);
    const parentDim = parentElem.getBoundingClientRect();
    const draggableXPercentage =
      ((e.clientX - parentDim.left) / parentDim.width) * 100;
    const belongToCol =
      CONSTANTS.PERCENTAGES.findIndex(
        item => parseFloat(item) > parseFloat(draggableXPercentage),
      ) - 1;

    return belongToCol;
  };

  render() {
    const {
      id,
      rowName,
      children,
      subRowId,
      number_columns,
      notAssignedItems = [],
    } = this.props;

    return (
      <div
        className="gantt__row timeline-row"
        id={id}
        name={`row-${id}`}
        onDrop={this.drop}
        onDragOver={this.dragOver}
      >
        <div className="gantt__row-first noselect">
          <p>{rowName}</p>
          {notAssignedItems.length > 0 ? (
            <span
              className="nm-dropdown"
              onClick={() => this.setState({ showUnscheduled: true })}
            >
              <p className="orange-txt">{notAssignedItems.length}</p>
              <img src={arrowRight} />
              {this.state.showUnscheduled && notAssignedItems.length > 0 && (
                <UnscheduledActionsList
                  rowName={rowName}
                  notAssignedItems={notAssignedItems}
                  onClose={() =>
                    this.setState({
                      showUnscheduled: false,
                    })
                  }
                />
              )}
            </span>
          ) : null}
        </div>

        <ul
          id={subRowId}
          className="gantt__row-bars"
          style={{
            gridTemplateColumns: `repeat(${number_columns}, minmax(25px, 1fr))`,
          }}
          // onMouseLeave={e => clearTimeout(this.timer)}
          // onDoubleClick={e =>
          //   console.log('double click ', this.getRelativePosition(e))
          // }
        >
          {children}
        </ul>
      </div>
    );
  }
}

export default Row;
