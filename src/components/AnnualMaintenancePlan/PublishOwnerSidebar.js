import React, { Component } from 'react';
import closeGrey from '../../assets/grey_icons/close-grey.svg';
import searchOrange from '../../assets/search-orange-v2.svg';

class PublishOwnerSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
      localUpdateQueue: [],
      active_properties: [],
    };
    this.outsidePublishClickRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);

    const active_props = this.props.active_properties || [];

    let { otherTabCheck } = this.props;
    this.setState(
      {
        active_properties: active_props.filter(
          row =>
            otherTabCheck(row) && !row.cells.filter(col => !col.amount).length,
        ),
      },
      () => {
        let { active_properties } = this.state;
        this.setState({
          properties_count: [...new Set(active_properties.map(h => h.houseNum))]
            .length,
        });
      },
    );
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.active_properties &&
      nextProps.active_properties !== this.props.active_properties
    ) {
      const active_props = nextProps.active_properties || [];
      const { otherTabCheck } = this.props;
      this.setState(
        {
          active_properties: active_props.filter(
            row =>
              otherTabCheck(row) &&
              !row.cells.filter(col => !col.amount).length,
          ),
          properties_count: [...new Set(active_props.map(h => h.houseNum))]
            .length,
        },
        () => {
          let { active_properties } = this.state;
          this.setState({
            properties_count: [
              ...new Set(active_properties.map(h => h.houseNum)),
            ].length,
          });
        },
      );
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = event => {
    if (
      this.outsidePublishClickRef &&
      !this.outsidePublishClickRef.contains(event.target) &&
      this.props.isOpen
    ) {
      this.localClose();
    }
  };

  searchHandler = e => {
    const { value } = e.target;
    const unPoundValue = value.replace('#', '');
    this.setState({ searchString: unPoundValue });
  };

  localClose = () => {
    this.setState({ localUpdateQueue: [] });
    this.props.close();
  };

  filterBySearch = r => {
    const { searchString } = this.state;
    const matches = val => {
      if (val) {
        return val.toLowerCase().indexOf(searchString.toLowerCase()) !== -1;
      }
      return false;
    };

    const houseNum = r.houseNum.toString();
    const firstName = r.firstName || '';
    const lastName = r.lastName || '';
    const matchedAccount =
      matches(houseNum) || matches(firstName) || matches(lastName);

    return matchedAccount;
  };

  rowCheckHandler = e => {
    const data = this.props.active_properties;
    const { localUpdateQueue } = this.state;
    let temp_data = [];

    const row = data.find(item => item.id === e.id);

    if (localUpdateQueue.indexOf(row) !== -1) {
      temp_data = localUpdateQueue.filter(item => item.id !== row.id);
    } else {
      temp_data = [...localUpdateQueue, row];
    }

    this.setState({ localUpdateQueue: temp_data });
  };

  allRowCheckHandler = e => {
    const { localUpdateQueue, active_properties } = this.state;
    if (localUpdateQueue.length === active_properties.length) {
      return this.setState({ localUpdateQueue: [] });
    } else {
      return this.setState({
        localUpdateQueue: [...active_properties],
      });
    }
    return this.setState({
      localUpdateQueue: [...active_properties.map(row => row.id)],
    });
  };

  sortByHomeowner = e => {
    const { active_properties } = this.state;
    const temp_active_properties = active_properties;

    const sortedAP = [...temp_active_properties].sort((a, b) =>
      a.lastName > b.lastName ? 1 : -1,
    );

    this.setState({ active_properties: sortedAP });
  };

  sortByHousenumber = e => {
    const { active_properties } = this.state;
    const temp_active_properties = active_properties;

    const sortedAP = [...temp_active_properties].sort((a, b) =>
      a.houseNum > b.houseNum ? 1 : -1,
    );

    this.setState({ active_properties: sortedAP });
  };

  executeChanges = async e => {
    const { localUpdateQueue } = this.state;
    const { addToBulkStatusQueue, executeUpdateQueue } = this.props;

    for (let j = 0; j < localUpdateQueue.length; j++) {
      await addToBulkStatusQueue(localUpdateQueue[j], 'published');
    }
    executeUpdateQueue();
    this.setState({ localUpdateQueue: [] }, this.localClose);
  };

  _renderSidebarRows = () => {
    const data = this.state.active_properties;
    // this.props.active_properties || [];
    let { otherTabCheck } = this.props;
    let filteredData = data.filter(this.filterBySearch);
    let dataWithDuplicates = filteredData.filter(
      item =>
        !item.cells.filter(col => !col.amount).length &&
        otherTabCheck(item) &&
        item.status === 'draft' &&
        item.houseNum,
    );

    let reducedData = Object.values(
      filteredData.reduce((c, e) => {
        if (!c[e.houseNum]) c[e.houseNum] = e;
        return c;
      }, {}),
    );

    return reducedData.map((item, index) =>
      this._renderStandardRow(item, index),
    );
  };

  _renderStandardRow = (item, index) => {
    const { localUpdateQueue } = this.state;
    return (
      <div key={index} className="ptc_table_body_inner">
        <div className="ptc_table_body_inner_left">
          <input
            key={item.houseNum}
            className="styled-checkbox"
            type="checkbox"
            onClick={() => this.rowCheckHandler(item)}
            onChange={() => {}}
            checked={localUpdateQueue.indexOf(item) !== -1}
          />
          <label onClick={() => this.rowCheckHandler(item)}></label>

          <h1 className="homeowner-name">
            {item.firstName} {', '} {item.lastName}
          </h1>
        </div>
        <div className="ptc_table_body_inner_right">
          <h1 className="homeowner-name">#{item.houseNum}</h1>
        </div>
      </div>
    );
  };

  render() {
    const { isOpen } = this.props;
    const {
      localUpdateQueue,
      active_properties,
      properties_count,
    } = this.state;
    const updateLength = [...new Set(localUpdateQueue.map(h => h.houseNum))]
      .length;
    const allChecked = updateLength === properties_count;

    return (
      <div
        className={`ptc ${isOpen ? 'slide-in' : ''}`}
        ref={ref => (this.outsidePublishClickRef = ref)}
      >
        <div className="ptc_wrapper">
          <div className="ptc_top-content">
            <div className="ptc_header">
              <h1>Publish to Custom Homeowners</h1>
              <img src={closeGrey} onClick={this.localClose} alt="" />
            </div>
            <div className="ptc_search">
              <div className="ptc_search_wrapper">
                <input
                  type="search"
                  className="search-input"
                  onChange={this.searchHandler}
                  placeholder="Search by house number, homeowner"
                />
                <img src={searchOrange} alt="" />
              </div>

              <p>
                {updateLength} of
                {' ' + properties_count} selected
              </p>
            </div>

            <div className="ptc_table">
              <div className="ptc_table_header">
                <div className="ptc_table_header_left">
                  <input
                    className="styled-checkbox"
                    id="styled-checkbox-1"
                    type="checkbox"
                    onClick={this.allRowCheckHandler}
                    onChange={() => {}}
                    checked={allChecked}
                  />
                  <label htmlFor="styled-checkbox-1" />

                  <h1 onClick={this.sortByHomeowner} className="homeowner-name">
                    Homeowner Name
                    <div className="ptc_arrow">
                      <span className="toggle-arrow orange-arrow" />
                    </div>
                  </h1>
                </div>
                <div className="ptc_table_header_right">
                  <h1
                    onClick={this.sortByHousenumber}
                    className="homeowner-name"
                  >
                    House number
                    <div className="ptc_arrow">
                      <span className="toggle-arrow orange-arrow" />
                    </div>
                  </h1>
                </div>
              </div>
              <div className="ptc_table_body">{this._renderSidebarRows()}</div>
            </div>
          </div>
          <div className="ptc_bottom-content">
            <div className="ptc_footer">
              <button className="epmpty-btn" onClick={this.localClose}>
                Cancel
              </button>
              <button onClick={this.executeChanges} className="org-border-btn">
                Publish to {updateLength} Homeowner Portals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PublishOwnerSidebar;
