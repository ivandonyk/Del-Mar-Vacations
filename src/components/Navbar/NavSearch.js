import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { connect } from 'react-redux';
import fields from './field_meta';
import axios from 'axios';
import _ from 'lodash';
import API_ENDPOINTS from '../../helpers/api_endpoints';
import { BASE_DRM_URL } from '../../constants';

const SEARCH_LAYER_CONTACTS = 'SEARCH_LAYER_CONTACTS';
const SEARCH_LAYER_FIELD = 'SEARCH_LAYER_FIELD';
const SEARCH_LAYER_ADDRESS = 'SEARCH_LAYER_ADDRESS';

const DRM_REMAKE_URL = '/drm-remake';
const BASE_URL_DRM_REMAKE = BASE_DRM_URL + DRM_REMAKE_URL;

class NavSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      isOpen: false,
      layer: SEARCH_LAYER_CONTACTS,
      selectedListing: null,
      navigationIndex: 0,
      searchResults: [],
    };
    this.searchData = null;
    this.searchTimeout = null;
    this.input = React.createRef();
    this.tempNavIndex = 0;
  }

  componentDidMount() {
    this.props.history.listen(() => {
      this.setState({
        searchTerm: '',
        layer: SEARCH_LAYER_CONTACTS,
      });
    });
  }

  _changeNavIndex = navigationIndex => {
    this.setState({
      navigationIndex,
    });
  };

  _searchSort(results, resultType) {
    const query = this.state.searchTerm;
    const sortLogic = (first, second, recurse) => {
      if (first && second) {
        if (recurse) {
          return recurse;
        }
        return 0;
      }
      if (first && !second) {
        return -1;
      }
      if (second && !first) {
        return 1;
      }
      if (recurse) {
        return recurse;
      }
      return 0;
    };

    return results.sort((a, b) => {
      if (resultType == 'homeowner-leads') {
        const aOwner_firstnamesStartsWith = a.firstname
          ? a.firstname
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const bOwner_firstnamesStartsWith = b.firstname
          ? b.firstname
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const aOwner_lastnamesStartsWith = a.lastname
          ? a.lastname
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const bOwner_lastnamesStartsWith = b.lastname
          ? b.lastname
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const aOwner_emailsStartsWith = a.owner_emails
          ? a.owner_emails
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const bOwner_emailsStartsWith = b.owner_emails
          ? b.owner_emails
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const aOwner_phonesStartsWith = a.owner_phones
          ? a.owner_phones
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const bOwner_phonesStartsWith = b.owner_phones
          ? b.owner_phones
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;

        return sortLogic(
          aOwner_firstnamesStartsWith,
          bOwner_firstnamesStartsWith,
          sortLogic(
            aOwner_lastnamesStartsWith,
            bOwner_lastnamesStartsWith,
            sortLogic(
              aOwner_emailsStartsWith,
              bOwner_emailsStartsWith,
              sortLogic(aOwner_phonesStartsWith, bOwner_phonesStartsWith),
            ),
          ),
        );
      }
      if (resultType == 'contacts') {
        const aFirstnameStartsWith = a.name
          ? a.name
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const bFirstnameStartsWith = b.name
          ? b.name
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const aEmailStartsWith = a.email
          ? a.email
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const bEmailStartsWith = b.email
          ? b.email
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const aPhonenumberStartsWith = a.phone
          ? a.phone
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;
        const bPhonenumberStartsWith = b.phone
          ? b.phone
              .toLowerCase()
              .trim()
              .startsWith(query)
          : false;

        return sortLogic(
          aFirstnameStartsWith,
          bFirstnameStartsWith,
          sortLogic(
            aEmailStartsWith,
            bEmailStartsWith,
            sortLogic(aPhonenumberStartsWith, bPhonenumberStartsWith),
          ),
        );
      }
      const aFirstnameStartsWith = a.firstname
        ? a.firstname
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;
      const bFirstnameStartsWith = b.firstname
        ? b.firstname
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;
      const aLastnameStartsWith = a.lastname
        ? a.lastname
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;
      const bLastnameStartsWith = b.lastname
        ? b.lastname
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;
      const aEmailStartsWith = a.email
        ? a.email
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;
      const bEmailStartsWith = b.email
        ? b.email
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;
      const aPhonenumberStartsWith = a.phonenumber
        ? a.phonenumber
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;
      const bPhonenumberStartsWith = b.phonenumber
        ? b.phonenumber
            .toLowerCase()
            .trim()
            .startsWith(query)
        : false;

      return sortLogic(
        aFirstnameStartsWith,
        bFirstnameStartsWith,
        sortLogic(
          aLastnameStartsWith,
          bLastnameStartsWith,
          sortLogic(
            aEmailStartsWith,
            bEmailStartsWith,
            sortLogic(aPhonenumberStartsWith, bPhonenumberStartsWith),
          ),
        ),
      );
    });
  }

  _renderHomeowners(objects) {
    const { navigationIndex } = this.state;
    const count = objects.length;
    if (count === 0) return null;
    objects = objects.slice(0, 5);
    objects = this._searchSort(objects, 'homeowners');
    return (
      <React.Fragment>
        <li className="search-category">
          Homeowners ({count >= 100 ? '100+' : count})
        </li>
        {objects.map((item, index) => {
          const active = navigationIndex === this.tempNavIndex;
          const realIndex = this.tempNavIndex;
          this.tempNavIndex++;
          const {
            id,
            firstname,
            lastname,
            email,
            phonenumber,
            addressline1,
          } = item;
          return (
            <li
              className={active ? 'active' : ''}
              onMouseOver={() => this._changeNavIndex(realIndex)}
              key={index}
            >
              <a
                href={`${BASE_URL_DRM_REMAKE}/property/${id}`}
                target="__blank"
              >
                <p className="delmar-red bold">
                  {firstname} {lastname}
                </p>
                <p>{email || phonenumber || addressline1}</p>
              </a>
            </li>
          );
        })}
      </React.Fragment>
    );
  }

  _renderDeals(objects) {
    const { navigationIndex } = this.state;
    const count = objects.length;
    if (count === 0) return null;
    objects = objects.slice(0, 5);
    objects = this._searchSort(objects, 'prospective-owners');
    return (
      <React.Fragment>
        <li className="search-category">
          Deals ({count >= 100 ? '100+' : count})
        </li>
        {objects.map((item, index) => {
          const active = navigationIndex === this.tempNavIndex;
          const realIndex = this.tempNavIndex;
          this.tempNavIndex++;
          const { id, firstname, lastname, addressline1, email } = item;
          return (
            <li
              className={active ? 'active' : ''}
              onMouseOver={() => this._changeNavIndex(realIndex)}
              key={index}
            >
              <a
                href={`${BASE_DRM_URL}/#!/pipeline/card/${id}`}
                target="__blank"
              >
                <p className="delmar-red bold">
                  {firstname} {lastname}
                </p>
                <p>{addressline1 || email}</p>
              </a>
            </li>
          );
        })}
      </React.Fragment>
    );
  }

  _renderLeads(objects) {
    const { navigationIndex } = this.state;
    const count = objects.length;
    if (count === 0) return null;
    objects = objects.slice(0, 5);
    objects = this._searchSort(objects, 'homeowner-leads');
    return (
      <React.Fragment>
        <li className="search-category">
          Leads ({count >= 100 ? '100+' : count})
        </li>
        {objects.map((item, index) => {
          const active = navigationIndex === this.tempNavIndex;
          const realIndex = this.tempNavIndex;
          this.tempNavIndex++;
          const { id, firstname, lastname, vac_addressline1 } = item;
          return (
            <li
              className={active ? 'active' : ''}
              onMouseOver={() => this._changeNavIndex(realIndex)}
              key={index}
            >
              <a href={`${BASE_URL_DRM_REMAKE}/leads/${id}`} target="__blank">
                <p className="delmar-red bold">
                  {firstname} {lastname}
                </p>
                <p>{vac_addressline1}</p>
              </a>
            </li>
          );
        })}
      </React.Fragment>
    );
  }

  _renderReferrals(objects) {
    const { navigationIndex } = this.state;
    const count = objects.length;
    if (count === 0) return null;
    objects = objects.slice(0, 5);
    objects = this._searchSort(objects, 'referrals');
    return (
      <React.Fragment>
        <li className="search-category">
          Referrals ({count >= 100 ? '100+' : count})
        </li>
        {objects.map((item, index) => {
          const active = navigationIndex === this.tempNavIndex;
          const realIndex = this.tempNavIndex;
          this.tempNavIndex++;
          const { id, firstname, lastname, email, phonenumber } = item;
          return (
            <li
              className={active ? 'active' : ''}
              onMouseOver={() => this._changeNavIndex(realIndex)}
              key={index}
            >
              <a href={`${BASE_DRM_URL}/#!/refpartner/${id}`} target="__blank">
                <p className="delmar-red bold">
                  {firstname} {lastname}
                </p>
                <p>{email || phonenumber}</p>
              </a>
            </li>
          );
        })}
      </React.Fragment>
    );
  }

  _renderContacts(objects) {
    const { navigationIndex } = this.state;
    const count = objects.length;
    if (count === 0) return null;
    objects = objects.slice(0, 5);
    objects = this._searchSort(objects, 'contacts');
    return (
      <React.Fragment>
        <li className="search-category">
          Contacts ({count >= 100 ? '100+' : count})
        </li>
        {objects.map((item, index) => {
          const active = navigationIndex === this.tempNavIndex;
          const realIndex = this.tempNavIndex;
          this.tempNavIndex++;
          const { id, name, email, phone } = item;
          return (
            <li
              className={active ? 'active' : ''}
              onMouseOver={() => this._changeNavIndex(realIndex)}
              key={index}
            >
              <a
                href={`${BASE_DRM_URL}/#!/edit/GENERIC_CONTACT/${id}`}
                target="__blank"
              >
                <p className="delmar-red bold">{name}</p>
                <p>{email || phone}</p>
              </a>
            </li>
          );
        })}
      </React.Fragment>
    );
  }

  _renderVendors(objects) {
    const { navigationIndex } = this.state;
    const count = objects.length;
    if (count === 0) return null;
    objects = objects.slice(0, 5);
    objects = this._searchSort(objects, 'vendors');
    return (
      <React.Fragment>
        <li className="search-category">
          Vendors ({count >= 100 ? '100+' : count})
        </li>
        {objects.map((item, index) => {
          const active = navigationIndex === this.tempNavIndex;
          const realIndex = this.tempNavIndex;
          this.tempNavIndex++;
          const {
            id,
            firstname,
            lastname,
            bus_name,
            bus_phone,
            bus_addressline1,
            bus_addressline2,
          } = item;
          return (
            <li
              className={active ? 'active' : ''}
              onMouseOver={() => this._changeNavIndex(realIndex)}
              key={index}
            >
              <a href={`${BASE_DRM_URL}/#!/vendor/${id}`} target="__blank">
                <p className="delmar-red bold">
                  {firstname} {lastname}
                </p>
                <p>
                  {bus_addressline1 ||
                    bus_addressline2 ||
                    bus_phone ||
                    bus_name}
                </p>
              </a>
            </li>
          );
        })}
      </React.Fragment>
    );
  }

  _renderContactCategoryResults(category, results) {
    const objects = results[category];
    switch (category) {
      case 'homeowners':
        return this._renderHomeowners(objects);
      case 'deals':
        return this._renderDeals(objects);
      case 'homeowner-leads':
        return this._renderLeads(objects);
      case 'referrals':
        return this._renderReferrals(objects);
      case 'contacts':
        return this._renderContacts(objects);
      case 'vendors':
        return this._renderVendors(objects);
    }
  }

  _renderContactsDropdownList = searchResults => {
    const keys = Object.keys(searchResults);
    this.tempNavIndex = 0;
    return (
      <ul className="search-list">
        {keys.map(k => this._renderContactCategoryResults(k, searchResults))}
        {!this.input.value.startsWith('#') && searchResults.length > 0 && (
          <li className="search-footer">
            *Only up to 5 records of each category will be shown at one time
          </li>
        )}
      </ul>
    );
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
          const { column_name, display_name } = item;

          const { homeowner_id, property_id } = selectedListing;
          const active = navigationIndex === index;

          return (
            <li
              key={index}
              onMouseOver={() => this._changeNavIndex(index)}
              className={active ? 'active' : ''}
            >
              <a
                target="__blank"
                href={`${BASE_URL_DRM_REMAKE}/property/${homeowner_id}/address/${property_id}/field/${column_name}`}
              >
                <p>{display_name}</p>
              </a>
            </li>
          );
        })}
      </ul>
    );
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
                  <a
                    target="__blank"
                    href={`${BASE_URL_DRM_REMAKE}/property/${homeowner_id}/address/${property_id}/field/${field_name}`}
                  >
                    <p className="delmar-red bold">{item.innerText}</p>
                  </a>
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
              <a
                href={`${BASE_URL_DRM_REMAKE}/property/${homeowner_id}/address/${property_id}`}
                target="__blank"
              >
                <p className="delmar-red bold">
                  #{house_num} {house_name}
                </p>
                <p>{fullName}</p>
              </a>
            </li>
          );
        })}
      </ul>
    );
  };

  renderDropdownList = () => {
    let { layer, searchTerm, searchResults } = this.state;

    switch (layer) {
      case SEARCH_LAYER_CONTACTS:
        return this._renderContactsDropdownList(searchResults);
      case SEARCH_LAYER_ADDRESS:
        return this._renderAddressDropdownList(searchResults, searchTerm);
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
          window.location.href = `${BASE_URL_DRM_REMAKE}/property/${homeowner_id}/address/${property_id}`;
        } else if (layer === SEARCH_LAYER_FIELD) {
          const { selectedListing } = this.state;
          const { homeowner_id, property_id } = selectedListing;
          const { column_name } = item;
          window.location.href = `${BASE_URL_DRM_REMAKE}/property/${homeowner_id}/address/${property_id}/field/${column_name}`;
        } else if (layer === SEARCH_LAYER_CONTACTS) {
          // hack until we've converted every new contact type page to the remake
          const active = document.querySelector(
            '#nav-search-wrapper .search-list .active a',
          );
          window.location = active.href;
        } else {
          const { activeListing } = this.props;
          const { id } = activeListing.data;
          const { homeowner_id, property_id } = listings.find(
            item => item.property_id === id,
          );
          const field_name = this.searchData[navigationIndex].getAttribute(
            'name',
          );
          window.location.href = `${BASE_URL_DRM_REMAKE}/property/${homeowner_id}/address/${property_id}/field/${field_name}`;
        }
      }
    } else if (event.keyCode === 8 && layer != SEARCH_LAYER_CONTACTS) {
      const everythingSelected =
        input.selectionStart === 0 && input.selectionEnd === input.value.length;
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
      const limit = this.searchData.length - 1;

      const newIndex =
        navigationIndex + 1 > limit ? limit : navigationIndex + 1;
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

  doSearch() {
    const { searchTerm } = this.state;

    if (this.searchTimeout != null) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (searchTerm.startsWith('#')) {
        this.setState({
          layer: SEARCH_LAYER_ADDRESS,
          searchResults: this.props.listings,
        });
      } else {
        axios.get(API_ENDPOINTS.DRM_RECORDSEARCH(searchTerm)).then(response => {
          const keys = Object.keys(response.data);
          this.searchData = [];
          for (const k of keys) {
            // hack for now since we don't include the prospective owners array
            // in our search results
            if (k === 'prospective-homeowners') continue;
            this.searchData = this.searchData.concat(
              response.data[k].slice(0, 5),
            );
          }
          this.setState({
            layer: SEARCH_LAYER_CONTACTS,
            searchResults: response.data,
          });
        });
      }
    }, 500);
  }

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
            ref={node => (this.input = node)}
            onBlur={() =>
              setTimeout(() => this.setState({ isOpen: false }), 300)
            }
            onFocus={() => this.setState({ isOpen: true })}
            placeholder="Search something..."
            type="text"
            value={searchTerm}
            onKeyDown={this._handleKey}
            onChange={evt =>
              this.setState(
                {
                  searchTerm: evt.target.value.trimLeft(),
                },
                () => {
                  this.doSearch();
                },
              )
            }
            className={isSearchingField ? 'search-field' : null}
          />
          {!hideIcon && (
            <div className="search-icon-wrapper">
              <SearchIcon
                className="search-icon"
                // onClick={this.toggleSearch}
              />
            </div>
          )}
        </div>

        {isOpen && searchTerm !== '' ? this.renderDropdownList() : null}
      </div>
    );
  }
}

const SearchRouter = withRouter(NavSearch);

const mapStateToProps = ({ activeListing }) => ({ activeListing });

export default connect(mapStateToProps, null)(SearchRouter);
