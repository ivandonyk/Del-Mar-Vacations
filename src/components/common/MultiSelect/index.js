import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import DownArrow from '../../../assets/arrow-down.svg';
import './style.scss';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      background: 'white',
    },
  },
};

function getStyles(value, list, theme) {
  return {
    fontWeight:
      list && list.length
        ? list.filter(item => item.key !== value).length
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
        : theme.typography.fontWeightMedium,
  };
}

const MultiSelectDropDown = props => (
  <img className="multi_select_down_arrow" src={DownArrow} />
);

class MultiSelect extends React.Component {
  state = {
    selected: [],
  };

  componentDidMount() {
    this.setState({ selected: this.props.selected });
  }

  handleChange = event => {
    this.setState({ selected: event.target.value });
    this.props.handleChange(event.target.value);
    console.log('selected', event.target.value);
  };

  render() {
    const { classes, theme } = this.props;

    return (
      <Select
        style={{ flex: 1, background: 'white' }}
        disableUnderline
        multiple
        disabled={this.props.unEditable}
        IconComponent={MultiSelectDropDown}
        value={this.state.selected}
        onChange={this.handleChange}
        input={<Input id="select-multiple-chip" />}
        renderValue={selected => (
          <div className={classes.chips}>
            {selected.map(key => {
              const selectedItems = this.props.list.filter(
                item => item.key === key,
              );
              if (selectedItems.length === 0) {
                return null;
              }
              const selectedItem = selectedItems[0];
              return (
                <Chip
                  key={key}
                  label={selectedItem.name}
                  className={classes.chip}
                  size="medium"
                />
              );
            })}
          </div>
        )}
        MenuProps={MenuProps}
      >
        {this.props.list &&
          this.props.list.map(({ name, key }) => (
            <MenuItem key={key} value={key}>
              {name}
            </MenuItem>
          ))}
      </Select>
    );
  }
}

MultiSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MultiSelect);
