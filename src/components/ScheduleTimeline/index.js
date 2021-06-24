import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { updateOneAction } from '../../actions';
import Row from './Row';
import Item from './Item';
import CONSTANTS from './constants';
import Utils from '../../helpers/utils';

import './timeline.scss';
class Timeline extends Component {
  constructor() {
    super();
    this.state = {
      events: [],
      rows: [],
      items: [],
      NUM_COLS: CONSTANTS.NUM_COLS,
      taskNumber: 0,
      hoursNumber: 0,
      nextAvaialbleElem: null,
    };
    this.timelineRef = React.createRef();
    this._getNextElem = _.debounce(this._getNextElem, 500);
  }

  componentDidMount() {
    const { timelineDate, todaysActions, drmDeals, drmUsers } = this.props;

    this.setState(
      {
        events: [],
        rows: drmUsers.data.map((item, index) => ({
          // FIXME: Change item.id to deal_id as more robust
          id: item.id,
          name:
            item.firstname && item.lastname
              ? `${item.firstname} ${item.lastname}`
              : item.username,
          groups: item.groups.map(g => g.title),
        })),
      },
      async () => {
        await this._updateStateData(timelineDate, todaysActions);
        this._scrollToTime(14);
      },
    );

    // this.timelineRef.addEventListener('mousewheel', this.onMouseWheelZoom);
  }

  componentWillUnmount() {
    // this.timelineRef.removeEventListener('mousewheel', this.onMouseWheelZoom);
  }

  async componentWillReceiveProps(nextProps) {
    const { timelineDate, todaysActions, drmDeals, drmUsers } = nextProps;
    if (drmUsers.data && drmUsers.data !== this.props.drmUsers.data) {
      this.setState({
        rows: drmUsers.data.map((item, index) => ({
          // FIXME: Change item.id to deal_id as more robust
          id: item.id,
          name:
            item.firstname && item.lastname
              ? `${item.firstname} ${item.lastname}`
              : item.username,
          groups: item.groups.map(g => g.title),
        })),
      });
    }

    if (timelineDate && timelineDate !== this.props.timelineDate) {
      await this._updateStateData(timelineDate, todaysActions);
    }

    if (
      todaysActions &&
      JSON.stringify(todaysActions) !== JSON.stringify(this.props.todaysActions)
    ) {
      await this._updateStateData(timelineDate, todaysActions);
    }
  }

  _getNextElem = () => {
    this._nextAvailableOutOfViewport();
  };

  _scrollToTime = time => {
    const node = document.querySelector(`[name="header-cell-${time}"]`);
    if (node) {
      node.scrollIntoView({
        // behavior: 'smooth',
        block: 'center',
      });
    }
  };

  _updateStateData = (timelineDate, todaysActions) => {
    const parsedTimelineItems =
      this.parseTimelineItems(timelineDate, todaysActions) || [];
    const numberOfTasks = parsedTimelineItems.filter(
      item =>
        item.assignedUser !== -1 &&
        !isNaN(item.gridStart) &&
        !isNaN(item.gridEnd),
    ).length;
    const numberOfHours = this.countSpans(
      parsedTimelineItems.filter(
        item =>
          item.assignedUser !== -1 &&
          !isNaN(item.gridStart) &&
          !isNaN(item.gridEnd),
      ),
      0,
      true,
    );
    const sortedItems = _.sortBy(parsedTimelineItems, 'gridStart');
    return this.setState(
      {
        items: sortedItems,
        taskNumber: numberOfTasks,
        hoursNumber: numberOfHours,
      },
      () => {
        setTimeout(this._nextAvailableOutOfViewport, 1000);
      },
    );
  };

  parseTimelineItems = (timelineDate, todaysActions) =>
    // let { todaysActions } = this.props;
    todaysActions
      .filter(item => this.isItemInTimelineDate(item.assignedDay, timelineDate))
      .map(item => {
        if (!item.gridStart) {
          const parsed = Utils.parseDateToGrid(item.timeStart, item.timeEnd);
          return {
            ...item,
            ...parsed,
          };
        }
        return item;
      });

  countSpans = (actions, zeroer, inHours) => {
    let counter = zeroer;
    for (let i = 0; i < actions.length; i++) {
      counter = counter + actions[i].gridEnd - actions[i].gridStart;
    }

    if (inHours) {
      return counter / 4;
    }
    return counter;
  };

  isItemInTimelineDate = (startDate, timelineDate) => {
    // const { timelineDate } = this.props;
    if (
      timelineDate &&
      timelineDate.format('MM/DD/YYYY') ===
        moment(startDate).format('MM/DD/YYYY')
    ) {
      return true;
    }
    return false;
  };

  scrollToValue = () => {
    const slider = document.getElementsByClassName('gantt')[0];
    const items = _.sortBy(this.state.items, 'gridStart');

    if (items.length > 0) {
      const toElem = document.getElementById(items[0].id); // e.target.parentElement;
      const toElemDim = toElem.getBoundingClientRect();
      console.log('toElemDim.left', toElemDim.left);
      slider.scroll({ left: toElemDim.left - 170 });
    }
  };

  _onChangeItemPosition = (rowId, itemId, gridStart, gridEnd) => {
    const { items } = this.state;

    const itemIndex = items.findIndex(item => item.id === itemId);
    const tempData = items;
    if (
      tempData[itemIndex] &&
      tempData[itemIndex].gridStart === gridStart &&
      tempData[itemIndex].gridEnd === gridEnd
    )
      return;

    tempData[itemIndex] = {
      ...tempData[itemIndex],
      gridStart: gridStart >= 0 ? gridStart : 0,
      gridEnd,
    };

    return this.setState({
      items: tempData,
    });
  };

  _onDropItemSort = () =>
    this.setState({
      items: _.sortBy(this.state.items, 'gridStart'),
    });

  _groupFilterMethod = (row, groupName) => row.groups.includes(groupName);

  _grouplessFilterMethod = row => row.groups.length === 0;

  _filterByGroup = (rows, groupName, isOther) => {
    if (isOther) {
      return rows.filter(this._grouplessFilterMethod);
    }
    return rows.filter(row => this._groupFilterMethod(row, groupName));
  };

  _populateTimeline = (groupName, other = false) => {
    const { rows, items } = this.state;
    const { timelineDate, drmDeals, drmUsers } = this.props;
    const grouped_items = _.groupBy(items, 'assignedUser');
    return rows
      .filter(
        other
          ? this._grouplessFilterMethod
          : row => this._groupFilterMethod(row, groupName),
      )
      .map((row, rowIndex) => {
        // let items_filtered = (grouped_items[row.id] || []).filter(
        //   // Filter and render actions only with valid statuses - and exclude 'completed' ones.
        //   item => CONSTANTS.STATUSES.indexOf(item.status.toUpperCase()) > -1,
        // );
        const rowId = row.id; // `${groupName}_${row.id}`;
        const items_filtered = grouped_items[rowId] || [];
        const subRowId = `sub-${rowId}`;
        const rowItems = items_filtered.filter(
          item => !isNaN(item.gridStart) && !isNaN(item.gridEnd),
        );

        const notAssignedItems =
          items_filtered.filter(
            item => isNaN(item.gridStart) || isNaN(item.gridEnd),
          ) || [];
        return (
          <Row
            key={rowIndex}
            rowName={row.name}
            id={rowId}
            subRowId={subRowId}
            number_columns={CONSTANTS.NUM_COLS}
            timelineDate={timelineDate}
            notAssignedItems={notAssignedItems}
            updateOneAction={this.props.updateOneAction}
          >
            {rowItems.map((item, index) => (
              <Item
                key={index}
                actionItem={item}
                rowId={rowId}
                subRowId={subRowId}
                timelineDate={timelineDate}
                handleSync={this.props.handleSync}
                followUpUser
                color={
                  item.status
                    ? CONSTANTS.STATUS_COLORS[item.status.toLowerCase()]
                    : ''
                }
                onChangeItemPosition={this._onChangeItemPosition}
                onDropItem={this._onDropItemSort}
                updateOneAction={this.props.updateOneAction}
                onItemClick={() => {
                  console.log('click item', item);
                  this.props.onClickIssue(item.issueId);
                }}
                drmDeals={drmDeals.data}
                drmUsers={drmUsers.data}
              />
            ))}
          </Row>
        );
      });
  };

  _renderUnassignedRow = () => {
    const { items } = this.state;
    const { timelineDate, drmDeals, drmUsers } = this.props;

    const unassigned_row = [
      {
        id: -1,
        name: 'Unassigned',
        role: 'unassigned',
      },
    ];
    const grouped_items = _.groupBy(items, 'assignedUser');
    return unassigned_row.map((row, rowIndex) => {
      const subRowId = `sub-${row.id}`;
      const items_filtered = (grouped_items[row.id] || []).filter(
        // Filter and render actions only with valid statuses - and exclude 'completed' ones.
        item => CONSTANTS.STATUSES.indexOf(item.status.toUpperCase()) > -1,
      );
      const rowItems = items_filtered.filter(
        item => !isNaN(item.gridStart) && !isNaN(item.gridEnd),
      );
      const notAssignedItems =
        items_filtered.filter(
          item => isNaN(item.gridStart) || isNaN(item.gridEnd),
        ) || [];

      return (
        <Row
          key={rowIndex}
          rowName={`${rowItems.length + notAssignedItems.length} ${row.name}`}
          id={row.id}
          subRowId={subRowId}
          number_columns={CONSTANTS.NUM_COLS}
          timelineDate={timelineDate}
          notAssignedItems={notAssignedItems}
          updateOneAction={this.props.updateOneAction}
        >
          {rowItems.map((item, index) => (
            <Item
              key={index}
              actionItem={item}
              rowId={row.id}
              subRowId={subRowId}
              timelineDate={timelineDate}
              handleSync={this.props.handleSync}
              color={
                item.status
                  ? CONSTANTS.STATUS_COLORS[item.status.toLowerCase()]
                  : ''
              }
              onChangeItemPosition={this._onChangeItemPosition}
              onDropItem={this._onDropItemSort}
              updateOneAction={this.props.updateOneAction}
              onItemClick={() => {
                console.log('click item', item);
                this.props.onClickIssue(item.issueId);
              }}
              drmDeals={drmDeals.data}
              drmUsers={drmUsers.data}
            />
          ))}
        </Row>
      );
    });
  };

  _renderHeaderTimeSpans = (isEmpty = false) => {
    let count = 2;
    const header_data = Array.from(Array(CONSTANTS.HOUR_SPAN).keys());
    if (isEmpty) return null;
    return header_data.map((item, index) => {
      const spanItem = index + count;
      count += 3;

      return (
        <span
          key={index}
          name={!isEmpty ? `header-cell-${item + 1}` : null}
          style={{
            gridColumn: `${spanItem}/${spanItem + CONSTANTS.MIN_HOUR_SPAN}`,
          }}
        >
          {!isEmpty && this.headerFormatter(item)}
        </span>
      );
    });
  };

  headerFormatter = item => {
    let formattedHour = item;
    let suffix = 'AM';
    if (item === 0) {
      formattedHour = item + 12;
    }
    if (item > 12) {
      formattedHour = item - 12;
    }
    if (item >= 12) {
      suffix = 'PM';
    }

    return formattedHour + suffix;
  };

  initHorizontalDrag = evt => {
    // Prevent Dragging if not clicked left mouse or dragging an action from ActionItem component
    if (evt.button !== 0 || evt.target.id === 'drag-action-img') return;

    const slider = document.getElementsByClassName('wrapper-timeline')[0];

    this.isDown = true;
    slider.classList.add('active');
    this.startX = evt.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;

    window.addEventListener('mousemove', this.horizontalDrag, false);
    window.addEventListener('mouseup', this.stopHorizontalDrag, false);
    window.addEventListener('mouseleave', this.stopHorizontalDrag, false);
  };

  horizontalDrag = evt => {
    if (!this.isDown) return;
    const slider = document.getElementsByClassName('wrapper-timeline')[0];
    evt.preventDefault();
    const x = evt.pageX - slider.offsetLeft;
    const y = evt.pageY - slider.offsetTop;
    const walk = (x - this.startX) * 2; // scroll-fast
    // console.log(' this.scrollLeft', y);
    slider.scrollLeft = this.scrollLeft - walk;
  };

  stopHorizontalDrag = () => {
    this.isDown = false;
    const slider = document.getElementsByClassName('wrapper-timeline')[0];
    slider.classList.remove('active');
    window.removeEventListener('mousemove', this.horizontalDrag, false);
    window.removeEventListener('mouseup', this.stopHorizontalDrag, false);
    window.removeEventListener('mouseleave', this.stopHorizontalDrag, false);
  };

  elementsOutOfViewport = el => {
    const rect = el.getBoundingClientRect();
    return !(
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight)
    );
  };

  _nextAvailableOutOfViewport = () => {
    const elems = document.querySelectorAll('[name^="item-"]');
    const nodes = Array.from(elems).filter(this.elementsOutOfViewport);
    const { nextAvaialbleElem } = this.state;

    if (nodes.length > 0) {
      if (!nextAvaialbleElem) {
        return this.setState({
          nextAvaialbleElem: _.min(
            nodes.filter(item => item.getBoundingClientRect().y > 0),
            node => node.getBoundingClientRect().y,
          ),
        });
      }
      const nextElem = nodes.find(item => {
        const { y } = item.getBoundingClientRect();
        return y > nextAvaialbleElem.getBoundingClientRect().y;
      });
      if (nextElem) {
        return this.setState({
          nextAvaialbleElem: nextElem,
        });
      }
      this.state.nextAvaialbleElem !== null &&
        this.setState({
          nextAvaialbleElem: null,
        });
    }
  };

  _scrollToNextViewable = () => {
    const { nextAvaialbleElem } = this.state;
    if (nextAvaialbleElem) {
      nextAvaialbleElem.scrollIntoView({
        // behavior: 'smooth',
        block: 'center',
        inline: 'end',
      });

      setTimeout(this._nextAvailableOutOfViewport, 1000);
    }
  };

  onMouseWheelZoom = e => {
    this._getNextElem();

    if (e.ctrlKey || e.metaKey) {
      const isUp = e.wheelDelta > 0;
      console.log('zooming ', isUp ? 'in' : 'out');
    }
  };

  renderGroupTimeLine = (groupName, other = false) => {
    const itemsInGroup = this._filterByGroup(this.state.rows, groupName, other)
      .length;
    if (itemsInGroup === 0) return null;
    return (
      <React.Fragment key={groupName}>
        <div
          className="gantt__row gantt__row--months"
          style={{
            gridTemplateColumns: '170px 1fr',
            // gridTemplateColumns: `170px repeat(${CONSTANTS.NUM_COLS}, minmax(25px, 1fr))`,
            // position: 'sticky',
            top: '5em',
            zIndex: 2,
          }}
        >
          <div className="gantt__row-first noselect">
            <p className="tittle-bold">{`${groupName} (${itemsInGroup})`}</p>
          </div>

          {this._renderHeaderTimeSpans(true)}
        </div>

        {this._populateTimeline(groupName, other)}
      </React.Fragment>
    );
  };

  renderGridLines = () =>
    _.times(CONSTANTS.NUM_COLS, number => <span key={number} />);

  render() {
    const { taskNumber, hoursNumber, nextAvaialbleElem } = this.state;

    return (
      <div className="wrapper-timeline">
        <div
          className="gantt"
          ref={ref => (this.timelineRef = ref)}
          onMouseDown={this.initHorizontalDrag}
        >
          <div
            className="gantt__row gantt__row--months"
            style={{
              gridTemplateColumns: `170px repeat(${CONSTANTS.NUM_COLS}, minmax(25px, 1fr))`,
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            <div className="gantt__row-first noselect">
              <p>{taskNumber} Scheduled </p>
              <p>{hoursNumber} hrs</p>
            </div>

            {this._renderHeaderTimeSpans()}
          </div>

          <div
            className="gantt__row gantt__row--lines"
            style={{
              gridTemplateColumns: `170px repeat(${CONSTANTS.NUM_COLS}, minmax(25px, 1fr))`,
            }}
          >
            {this.renderGridLines()}
          </div>

          <div className="wrapper-timeline_main">
            {this._renderUnassignedRow()}
            {this.props.drmGroups.data.map(group =>
              this.renderGroupTimeLine(group.title),
            )}
            {this.renderGroupTimeLine('Other', true)}
          </div>
        </div>
        {nextAvaialbleElem && (
          <div className="arrow" onClick={this._scrollToNextViewable}>
            <p>View More</p>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ drmDeals, drmUsers, drmGroups }) => ({
  drmDeals,
  drmUsers,
  drmGroups,
});

export default connect(mapStateToProps, {
  updateOneAction,
})(Timeline);
