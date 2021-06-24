import React from 'react';
import moment from 'moment';
import CONSTANTS from '../components/ScheduleTimeline/constants';
const Utils = {
  preloadImage: url => {
    const img = new Image();
    img.src = url;
  },
  renderStringListData: stringList =>
    stringList && stringList.length > 0
      ? stringList.split(',').map((item, index) => (
          <p key={index} className="s-p">
            {item}
          </p>
        ))
      : '/',
  updateQueryString(key, value, pathname) {
    if ('URLSearchParams' in window) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(key, value);
      const newRelativePathQuery = `${pathname}?${searchParams.toString()}`;
      return newRelativePathQuery;
    }
  },
  getSearchParam(key) {
    if ('URLSearchParams' in window) {
      const searchParams = new URLSearchParams(window.location.search);
      const value = searchParams.get(key);
      return value;
    }
  },
  sortDocsArray(docsArray) {
    return docsArray.sort((a, b) => a.contract_version > b.contract_version);
  },
  downloadAsFile(filename, mimetype, text) {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:${mimetype};charset=utf-8,${encodeURIComponent(text)}`,
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },
  containsAllOf(str, values) {
    const lower = str.toLowerCase();
    return values.reduce((prev, curr) => prev && lower.includes(curr), true);
  },
  containsAnyOf(str, values) {
    const lower = str.toLowerCase();
    return values.reduce((prev, curr) => prev || lower.includes(curr), false);
  },
  getRequestMethods: {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
  },
  getFullNameOrUsername: user => {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }

    return user.username;
  },
  parseDateToGrid: (startDate, endDate) => {
    const momentStartDate = new moment.utc(startDate);
    const momentEndDate = new moment.utc(endDate);

    function hourToGrid(hour, minutes) {
      const roundMins = Math.round(minutes / 15);
      const hourSpan = hour * 4;

      return hourSpan + roundMins + 1;
    }

    const gridStart = hourToGrid(
      momentStartDate.hour(),
      momentStartDate.minutes(),
    );
    let gridEnd = hourToGrid(momentEndDate.hour(), momentEndDate.minutes());
    gridEnd = gridEnd === gridStart ? gridEnd + 4 : gridEnd;

    return {
      timeStart: momentStartDate.format('MM/DD/YYYY'),
      timeEnd: momentEndDate.format('MM/DD/YYYY'),
      gridStart,
      gridEnd,
    };
  },
  parseSpansToTime: (gridStart, gridEnd, day) => {
    const startMinutes = (gridStart - 1) * 15;
    let endMinutes = (gridEnd - 1) * 15;
    if (gridEnd === CONSTANTS.NUM_COLS + 1) {
      // subtract 1sec so it can be set as 23:59 as last column
      endMinutes -= 0.1;
    }

    return {
      timeStart: new moment.utc(day)
        .startOf('day')
        .add(startMinutes, 'minutes'),
      timeEnd: new moment.utc(day).startOf('day').add(endMinutes, 'minutes'),
    };
  },
  parseTotalTime: (timeStart, timeEnd, unit) => {
    const start = moment(timeStart);
    const end = moment(timeEnd);
    return end.diff(start, unit);
  },
  numberWithCommas: x => {
    if (x <= 0) return;

    return (x / 100)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  merge: (a, b, key = 'id') =>
    a.filter(elem => !b.find(subElem => subElem[key] === elem[key])).concat(b),
  formatMoney: number =>
    number.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  convertTimeMsToString: timeMs => {
    if (!timeMs) return '';
    return moment(timeMs).format('YYYY-MM-DD');
  },
};

export default Utils;
