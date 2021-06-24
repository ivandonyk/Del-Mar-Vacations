import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import fields from './field_meta';

const SEARCH_LAYER_ADDRESS = 'SEARCH_LAYER_ADDRESS';
const SEARCH_LAYER_FIELD = 'SEARCH_LAYER_FIELD';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      isOpen: false,
      layer: SEARCH_LAYER_ADDRESS,
      selectedListing: null,
      navigationIndex: 0,
    };
    this.searchData = null;
  }

  componentDidMount() {
    this.props.history.listen(() => {
      this.setState({
        searchTerm: '',
        layer: SEARCH_LAYER_ADDRESS,
      });
    });
  }

  _changeNavIndex = navigationIndex => {
    this.setState({
      navigationIndex,
    });
  };

  _renderAddressDropdownList = (listings, searchTerm) => {
    const searchData = listings.filter(listing =>
      this._isAddressSearchValid(listing, searchTerm),
    );

    this.searchData = searchData;

    // If no data is found in the listings try to search for fields in current property
    if (!searchData || searchData.length === 0) {
      const { activeListing } = this.props;
      let searchFields = [...document.querySelectorAll('h1[name], p[name]')];
      searchFields = searchFields.filter(
        el => el.innerText.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1,
      );

      if (searchFields && activeListing.fetched && activeListing.data) {
        const { id } = activeListing.data;
        const listing = listings.find(item => item.property_id === id);

        if (!listing) return null;

        const { homeowner_id, property_id } = listing;

        const { navigationIndex } = this.state;
        this.searchData = searchFields;

        return (
          <ul className="search-list">
            {searchFields.map((item, index) => {
              const field_name = item.getAttribute('name');
              const active = navigationIndex === index;
              return (
                <li
                  className={active ? 'active' : ''}
                  onMouseOver={() => this._changeNavIndex(index)}
                  key={index}
                >
                  <Link
                    to={{
                      pathname: `/property/${homeowner_id}/address/${property_id}/field/${field_name}`,
                      state: {
                        field: field_name,
                      },
                    }}
                  >
                    <p className="delmar-red bold">{item.innerText}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        );
      }

      return null;
    }

    this.searchData = searchData;
    const { navigationIndex } = this.state;

    return (
      <ul className="search-list">
        {searchData.map((item, index) => {
          const {
            firstname,
            lastname,
            property_address,
            house_num,
            homeowner_id,
            property_id,
          } = item;
          const { house_name = '' } = property_address;
          const fullName = `${firstname} ${lastname}`;
          const active = navigationIndex === index;
          return (
            <li
              className={active ? 'active' : ''}
              onMouseOver={() => this._changeNavIndex(index)}
              key={index}
            >
              <Link to={`/property/${homeowner_id}/address/${property_id}`}>
                <p className="delmar-red bold">
                  #{house_num} {house_name}
                </p>
                <p>{fullName}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  _convertDataTypeToHumanReadableExample = dataType => {
    switch (dataType) {
      case 'boolean':
        return '"Yes" or "No"';
      case 'multi':
        return 'Alpha, Bravo, Charlie';
      case 'number':
        return '10';
      case 'datetime':
      case 'date':
        return '10/11/2019';
      default:
        return 'The property has 10 windows and 3 doors';
    }
  };

  _renderFieldDropdownList = (fields, searchTerm) => {
    const { selectedListing } = this.state;

    const searchData = fields.filter(field =>
      this._isFieldSearchValid(field, searchTerm),
    );

    this.searchData = searchData;

    if (!searchData || searchData.length === 0) return null;

    const { navigationIndex } = this.state;

    return (
      <ul className="search-list field-search-list">
        <li>
          <p className="delmar-red bold field-search-title">Field Name</p>
        </li>
        {searchData.map((item, index) => {
          const { column_name, display_name, data_type } = item;

          const { homeowner_id, property_id } = selectedListing;
          const active = navigationIndex === index;

          return (
            <li
              key={index}
              onMouseOver={() => this._changeNavIndex(index)}
              className={active ? 'active' : ''}
            >
              <Link
                to={`/property/${homeowner_id}/address/${property_id}/field/${column_name}`}
              >
                <p>{display_name}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  renderDropdownList = () => {
    let { layer, searchTerm } = this.state;
    const { listings } = this.props;

    switch (layer) {
      case SEARCH_LAYER_ADDRESS:
        return this._renderAddressDropdownList(listings, searchTerm);
      case SEARCH_LAYER_FIELD:
        const cutPattern = /#[0-9]{3}'s Associated Info \| /;
        searchTerm = searchTerm.replace(cutPattern, '');
        return this._renderFieldDropdownList(fields, searchTerm);
    }
  };

  _isFieldSearchValid = (field, searchTerm) =>
    field.display_name &&
    field.display_name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;

  _isAddressSearchValid = (listing, searchTerm) => {
    if (!listing.house_num) return false;

    if (searchTerm.startsWith('#')) {
      // Search for house_num
      return listing.house_num.indexOf(searchTerm.substring(1)) > -1;
    }
    if (searchTerm !== '') {
      searchTerm = searchTerm.toLowerCase();
      const {
        addressline1,
        city,
        home_zip = '',
        firstname,
        lastname,
        property_address,
        EMAIL,
        PHONE,
      } = listing;
      const zip = home_zip && home_zip !== null ? `, ${home_zip}` : '';
      const full_address = `${addressline1}, ${city}${zip}`.toLowerCase();
      const full_name = `${firstname} ${lastname}`.toLowerCase();
      const emails = EMAIL.reduce(
        (prev, cur) => (prev + cur).toLowerCase(),
        [],
      );
      const phones = PHONE.reduce(
        (prev, cur) => (prev + cur).toLowerCase(),
        [],
      );
      const { house_name = '' } = property_address;

      return (
        (full_address && full_address.indexOf(searchTerm) > -1) ||
        (house_name && house_name.toLowerCase().indexOf(searchTerm) > -1) ||
        (full_name && full_name.indexOf(searchTerm) > -1) ||
        (emails && emails.indexOf(searchTerm) > -1) ||
        (phones && phones.indexOf(searchTerm) > -1)
      );
    }
    return true;
  };

  _correctSelectedBoundaries = () => {
    const active = document.querySelector(
      '#nav-search-wrapper .search-list .active',
    );
    const searchList = document.querySelector(
      '#nav-search-wrapper .search-list',
    );
    const searchListRect = searchList.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();

    if (
      itemRect.bottom > searchListRect.bottom ||
      itemRect.top < searchListRect.top
    ) {
      active.scrollIntoView(false);
    }
  };

  _handleKey = event => {
    const input = event.target;
    const { listings } = this.props;
    const { navigationIndex, layer } = this.state;
    if (event.keyCode === 9) {
      const match = input.value.match(/^#[0-9]{3}$/);
      if (match) {
        event.preventDefault();
        this.setState({
          searchTerm: `${match[0]}'s Associated Info | `,
          layer: SEARCH_LAYER_FIELD,
          selectedListing: listings.find(
            l => l.house_num === match[0].replace('#', ''),
          ),
        });
      } else if (
        this.searchData &&
        this.searchData.length > 0 &&
        layer === SEARCH_LAYER_ADDRESS
      ) {
        event.preventDefault();
        this.setState({
          searchTerm: `#${this.searchData[navigationIndex].house_num}'s Associated Info | `,
          layer: SEARCH_LAYER_FIELD,
          selectedListing: this.searchData[navigationIndex],
        });
      }
    } else if (event.keyCode === 13) {
      if (this.searchData && this.searchData.length > 0) {
        const item = this.searchData[navigationIndex];
        if (layer === SEARCH_LAYER_ADDRESS && input.value.match(/^#.*$/)) {
          const { homeowner_id, property_id } = item;
          this.props.history.push(
            `/property/${homeowner_id}/address/${property_id}`,
          );
        } else if (layer === SEARCH_LAYER_FIELD) {
          const { selectedListing } = this.state;
          const { homeowner_id, property_id } = selectedListing;
          const { column_name } = item;
          this.props.history.push(
            `/property/${homeowner_id}/address/${property_id}/field/${column_name}`,
          );
        } else {
          const { activeListing } = this.props;
          const { id } = activeListing.data;
          const { homeowner_id, property_id } = listings.find(
            item => item.property_id === id,
          );
          const field_name = this.searchData[navigationIndex].getAttribute(
            'name',
          );
          this.props.history.push(
            `/property/${homeowner_id}/address/${property_id}/field/${field_name}`,
          );
        }
      }
    } else if (event.keyCode === 8) {
      const everythingSelected =
        input.selectionStart == 0 && input.selectionEnd == input.value.length;
      if (
        input.value.match(/^#[0-9]{3}'s Associated Info \| $/) ||
        everythingSelected
      ) {
        this.setState({
          searchTerm: '',
          layer: SEARCH_LAYER_ADDRESS,
        });
      }
    } else if (event.keyCode === 37) {
      if (input.value.match(/^#[0-9]{3}'s Associated Info \| $/)) {
        event.preventDefault();
      }
    } else if (event.keyCode === 40) {
      event.preventDefault();
      const { navigationIndex } = this.state;
      const newIndex =
        navigationIndex + 1 > this.searchData.length - 1
          ? this.searchData.length - 1
          : navigationIndex + 1;
      this.setState({ navigationIndex: newIndex }, () => {
        this._correctSelectedBoundaries();
      });
    } else if (event.keyCode === 38) {
      event.preventDefault();
      const { navigationIndex } = this.state;
      const newIndex = navigationIndex - 1 < 0 ? 0 : navigationIndex - 1;
      this.setState({ navigationIndex: newIndex }, () => {
        this._correctSelectedBoundaries();
      });
    }
  };

  render() {
    const { searchTerm, isOpen, layer } = this.state;
    const { className, hideIcon } = this.props;
    const isSearchingField = layer === SEARCH_LAYER_FIELD;

    return (
      <div
        id="nav-search-wrapper"
        className={`search-wrapper${className ? ` ${className}` : ''}`}
      >
        <div className="search-bar">
          <input
            onBlur={() =>
              setTimeout(() => this.setState({ isOpen: false }), 300)
            }
            onFocus={() => this.setState({ isOpen: true })}
            placeholder="Search something..."
            type="text"
            value={searchTerm}
            onKeyDown={this._handleKey}
            onChange={evt =>
              this.setState({
                searchTerm: evt.target.value,
              })
            }
            className={isSearchingField ? 'search-field' : null}
          />
          {!hideIcon && (
            <SearchIcon
              className="search-icon"
              // onClick={this.toggleSearch}
            />
          )}
        </div>

        {isOpen && searchTerm !== '' && this.props.listings
          ? this.renderDropdownList()
          : null}
      </div>
    );
  }
}

const SearchRouter = withRouter(Search);

const mapStateToProps = ({ activeListing }) => ({ activeListing });

export default connect(mapStateToProps, null)(SearchRouter);
