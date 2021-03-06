import React from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import SearchResults from './searchResults.jsx';
import SearchResultsFilter from './searchResultsFilter.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      lastSearchText: '',
      categories: [],
      listings: [],
      unsortedListings: [],
      unfilteredListings: [],
      brandList: {},
      filterApplied: false,
      filterParams: {
        minPrice: undefined,
        maxPrice: undefined,
        brands: {}
      },
      currentPage: 1,
      pageCount: 1,
      unfilteredPageCount: 1,
      totalListings: 0,
      listingsPerPage: 48,
      hideSearchResults: true,
      sortField: '',
      sortOrder: ''
    }
    this.handleSearchText = this.handleSearchText.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleSearchKeyPress = this.handleSearchKeyPress.bind(this);
    this.handleSortClick = this.handleSortClick.bind(this);
    this.sortListings = this.sortListings.bind(this);
    this.filterListings = this.filterListings.bind(this);
    this.handleMaxPriceFilterChange = this.handleMaxPriceFilterChange.bind(this);
    this.handleMinPriceFilterChange = this.handleMinPriceFilterChange.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
    this.handleBrandSelectionFilter = this.handleBrandSelectionFilter.bind(this);
  }

  handleSortClick(event) {
    this.setState({
      sortField: event.target.dataset.column,
      sortOrder: this.state.sortOrder === '' ? 'asc' : this.state.sortOrder === 'asc' ? 'desc' : ''
    }, () => {
      this.handleSearchClick(event, this.state.currentPage);
    })
  }

  filterListings(event) {
    event.preventDefault();

    let filteredArray = this.state.unfilteredListings.filter((listing) => {
      if ((this.state.filterParams.minPrice === undefined || this.state.filterParams.minPrice === '') && (this.state.filterParams.maxPrice === undefined || this.state.filterParams.maxPrice === '')) {
        return this.state.filterParams.brands[listing.brand] === true || Object.keys(this.state.filterParams.brands).length === 0;
      } else if (this.state.filterParams.minPrice === undefined || this.state.filterParams.minPrice === '') {
        return listing.price <= this.state.filterParams.maxPrice && (this.state.filterParams.brands[listing.brand] === true || Object.keys(this.state.filterParams.brands).length === 0);
      } else if (this.state.filterParams.maxPrice === undefined || this.state.filterParams.maxPrice === '') {
        return listing.price >= this.state.filterParams.minPrice && (this.state.filterParams.brands[listing.brand] === true || Object.keys(this.state.filterParams.brands).length === 0);
      } else {
        return listing.price <= this.state.filterParams.maxPrice && listing.price >= this.state.filterParams.minPrice && (this.state.filterParams.brands[listing.brand] === true || Object.keys(this.state.filterParams.brands).length === 0)
      }
    })

    let filteredPageCount = Math.ceil(filteredArray.length / this.state.listingsPerPage);

    this.setState({
      listings: filteredArray,
      filterApplied: true,
      pageCount: filteredPageCount
    });
  }

  clearFilter(event) {
    this.setState({
      listings: this.state.unfilteredListings,
      filterApplied: false,
      pageCount: this.state.unfilteredPageCount,
      filterParams: {
        minPrice: '',
        maxPrice: '',
        brands: {}
      }
    })
  }

  handleMinPriceFilterChange(event) {
    this.setState({
      filterParams: {
        minPrice: parseInt(event.target.value),
        maxPrice: this.state.filterParams.maxPrice,
        brands: this.state.filterParams.brands
      }
    });
  }

  handleMaxPriceFilterChange(event) {
    this.setState({
      filterParams: {
        minPrice: this.state.filterParams.minPrice,
        maxPrice: parseInt(event.target.value),
        brands: this.state.filterParams.brands
      }
    });
  }

  handleBrandSelectionFilter(event) {
    let selectedBrand = event.target.id;
    let checked = event.target.checked;
    let checkedBrands = this.state.filterParams.brands;

    if (event.target.checked === true) {
      console.log(checkedBrands)
      checkedBrands[selectedBrand] = true;
      this.setState({
        filterParams: {
          minPrice: this.state.filterParams.minPrice,
          maxPrice: this.state.filterParams.maxPrice,
          brands: checkedBrands
        }
      })
    } else if (event.target.checked === false) {
      delete checkedBrands[selectedBrand];
      this.setState({
        filterParams: {
          minPrice: this.state.filterParams.minPrice,
          maxPrice: this.state.filterParams.maxPrice,
          brands: checkedBrands
        }
      })
    }
  }

  sortListings() {
    let list = this.state.listings;

    if (this.state.sortField === 'price' && this.state.sortOrder === 'asc') {
      let sortedAsc = list.sort((a, b) => {
        return a.price - b.price;
      })
      this.setState({
        listings: sortedAsc
      })
    } else if (this.state.sortField === 'price' && this.state.sortOrder === 'desc') {
      let sortedDesc = list.sort((a, b) => {
        return b.price - a.price;
      })
      this.setState({
        listings: sortedDesc
      })
    } else if (this.state.sortField === 'price' && this.state.sortOrder === '') {
      this.setState({
        listings: this.state.unsortedListings
      })
    }
  }

  handleSearchClick(event, page) {
    if (page === undefined) {
      page = 1;
    }
    this.setState({
      lastSearchText: this.state.searchText,
      listings: [],
      unsortedListings: [],
      unfilteredListings: [],
      currentPage: page,
      totalListings: 0
    }, () => {
        this.getListings();
      })
  }

  handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleSearchClick(event);
    }
  }

  handleSearchText(event) {
    this.setState({
      searchText: event.target.value
    });
  }

  handlePageClick(clickTarget) {
    this.setState({
      currentPage: clickTarget.selected + 1,
      listings: [],
      unsortedListings: [],
      unfilteredListings: [],
      totalListings: 0
    }, () => {
      this.getListings();
    });
  }

  getListings() {
    axios.get('http://localhost:3000/search', {
      params: {
        searchQuery: this.state.searchText,
        pageNum: this.state.currentPage,
        sortField: this.state.sortField,
        sortOrder: this.state.sortOrder
      }
    })
    .then((results) => {
      console.log(results.data.listingBrands)
      this.setState({
        totalListings: results.data.listingCount,
        pageCount: results.data.listingPages,
        listings: [...results.data.listings],
        unsortedListings: [...results.data.listings],
        unfilteredListings: [...results.data.listings],
        brandList: results.data.listingBrands,
        hideSearchResults: false
      }, () => {
      this.sortListings();
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }

  render() {
    return (
      <div className={this.state.hideSearchResults ? "container h-100 center vhCenter" : "container h-100"}>
        <div className="w-100">
          <h1 className={this.state.hideSearchResults || screen.width < 575.98 ? "heading centerText center" : "heading"}><span className="block">GearFinder</span><span className="block"><i className="fas fa-drum"></i><i className="fas fa-guitar"></i><i className="fas fa-microphone-alt"></i></span></h1>
          <div className={this.state.hideSearchResults || screen.width < 575.98 ? "searchContainer centerText center" : "searchContainer"}>
            <input className="center searchInput" onChange={this.handleSearchText} onKeyPress={this.handleSearchKeyPress} value={this.state.searchText}></input>
            <button className="center searchButton" onClick={this.handleSearchClick}><i className="fas fa-search"></i></button>
          </div>
          <div className={this.state.hideSearchResults ? "placeHolder centerText center" : "placeHolder hide"}>
            <h4>Search Used and Vintage Music Gear!</h4>
          </div>
          <div className={this.state.hideSearchResults || this.state.lastSearchText === '' ? "listingCount hide" : screen.width < 575.98 ? "listingCount centerText center" : "listingCount"}>
            <p>{this.state.totalListings} results for "{this.state.lastSearchText}"</p>
          </div>
          <div className={this.state.hideSearchResults ? "h-75 hide" : "h-75"}>
            <div className="container">
              <div className="row">
                <div className="col-sm-2">
                  <SearchResultsFilter handleBrandSelectionFilter={this.handleBrandSelectionFilter} filterListings={this.filterListings} handleMinPriceFilterChange={this.handleMinPriceFilterChange} handleMaxPriceFilterChange={this.handleMaxPriceFilterChange} clearFilter={this.clearFilter} filterParams={this.state.filterParams} brandList={this.state.brandList}></SearchResultsFilter>
                </div>
                <div className="col-sm-10">
                  <SearchResults listings={this.state.listings} sortOrder={this.state.sortOrder} sortField={this.state.sortField} handleSortClick={this.handleSortClick}/>
                  <div className="paginateOuter">
                    <ReactPaginate
                      previousLabel={'previous'}
                      nextLabel={'next'}
                      breakLabel={'...'}
                      breakClassName={'break-me'}
                      pageCount={this.state.pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={this.handlePageClick}
                      containerClassName={'pagination'}
                      subContainerClassName={'pages pagination'}
                      activeClassName={'active'}
                      forcePage={this.state.currentPage - 1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className={this.state.hideSearchResults ? "footer hide" : "footer"}>Not affiliated with or endorsed by Reverb.com, LLC or eBay Inc.</p>
        </div>
      </div>
    )
  }
}