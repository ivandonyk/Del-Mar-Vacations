import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList } from 'react-tabs';
import _ from 'lodash';
import moment from 'moment';
import update from 'react-addons-update';
import PublishOwnerSidebar from './PublishOwnerSidebar';
import Switch from '../../components/Switch';
import {
  getActiveProperties,
  updateBulkCells,
  setBulkColumnHeaders,
  getBulkColumnHeaders,
  getAmpGroupsMapping,
  showNotification,
} from '../../actions';
import Snackbar from '@material-ui/core/Snackbar';
import SnackBarContent from '@material-ui/core/SnackbarContent';
import { Loader } from '../Loader';
import down_arrow from '../../assets/down-arrow.svg';
import backArrow from '../../assets/back-orange.svg';
import closeGrey from '../../assets/grey_icons/close-grey.svg';
import './style.scss';
import AmpRow from './AmpRow';
import Utils from '../../helpers/utils';

class AnnualPlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowing: false,
      dropDown: false,
      isEditing: false,
      isPublishOwnerOpen: false,
      editSingleRow: null,
      activeTab: '',
      tabIndex: 0,
      updateQueue: [],
      updateColumnQueue: [],
      active_properties: [],
      description: '',
      service_end_date: null,
      service_start_date: null,
      bulk_pricing: null,
      dropdownColumnId: null,
      dropdownGroupId: null,
      ANNUAL_HEADERS: {},
      focusedCell: null,
      current_service_height: 100,
      tableNum: 0,
    };

    this.outsideDropdownClickRef = React.createRef();
  }

  componentWillMount() {
    this.setCSSColumns(2, 'static');
  }

  componentDidMount() {
    localStorage.setItem('isBlurred', false);

    const { params } = this.props.match;

    this.props.getAmpGroupsMapping();
    this.props.getBulkColumnHeaders(params.year);
    document.addEventListener('click', this.handleClickOutside, true);
    window.addEventListener('focus', this.onFocusLoadData, true);
    window.addEventListener('blur', e => {
      localStorage.setItem('isBlurred', true);
    });

    window.onbeforeunload = () => {
      this.getMidElementInViewport();
    };

    this.setState({ lastLoad: moment() });
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
    window.removeEventListener('focus', this.onFocusLoadData, true);
    this.setCSSColumns(2, 'static');
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.amp_groups_mapping &&
      nextProps.amp_groups_mapping.data !== this.props.amp_groups_mapping.data
    ) {
      this.setState(
        {
          ANNUAL_HEADERS: nextProps.amp_groups_mapping.data,
        },
        () => {
          const activeTab = Object.keys(this.state.ANNUAL_HEADERS)[0];
          this.loadData();
          this.setState({
            activeTab,
          });
        },
      );
    }
    if (
      nextProps.active_properties &&
      nextProps.active_properties.data !== this.props.active_properties.data
    ) {
      this.setState(
        {
          active_properties: nextProps.active_properties.data,
        },
        this._handleScrollIntoField,
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextState.updateColumnQueue.length > 0 &&
      nextState.updateColumnQueue.length === this.state.updateColumnQueue.length
    ) {
      return false;
    }
    return true;
  }

  getMidElementInViewport = () => {
    const elems = document.querySelectorAll('[name^="row-"]');
    const nodes = Array.from(elems).filter(this.isElementInViewport);
    const middleElem = nodes[Math.round(nodes.length / 2)];
    if (middleElem) {
      const nameAttr = middleElem.getAttribute('name');
      console.log('nameAttr', nameAttr);
      localStorage.setItem('ampRow', nameAttr);
    }
  };

  isElementInViewport = el => {
    const rect = el.getBoundingClientRect();
    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      /* or $(window).width() */ rect.top <
        (window.innerHeight ||
          document.documentElement.clientHeight) /* or $(window).height() */
    );
  };

  onFocusLoadData = () => {
    const { activeTab, lastLoad, isEditing } = this.state;
    const now = moment();

    if (now > lastLoad.add(2, 'minutes') && !isEditing) {
      const isBlurred = localStorage.getItem('isBlurred');
      if (activeTab && isBlurred !== 'false') {
        this.props.getActiveProperties(activeTab);
        localStorage.setItem('isBlurred', false);
      }
    }
  };

  handleClickOutside = event => {
    const pathClasses = [...new Set(event.path.map(it => it.className))];
    // Probably should be more dynamic?
    if (!pathClasses.includes('dropdown-edit')) {
      this._dropDownClick();
    }
  };

  loadData = activeTab => {
    this.setCSSColumns(2);
    this.props.getActiveProperties(activeTab);
  };

  _handleScrollIntoField = () => {
    const ampRow = localStorage.getItem('ampRow');
    if (ampRow) {
      const node = document.querySelector(`[name="${ampRow}"]`);
      if (node) {
        node.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'start',
        });
        node.classList.add('field-highlight');
        setTimeout(() => {
          node.classList.remove('field-highlight');
        }, 3000);
        localStorage.removeItem('ampRow');
      }
    }
  };

  _handleClick = e => {
    const { isShowing } = this.state;

    this.setState({ isShowing: !isShowing });
  };

  _resetDropDownState = () =>
    this.setState({
      description: '',
      service_start_date: '',
      service_end_date: '',
      bulk_pricing: null,
      current_service_height: 100,
      dropdownColumnId: null,
      dropdownGroupId: null,
    });

  _dropDownClick = async columnItem => {
    const { dropDown } = this.state;
    const index = columnItem ? columnItem.key : false;

    if (!index || dropDown === index) {
      return this.setState(
        {
          dropDown: false,
        },
        this._resetDropDownState,
      );
    }
    if (dropDown && index && dropDown !== index) {
      await this._resetDropDownState();
    }
    const {
      year,
      description,
      service_start_date,
      service_end_date,
      bulk_pricing,
    } = this.setBulkValuesFromProps(index);

    this.setState({
      dropDown: index,
      year,
      description,
      service_start_date: service_start_date
        ? new moment.utc(service_start_date).format('YYYY-MM-DD')
        : '',
      service_end_date: service_end_date
        ? new moment.utc(service_end_date).format('YYYY-MM-DD')
        : '',
      bulk_pricing,
      bulk_pricing_hold: bulk_pricing, // Not very elegant
      dropdownColumnId: columnItem.id,
      dropdownGroupId: columnItem.groupId,
    });
  };

  _caretClick = async (e, item) => {
    const { active_properties, activeTab, lastColumn } = this.state;
    const { name } = item;
    const { key } = item;
    const lowToHigh = name === lastColumn;

    if (name === 'Status') {
      this.statusSort(active_properties);
    } else {
      this.numericSortOnColumn(active_properties, activeTab, key, lowToHigh);
      if (lowToHigh) {
        this.setState({ lastColumn: '' });
      } else {
        this.setState({ lastColumn: name });
      }
    }

    e.stopPropagation();
  };

  statusSort = active_properties => {
    this.setState({
      active_properties: _.sortBy(active_properties, 'status', 'asc'),
    });
  };

  numericSortOnColumn = (active_properties, activeTab, key, asc) => {
    const tabProperties = active_properties.filter(
      item => item['Group.name'] === activeTab,
    );
    const columnPropertiesCells = tabProperties.map(c => c.cells).flat(1);
    const keyCells = columnPropertiesCells.filter(c => c['Column.key'] === key);
    let sortedCells = [];

    if (asc) {
      sortedCells = [...keyCells].sort((a, b) => a.amount - b.amount);
    } else {
      sortedCells = [...keyCells].sort((a, b) => b.amount - a.amount);
    }

    const orderArr = sortedCells.map(a => a.houseNum);

    const sortedProperties = [...tabProperties].sort((a, b) => {
      const A = a.houseNum;
      const B = b.houseNum;
      return orderArr.indexOf(A) > orderArr.indexOf(B) ? 1 : -1;
    });

    this.setState({
      active_properties: [...Utils.merge(active_properties, sortedProperties)],
    });
  };

  setBulkValuesFromProps = dropDown => {
    const { bulk_columns, match } = this.props;

    return bulk_columns.data
      ? bulk_columns.data.find(
          item => item.year === match.params.year && item.column === dropDown,
        ) || {}
      : {};
  };

  addColumnToUpdateQueue = (columnId, rowId, key, value) => {
    const { updateColumnQueue } = this.state;

    const tempQueue = updateColumnQueue;
    const tempItemIndex = tempQueue.findIndex(item => item.id === columnId);
    const newCell = {
      id: columnId,
      key,
      value: value && value !== '' ? value : null,
    };
    if (tempItemIndex > -1) {
      tempQueue[tempItemIndex] = newCell;
    } else {
      tempQueue.push(newCell);
    }

    return this.setState({
      updateColumnQueue: tempQueue,
    });
  };

  updateActivePropState = (rowId, column) => {
    const { active_properties, activeTab } = this.state;
    const tempProps = active_properties.filter(
      item => item['Group.name'] === activeTab,
    );
    const currentRowIndex = tempProps.findIndex(row => row.id === rowId);
    tempProps[currentRowIndex].cells = [
      ...tempProps[currentRowIndex].cells.map(cell => {
        if (cell.id === column.id) {
          return {
            ...cell,
            [column.key]: column.value,
          };
        }
        return cell;
      }),
    ];

    this.setState({
      active_properties: update(this.state.active_properties, {
        [activeTab]: {
          [currentRowIndex]: {
            cells: { $set: tempProps[currentRowIndex].cells },
          },
        },
      }),
    });
  };

  handleFieldChange = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  onSaveTableColumnValues = async () => {
    const { params } = this.props.match;
    const {
      description,
      service_start_date,
      service_end_date,
      bulk_pricing,
      bulk_pricing_hold,
      activeTab,
      active_properties,
      dropDown,
      updateColumnQueue,
      dropdownColumnId,
      dropdownGroupId,
    } = this.state;

    const service_start = service_start_date || null;
    const service_end = service_end_date || null;
    const bulk_pricing_check = bulk_pricing;

    if (bulk_pricing_check && bulk_pricing != bulk_pricing_hold) {
      this.props.updateBulkCells(
        {
          columnId: dropdownColumnId,
          groupId: dropdownGroupId,
          key: 'amount',
          value: bulk_pricing_check,
        },
        'columns',
      );
    }
    // const bulk_data = [];

    this.props.setBulkColumnHeaders({
      column: dropDown,
      description,
      service_start_date: service_start,
      service_end_date: service_end,
      bulk_pricing: bulk_pricing_check,
      year: params.year,
    });

    this._dropDownClick();
    // this.props.showNotification(
    //   `You have successfully edited ${bulk_data.length} home(s).`,
    // );
  };

  toggleStatus = async (row, status) => {
    const { updateQueue } = this.state;

    const updateArr = [{ id: row.id, key: 'status', value: status }];

    await this.setState({
      updateQueue:
        updateQueue.length > 0
          ? [...updateQueue, ...updateArr]
          : [...updateArr],
    });

    this.executeUpdateQueue();
  };

  addToBulkStatusQueue = async (row, status) => {
    const { updateQueue, activeTab } = this.state;
    const { data } = this.props.active_properties;

    const { houseNum } = row;
    const houseRows = data.filter(
      row => row.houseNum === houseNum,
      // && row['Group.name'] === activeTab,
    );
    // Object.keys(data)
    //   .map(key => data[key].filter(row => row.houseNum === houseNum))
    //   .flat(1);

    const updateArr = houseRows.map(row => ({
      id: row.id,
      key: 'status',
      value: status,
    }));
    await this.setState({
      updateQueue:
        updateQueue.length > 0
          ? [...updateQueue, ...updateArr]
          : [...updateArr],
    });
  };

  _setStatusDate = (id, key, value) => {
    if (key === 'overallStatus') {
      if (value.toLowerCase() === 'published') {
        return {
          id,
          key: 'publishedDate',
          value: new moment().format('YYYY-MM-DD HH:mm:ss'),
        };
      }
      if (value.toLowerCase() === 'confirmed') {
        return {
          id,
          key: 'confirmedDate',
          value: new moment().format('YYYY-MM-DD HH:mm:ss'),
        };
      }
      if (value.toLowerCase() === 'draft') {
        return {
          id,
          key: 'publishedDate',
          value: null,
        };
      }
    }
    return null;
  };

  addToUpdateQueue = (id, key, value, houseNum) => {
    const { updateQueue, active_properties } = this.state;
    let tempCell = null;
    const tempActiveProps = active_properties.map(prop => {
      if (prop.houseNum === houseNum) {
        const cells = prop.cells.map(cell => {
          if (cell.id === id) {
            cell[key] = value;
            if (cell.status === 'declined' || cell.status === 'quote') {
              tempCell = cell;
            }
          }
          return cell;
        });
        prop.cells = cells;
      }

      return prop;
    });
    const statusDate = this._setStatusDate(id, key, value);

    const tempQueue = updateQueue;
    if (updateQueue.find(cell => cell.id === id && cell.key === key)) {
      const index = updateQueue.findIndex(cell => cell.id === id);
      tempQueue[index] = { id, key, value };
    } else {
      tempQueue.push({ id, key, value });
    }
    if (statusDate) {
      tempQueue.push(statusDate);
    }

    // If row was confirmed and cell was declined - propose new price and change its status
    if (key === 'amount' && tempCell) {
      const existInQ = tempQueue.find(
        cell => cell.id === tempCell.id && cell.value === 'draft',
      );

      if (!existInQ) {
        tempQueue.push({ id: tempCell.id, key: 'status', value: 'draft' });
      }
    }

    return this.setState({
      updateQueue: tempQueue,
      active_properties: tempActiveProps,
    });
  };

  executeUpdateQueue = () => {
    const { updateQueue, updateColumnQueue } = this.state;

    if (updateColumnQueue.length > 0) {
      this.props.updateBulkCells(updateColumnQueue, 'columns');
    }
    if (updateQueue.length > 0) {
      this.props.updateBulkCells(updateQueue, 'rows');
    }
    return this.setState({
      updateQueue: [],
      updateColumnQueue: [],
    });
  };

  _focusNextCellRow = (rowIndex, cellIndex) => {
    const { active_properties, activeTab } = this.state;
    let tempIndex = rowIndex;
    const propRows =
      active_properties.filter(item => item['Group.name'] === activeTab) || [];
    const nextRow = propRows[tempIndex];

    if (nextRow && nextRow.status !== 'draft') {
      tempIndex = null;
      for (let i = rowIndex; i < propRows.length; i++) {
        const row = propRows[i];

        if (row.status === 'draft') {
          tempIndex = i;
          break;
        }
      }
    }
    tempIndex &&
      this.setState({
        focusedCell: {
          rowIndex: tempIndex,
          cellIndex,
        },
      });
  };

  _renderRows = () => {
    const {
      activeTab,
      active_properties,
      ANNUAL_HEADERS,
      editSingleRow,
      isEditing,
      focusedCell,
    } = this.state;

    const header_order = (ANNUAL_HEADERS[activeTab] || []).map(
      item => item.key,
    );

    return (
      active_properties.filter(item => item['Group.name'] === activeTab) || []
    ).map((item, index) => {
      const passItems = header_order.map(
        header_item =>
          item.cells.find(t => t['Column.key'] === header_item) || {},
      );

      // Saved so we can re-enable if necessary but commented out to increase speed.
      // let matchingRows = Object.keys(data)
      //   .map(key =>
      //     data[key].filter(
      //       row =>
      //         row.houseNum === item.houseNum && activeTab !== row['Group.name'],
      //     ),
      //   )
      //   .flat(1);
      // let cellAmounts = matchingRows
      //   .map(row => row.cells)
      //   .flat(1)
      //   .map(cell => cell.amount);

      // let publishable = !cellAmounts.includes(null);

      return (
        <AmpRow
          key={index}
          rowIndex={index}
          columns={passItems}
          row={item}
          editSingleRow={editSingleRow}
          isEditing={isEditing}
          publishable
          toggleStatus={(rowId, status) => this.toggleStatus(rowId, status)}
          onChangeCell={(columnId, rowId, key, value, rowIndex) =>
            this.addColumnToUpdateQueue(columnId, rowId, key, value)
          }
          toggleSingleRow={this._toggleEditSingleRow}
          focusNextCellRow={cellIndex => {
            if (cellIndex === null) {
              return this.setState({
                focusedCell: null,
              });
            }
            this._focusNextCellRow(index + 1, cellIndex);
          }}
          focusedCell={
            focusedCell && focusedCell.rowIndex === index
              ? focusedCell.cellIndex
              : null
          }
        />
      );
    });
  };

  _toggleEditSingleRow = house_num => {
    this.setState(
      prevState => ({
        editSingleRow: prevState.editSingleRow === house_num ? null : house_num,
      }),
      () => {
        const { editSingleRow } = this.state;
        if (!editSingleRow) {
          this.executeUpdateQueue();
        } else {
          this.setState({
            updateQueue: [],
            updateColumnQueue: [],
          });
        }
      },
    );
  };

  togglePublishOwners = () => {
    const { isPublishOwnerOpen } = this.state;

    this.setState({
      isPublishOwnerOpen: !isPublishOwnerOpen,
      updateQueue: [],
    });
  };

  renderTableHeaders = () => {
    const { activeTab, dropDown, ANNUAL_HEADERS, isEditing } = this.state;
    let data_array = ANNUAL_HEADERS[activeTab] || [];

    if (isEditing) {
      data_array = data_array.length > 0 ? [...data_array] : [];
    } else {
      data_array =
        data_array.length > 0
          ? [
              ...data_array,
              {
                key: '',
                name: 'Status',
              },
            ]
          : [];
    }

    return data_array.map((item, index) => {
      const isClickable = data_array.length !== index + 1;
      return (
        <div key={index}>
          <p
            onClick={() => isClickable && this._dropDownClick(item)}
            className={item.name === 'Status' ? 'status' : ''}
          >
            {item.name}
            <span
              onClick={e => this._caretClick(e, item)}
              className="toggle-arrow"
            />
          </p>
          {dropDown && dropDown === item.key && this._renderDropdown()}
        </div>
      );
    });
  };

  _renderDropdown = () => {
    const {
      dropDown,
      description,
      service_start_date,
      service_end_date,
      bulk_pricing,
      current_service_height,
    } = this.state;

    const isSaveDisabled =
      service_end_date && service_start_date && description !== '';

    // if( current_service_height !== 200 ){
    //   this.setState({current_service_height: 200})
    // }

    const normalized_text = _.words(dropDown)
      .map(_.upperFirst)
      .join(' ');
    return (
      <div
        className="dropdown-edit"
        ref={ref => (this.outsideDropdownClickRef = ref)}
      >
        <div className="dropdown-edit_header">
          <h1>{normalized_text}</h1>
          <img src={closeGrey} onClick={this._dropDownClick} alt="" />
        </div>
        <div className="dropdown-edit_descrption">
          <p>Service Description</p>
          <textarea
            id="currentTextArea"
            ref="bulkTextarea"
            value={description}
            style={{ height: `${current_service_height}px` }}
            onChange={evt =>
              this.handleFieldChange('description', evt.target.value)
            }
            onKeyUp={evt => {
              const el = document.getElementById('currentTextArea');
              const height = el.clientHeight;
              const { scrollHeight } = el;
              const scrolling = scrollHeight > height;

              if (height < 200 && scrolling) {
                this.setState({ current_service_height: scrollHeight });
              } else if (current_service_height != 200 && scrolling) {
                this.setState({ current_service_height: 200 });
              }
            }}
          />
        </div>
        <div className="dropdown-edit_expected-range">
          <p>Service Expected Range</p>
          <input
            type="date"
            placeholder="From Date"
            value={service_start_date}
            min="2000-01-01"
            max="2100-01-01"
            onChange={evt =>
              this.handleFieldChange('service_start_date', evt.target.value)
            }
          />
          <p>To</p>
          <input
            type="date"
            placeholder="To Date"
            value={service_end_date}
            min={service_start_date}
            max="2100-01-01"
            onChange={evt =>
              this.handleFieldChange('service_end_date', evt.target.value)
            }
          />
        </div>
        <div className="dropdown-edit_bulk-range">
          <p>Bulk Pricing</p>
          <Switch
            checked={!!bulk_pricing}
            onToggle={() =>
              this.handleFieldChange('bulk_pricing', !bulk_pricing)
            }
          />
        </div>
        {bulk_pricing && (
          <div className="dropdown-edit_amount">
            <p className="dollar-sign">$</p>
            <input
              type="number"
              placeholder="300"
              value={bulk_pricing / 100}
              onChange={evt =>
                this.handleFieldChange('bulk_pricing', evt.target.value * 100)
              }
            />
          </div>
        )}
        <div className="dropdown-edit_footer">
          <p onClick={() => this._dropDownClick()}>Cancel</p>
          <button
            className={
              !isSaveDisabled ? 'org-border-btn-disabled' : 'org-border-btn'
            }
            disabled={!isSaveDisabled}
            onClick={this.onSaveTableColumnValues}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  savePlanHandler = async () => {
    await this.executeUpdateQueue();
    this.setCSSColumns(2);
    this.setState({
      isEditing: !this.state.isEditing,
    });
  };

  otherTabCheck = item => {
    const { data } = this.props.active_properties;
    const { activeTab } = this.state;

    const matchingRows = data
      .filter(
        row =>
          row.houseNum === item.houseNum &&
          row.status === 'draft' &&
          // activeTab !== row['Group.name'] &&
          row['Group.name'] !== 'Other',
      )
      .flat(1);

    const cellAmounts = matchingRows
      .map(row => row.cells)
      .flat(1)
      .map(cell => cell.amount);

    const rowStatus = matchingRows.map(row => row.status);
    return (
      !cellAmounts.includes(null) &&
      (rowStatus.includes('draft') || item.status === 'draft')
    );
  };

  togglePublishAllOwners = async () => {
    const { active_properties } = this.props;
    const active_props = active_properties.data || []; // .filter(item => item['Group.name'] === activeTab) || [];

    const cellList = [
      ...active_props.filter(
        e =>
          !e.cells.filter(col => !col.amount).length &&
          e.status === 'draft' &&
          this.otherTabCheck(e),
      ),
    ];

    for (let i = 0; i < cellList.length; i++) {
      await this.addToBulkStatusQueue(cellList[i], 'published');
    }

    this.executeUpdateQueue();

    this.setState({ loading: true });
    this.props.showNotification(
      `You have successfully published ${cellList.length} home(s).`,
    );
  };

  setCSSColumns = (num, stat) => {
    const { ANNUAL_HEADERS, activeTab } = this.state;
    if (stat === 'static') {
      this.setState({
        tableNum: 5 + num,
      });
    } else if (ANNUAL_HEADERS[activeTab]) {
      this.setState({
        tableNum: ANNUAL_HEADERS[activeTab].length + num,
      });
    }
  };

  handleScrollContainer = e => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      console.log('at bottom');
      // const offset =
      //   (this.state.active_properties.length || 1) /
      //   Object.keys(this.state.ANNUAL_HEADERS).length;
      // this.props.getActiveProperties(null, offset);
    }
  };

  render() {
    const {
      isShowing,
      isEditing,
      isPublishOwnerOpen,
      activeTab,
      tabIndex,
      tableNum,
      ANNUAL_HEADERS,
    } = this.state;
    const {
      match: { params },
      active_properties,
      notifications,
    } = this.props;

    if (!active_properties.data) {
      return <Loader />;
    }

    const propertyNum = (
      this.state.active_properties.filter(
        item => item['Group.name'] === activeTab,
      ) || []
    ).length;

    return (
      <div className="anual-plan-section p-t-8">
        <div className="wrapper">
          <div className="anual-plan-top">
            <div className="anual-plan-top_left">
              <Link to="/properties">
                <img src={backArrow} alt="" />
              </Link>
              <span className="vertical-line" />
              <h1>
                Annual Maintenance Plan
                {params.year}
              </h1>
            </div>
            <div className="anual-plan-top_right">
              <p
                className="orange-link"
                onClick={() => {
                  this.setState({
                    isEditing: !isEditing,
                    updateQueue: [],
                    updateColumnQueue: [],
                  });
                  this.setCSSColumns(isEditing ? 2 : 1);
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Plan'}
              </p>
              {!isEditing ? (
                <div
                  className="properties-top_drowdown"
                  onClick={this._handleClick}
                >
                  <p>Publish to Homeowner Portals</p>
                  <img src={down_arrow} alt="" />
                  {isShowing ? (
                    <div className="properties-top_drowdown_active">
                      <p onClick={this.togglePublishAllOwners}>
                        Publish to All
                      </p>
                      <p onClick={this.togglePublishOwners}>
                        Publish to Custom
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <button
                  className="orange-btn"
                  onClick={this.savePlanHandler}
                  style={{
                    marginLeft: '3rem',
                  }}
                >
                  Save Plan
                </button>
              )}
            </div>
          </div>

          <div className="anual-plan-bellow-top m-t-2">
            <div className="anual-plan-bellow-top_left">
              <Tabs
                selectedIndex={tabIndex}
                onSelect={tabIndex => {
                  const activeTab = Object.keys(ANNUAL_HEADERS)[tabIndex];
                  this.setState(
                    {
                      tabIndex,
                      activeTab,
                      isEditing: false,
                      updateQueue: [],
                      updateColumnQueue: [],
                    },
                    () => this.loadData(activeTab),
                  );
                }}
              >
                <TabList className="boder-radius-tabs">
                  <div className="tabs-wrapper">
                    {Object.keys(ANNUAL_HEADERS).map((item, index) => (
                      <Tab key={index}> {item} </Tab>
                    ))}
                  </div>
                </TabList>
              </Tabs>
              <div className="anual-plan-bellow-top_info">
                <div>
                  <p>N/A </p>
                  <p>- Not Applicable</p>
                </div>
                <div>
                  <p>Q</p>
                  <p>- Quote Required</p>
                </div>
              </div>
            </div>
            <div className="anual-plan-bellow-top_right">
              <p>
                Showing
                {` ${propertyNum}`} Active Properties
              </p>
            </div>
          </div>

          <div
            className="anual-tb"
            style={{
              '--tableNum': tableNum,
            }}
          >
            <div className="anual-tb_h">
              <p className="house-nmb">
                House #{' '}
                {/* <span className="toggle-arrow orange-arrow"></span> */}
              </p>
              {this.renderTableHeaders()}
              <p />
            </div>
            <div
              className="anual-tb_wrapper"
              onScroll={this.handleScrollContainer}
            >
              <div className="anual-tb_b">
                {active_properties.isFetching ? <Loader /> : this._renderRows()}
              </div>
            </div>
          </div>
        </div>
        {/* Publish To Custom Start */}

        <PublishOwnerSidebar
          active_properties={this.props.active_properties.data || []}
          isOpen={isPublishOwnerOpen}
          otherTabCheck={this.otherTabCheck}
          addToBulkStatusQueue={this.addToBulkStatusQueue}
          executeUpdateQueue={this.executeUpdateQueue}
          close={this.togglePublishOwners}
          propertyNum={propertyNum}
        />

        <Snackbar
          open={notifications.isOpen}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <SnackBarContent
            message={
              <span className="link-copy-success-text">
                {notifications.message}
              </span>
            }
            style={{ backgroundColor: 'rgb(40, 167, 69)', minWidth: '200px' }}
          />
        </Snackbar>
      </div>
    );
  }
}

const mapStateToProps = ({
  active_properties,
  bulk_columns,
  amp_groups_mapping,
  notifications,
}) => ({
  active_properties,
  bulk_columns,
  amp_groups_mapping,
  notifications,
});

export default connect(mapStateToProps, {
  getActiveProperties,
  updateBulkCells,
  setBulkColumnHeaders,
  getBulkColumnHeaders,
  getAmpGroupsMapping,
  showNotification,
})(AnnualPlan);
