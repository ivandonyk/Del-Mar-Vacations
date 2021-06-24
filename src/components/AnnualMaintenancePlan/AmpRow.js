import React, { Component } from 'react';
import moment from 'moment';
import { Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import penOrange from '../../assets/pen-orange.svg';
import penGrey from '../../assets/pen-grey.svg';
import messageGrey from '../../assets/message-grey.svg';
import greenCheckmark from '../../assets/checkmark-green.svg';
import xGrey from '../../assets/x-grey.svg';
import Utils from '../../helpers/utils';

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#ffff',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 226,
    fontSize: theme.typography.pxToRem(15),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

class AmpRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cache: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.focusedCell !== null &&
      nextProps.focusedCell !== this.props.focusedCell
    ) {
      if (this.refs) {
        const key = Object.keys(this.refs)[nextProps.focusedCell];
        if (key) {
          this.refs[key].focus();
          this.props.focusNextCellRow(null);
        }
      }
    }
  }

  componentWillUnmount() {
    this.props.focusNextCellRow(null);
  }

  _getFieldsByTab = rowItems =>
    rowItems.map(item => ({
      id: item.id,
      key: item['Column.key'],
      value:
        item.amount !== null && !isNaN(item.amount) && item.amount > 0
          ? Utils.numberWithCommas(item.amount)
          : item.amount,
      status: item.status,
      // && item.amount > 0 ? item.amount / 100 || '0.00',
    }));

  handleChange = (columnId, key, value, houseNum, rowId) => {
    const { rowIndex } = this.props;
    let centConversion = value; //* 100;
    if (!isNaN(value) && value > 0) centConversion *= 100;
    this.props.onChangeCell(
      columnId,
      rowId,
      'amount',
      centConversion,
      rowIndex,
    );
  };

  // Draft  Start
  _renderViewDraftRow = (row, columns) => {
    const { isEditing, publishable } = this.props;
    const rowAmounts = columns.map(c => c.value);
    const validCheck = !rowAmounts.includes(null);

    return (
      <div key={row.houseNum} className="anual-tb_b_inner ">
        <div className="anual-tb_b_house-nm" name={`row-${row.houseNum}`}>
          <p>#{row.houseNum}</p>
        </div>

        {this._renderColumns(columns, row)}

        {!isEditing ? (
          <div className="anual-tb_b_status">
            <p className="draft">draft</p>
          </div>
        ) : (
          ''
        )}
        {validCheck && publishable ? (
          <div
            className="anual-tb_b_actions"
            onClick={() =>
              !columns.filter(col => !col.value).length &&
              this.props.toggleStatus(row, 'published')
            }
          >
            <p className="publish">Publish</p>
          </div>
        ) : (
          <div>
            <p className="disabled-publish">Publish</p>
          </div>
        )}
      </div>
    );
  };
  // Draft  End

  // Confirmed  Start
  _renderViewConfirmedRow = (row, columns) => {
    const { editSingleRow, toggleSingleRow, isEditing } = this.props;

    return (
      <div key={row.houseNum} className="anual-tb_b_inner confirmed-row ">
        <div className="anual-tb_b_house-nm" name={`row-${row.houseNum}`}>
          <p>#{row.houseNum}</p>
        </div>

        {editSingleRow === row.houseNum ? (
          this._renderColumns(columns, row)
        ) : (
          <React.Fragment>
            {row.cells.map((item, index) => {
              const formattedAmount =
                item.amount !== null && !isNaN(item.amount) && item.amount >= 0
                  ? Utils.numberWithCommas(item.amount)
                  : item.amount === null
                  ? 0
                  : item.amount >= 0
                  ? `$${item.amount}`
                  : this.qOrNa(item.amount);

              if (item.status === 'confirmed') {
                return (
                  <div key={index} className="anual-tb_b price-checked">
                    <p className="confirmed-cell-inner">{formattedAmount}</p>
                    <img src={greenCheckmark} />
                  </div>
                );
              }
              if (item.status === 'declined' || item.status === 'rejected') {
                return (
                  <div key={index} className="anual-tb_b price-x">
                    <p className="confirmed-cell-inner">{formattedAmount}</p>
                    <img src={xGrey} />
                  </div>
                );
              }
              if (
                item.status === 'quote' ||
                item.amount === -1 ||
                item.amount === -100
              ) {
                return (
                  <div key={index} className="anual-tb_b quote-cell">
                    {item.comment && (
                      <HtmlTooltip
                        title={
                          <React.Fragment>
                            <h2>Homeowner Note</h2>
                            <p>{item.comment}</p>
                          </React.Fragment>
                        }
                        interactive
                      >
                        <img src={messageGrey} />
                      </HtmlTooltip>
                    )}
                    <p>Quote</p>
                    <img src={greenCheckmark} />
                  </div>
                );
              }
              return (
                <div
                  key={index}
                  className="anual-tb_b price-checked"
                  style={{
                    color: '#5f7a9f',
                  }}
                >
                  <p className="dollar-sign">$</p>
                  <p>{formattedAmount}</p>
                </div>
              );
            })}
          </React.Fragment>
        )}

        {!isEditing ? (
          <div className="anual-tb_b_status">
            <p className="published">Confirmed</p>
            <span className="date">
              {new moment(row.statusDate || new Date()).format('MMM DD, YYYY')}
            </span>
          </div>
        ) : (
          ''
        )}

        <div
          className="anual-tb_b_actions"
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
          }}
        >
          {editSingleRow && editSingleRow === row.houseNum ? (
            <React.Fragment>
              <img src={xGrey} onClick={() => toggleSingleRow()} />
              <img
                src={greenCheckmark}
                onClick={() => toggleSingleRow(row.houseNum)}
              />
            </React.Fragment>
          ) : row.status === 'confirmed' ? (
            <img
              src={penOrange}
              onClick={() => toggleSingleRow(row.houseNum)}
            />
          ) : (
            <img src={penGrey} />
          )}
        </div>
      </div>
    );
  };
  // Confirmed  End

  // Published  Start
  _renderViewPublishedRow = (row, columns) => {
    const { isEditing } = this.props;

    return (
      <div key={row.houseNum} className="anual-tb_b_inner ">
        <div className="anual-tb_b_house-nm" name={`row-${row.houseNum}`}>
          <p>#{row.houseNum}</p>
        </div>

        {this._renderColumns(columns, row)}

        {!isEditing ? (
          <div className="anual-tb_b_status">
            <p className="published">Published</p>
            <span className="date">
              {new moment(
                row.statusDate ? row.statusDate : '0000-01-01T00:00:00',
              ).format('MMM DD, YYYY')}
            </span>
          </div>
        ) : (
          ''
        )}
        <div
          className="anual-tb_b_actions"
          onClick={() => this.props.toggleStatus(row, 'draft')}
        >
          <p className="publish">Unpublish</p>
        </div>
      </div>
    );
  };
  // Published  End

  setCellQ = (key, cKey, houseNum, rowId) => {
    this.handleChange(key, cKey, -1, houseNum, rowId);
  };

  setCellNA = (key, cKey, houseNum, rowId) => {
    this.handleChange(key, cKey, -2, houseNum, rowId);
  };

  qOrNa = check => {
    if (check === -1 || check === -100) {
      return 'Q';
    }
    if (check === -2 || check === -200) {
      return 'N/A';
    }
    return check;

    //
  };

  keyDownHandler = (evt, key, column, houseNum, rowId, index) => {
    const { editSingleRow } = this.props;

    const confirmedCheck = editSingleRow === houseNum;

    switch (evt.key) {
      case 'Enter':
        this.props.focusNextCellRow(index);
        break;
      case 'Tab':
        break;
      case 'Q':
        if (confirmedCheck) {
          break;
        }
        this.setCellQ(key, column.key, houseNum, rowId);
        break;
      case 'q':
        if (confirmedCheck) {
          break;
        }
        this.setCellQ(key, column.key, houseNum, rowId);
        break;
      case 'N':
        if (confirmedCheck) {
          break;
        }
        this.setCellNA(key, column.key, houseNum, rowId);
        break;
      case 'n':
        if (confirmedCheck) {
          break;
        }
        this.setCellNA(key, column.key, houseNum, rowId);
        break;
      case '/':
        if (confirmedCheck) {
          break;
        }
        this.setCellNA(key, column.key, houseNum, rowId);
        break;
      case 'A':
        if (confirmedCheck) {
          break;
        }
        this.setCellNA(key, column.key, houseNum, rowId);
        break;
      case 'a':
        if (confirmedCheck) {
          break;
        }
        this.setCellNA(key, column.key, houseNum, rowId);
        break;
      default:
        if (
          !Number.isInteger(Number(evt.key)) &&
          evt.key !== '.' &&
          evt.key !== 'Backspace'
        ) {
          evt.preventDefault();
          evt.stopPropagation();
          break;
        }
    }
  };

  _renderColumns = (columns, row) => {
    const { isEditing, editSingleRow, focusedCell } = this.props;

    const { houseNum } = row;
    return columns.map((column, index) => {
      const overallStatus = row.status;
      const key = column.id;
      const { value } = column;
      const rowId = row.id;
      const columnStatus = column.status;

      switch (overallStatus) {
        case 'draft':
          return isEditing ? (
            <div key={index} className="anual-tb_b">
              <p className="dollar-sign">$</p>
              <input
                ref={key}
                name={key}
                // type="number"
                defaultValue={value < 0 ? this.qOrNa(value) : value}
                onKeyDown={evt => {
                  this.keyDownHandler(evt, key, column, houseNum, rowId, index);
                }}
                autoFocus={focusedCell === index}
                onChange={evt => {
                  if (Number.isInteger(Number(evt.target.value * 100))) {
                    this.handleChange(
                      key,
                      column.key,
                      evt.target.value,
                      houseNum,
                      rowId,
                    );
                  }
                }}
              />
            </div>
          ) : (
            <div key={index} className="anual-tb_b">
              {value < 0 ? (
                <React.Fragment>
                  <p className="dollar-sign">$</p>
                  <p>{this.qOrNa(value)}</p>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <p className="dollar-sign">$</p>

                  <p>{value || ''}</p>
                </React.Fragment>
              )}
            </div>
          );
        case 'published':
          return (
            <div key={index} className="anual-tb_b">
              <React.Fragment>
                <p className="dollar-sign">$</p>
                <p>{value < 0 ? this.qOrNa(value) : `${value || ''}`}</p>
              </React.Fragment>
            </div>
          );
        case 'confirmed':
          return editSingleRow ? (
            <div key={index} className="anual-tb_b">
              {columnStatus === 'confirmed' ? (
                <img src={greenCheckmark} />
              ) : (
                <img src={xGrey} />
              )}
              <input
                name={column.key}
                // value={value}
                defaultValue={value < 0 ? this.qOrNa(value) : value}
                // type="number"
                onKeyDown={evt => {
                  this.keyDownHandler(evt, key, column, houseNum, rowId, index);
                }}
                // autoFocus={focusedCell === index ? true : false}
                onChange={evt => {
                  this.handleChange(
                    key,
                    column.key,
                    evt.target.value,
                    houseNum,
                    rowId,
                  );
                  // this.toggleColumnStatus(houseNum, 'draft', column.id);
                }}
                style={
                  columnStatus === 'confirmed'
                    ? {
                        color: '#5F7A9F',
                      }
                    : null
                }
                disabled={
                  columnStatus === 'confirmed' || columnStatus === 'draft'
                }
              />
            </div>
          ) : (
            <div key={index} className="anual-tb_b price-cheked">
              <img src={greenCheckmark} />
              <p>${value}</p>
            </div>
          );
      }
    });
  };

  render() {
    const { columns, row, focusedCell } = this.props;

    if (columns.length > 0) {
      const altered_columns = this._getFieldsByTab(columns);
      switch (row.status) {
        case 'draft':
          return this._renderViewDraftRow(row, altered_columns);
        case 'published':
          return this._renderViewPublishedRow(row, altered_columns);
        case 'confirmed':
          return this._renderViewConfirmedRow(row, altered_columns);
      }
    }
    return null;
  }
}

export default AmpRow;
