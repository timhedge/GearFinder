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
        maxPrice: undefined
      },
      currentPage: 1,
      pageCount: 1,
      unfilteredPageCount: 1,
      listingCountByService: {
        reverb: 0,
        ebay: 0
      },
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
  }

  handleSortClick(event) {
    this.setState({
      sortField: event.target.dataset.column,
      sortOrder: this.state.sortOrder === '' ? 'asc' : this.state.sortOrder === 'asc' ? 'desc' : ''
    }, () => {
      console.log(this.state.currentPage);
      this.handleSearchClick(event, this.state.currentPage);
    })
  }

  filterListings(event) {
    event.preventDefault();
    let filteredArray = [];
    let unfilteredArray = this.state.listings;
    let unfilteredPages = this.state.pageCount;
    let filteredCount = 0;

    for (let i = 0; i < this.state.listings.length; i++) {
      if (this.state.listings[i].price <= this.state.filterParams.maxPrice && this.state.listings[i].price >= this.state.filterParams.minPrice) {
        filteredArray.push(this.state.listings[i]);
        filteredCount += 1;
      }
    }

    let filteredPageCount = Math.ceil(filteredArray.length / this.state.listingsPerPage);

    this.setState({
      listings: filteredArray,
      unfilteredListings: unfilteredArray,
      filterApplied: true,
      pageCount: filteredPageCount,
      unfilteredPageCount: unfilteredPages
    });
  }

  clearFilter(event) {
    this.setState({
      listings: this.state.unfilteredListings,
      filterApplied: false,
      pageCount: this.state.unfilteredPageCount,
      filterParams: {
        minPrice: '',
        maxPrice: ''
      }
    })
  }

  handleMinPriceFilterChange(event) {
    this.setState({
      filterParams: {
        minPrice: parseInt(event.target.value),
        maxPrice: this.state.filterParams.maxPrice
      }
    });
  }

  handleMaxPriceFilterChange(event) {
    this.setState({
      filterParams: {
        minPrice: this.state.filterParams.minPrice,
        maxPrice: parseInt(event.target.value)
      }
    });
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
        // this.getReverbListings();
        // this.getEbayListings();
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
                if (this.state.listingCountByService.reverb >= (this.state.currentPage - 1) * (this.state.listingsPerPage / 2)) {
                  this.getReverbListings();
                }
                if (this.state.listingCountByService.ebay >= (this.state.currentPage - 1) * (this.state.listingsPerPage / 2)) {
                  this.getEbayListings();
                }
              }
    );
  }

  addToBrandList(brandArray) {
    for (let i = 0; i < brandArray.length; i++) {
      if (this.state.brandList[brandArray[i]] === undefined) {
        let updatedBrandList = this.state.brandList;
        updatedBrandList[brandArray[i]] = true;
        this.setState({
          brandList: updatedBrandList
        })
      }
    }
  }


  getBrandFromDescription(descriptionArray) {
    for (let i = 0; i < descriptionArray.length; i++) {
      axios.get('http://localhost:3000/validateBrandName', {
        params: {
          brandToCheck: descriptionArray[i].toLowerCase()
        }
      })
      .then((results) => {
        if (results.data !== 'Not Found') {
          let resultBrands = results.data.map((entry) => { return entry.brandName });
           return resultBrands;
          //this.addToBrandList(resultBrands);
        }
      })
      .catch((error) => {
        console.log(error);
      })
    }
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
      console.log(results.data);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  getReverbListings() {
    axios.get('http://localhost:3000/reverbSearch', {
      params: {
        searchQuery: this.state.searchText,
        pageNum: this.state.currentPage,
        sortField: this.state.sortField,
        sortOrder: this.state.sortOrder
      }
    })
    .then((results) => {
      console.log(results.data)
      let listingCount = results.data.total + this.state.listingCountByService.ebay;
      let pages = Math.ceil(listingCount / this.state.listingsPerPage);
      this.normalizeListings(results.data.listings, 'Reverb');
      this.setState({
        listingCountByService: {
          reverb: results.data.total,
          ebay: this.state.listingCountByService.ebay
        },
        totalListings: listingCount,
        pageCount: pages
      })
      return results;
    })
    .then((results) => {
      if (this.state.pageCount < results.data.total_pages) {
        this.setState({
          pageCount: this.state.pageCount + 1
        })
      }
    })
    .catch((error) => {
      console.log(error);
    })
  }

  getEbayListings() {
    axios.get('http://localhost:3000/ebaySearch', {
      params: {
        searchQuery: this.state.searchText,
        pageNum: this.state.currentPage,
        sortField: this.state.sortField,
        sortOrder: this.state.sortOrder
      }
    })
    .then((results) => {
      console.log(results.data);
      let listingCount = parseInt(results.data.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0]) + this.state.listingCountByService.reverb;
      let pages = Math.ceil(listingCount / this.state.listingsPerPage);
      this.normalizeListings(results.data.findItemsAdvancedResponse[0].searchResult[0].item, 'ebay');
      this.setState({
        listingCountByService: {
          reverb: this.state.listingCountByService.reverb,
          ebay: parseInt(results.data.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0])
        },
        totalListings: listingCount,
        pageCount: pages
      })
      return results;
    })
    .then((results) => {
      if (this.state.pageCount < parseInt(results.data.findItemsAdvancedResponse[0].paginationOutput[0].totalPages[0])) {
        this.setState({
          pageCount: this.state.pageCount + 1
        })
      }
    })
    .catch((error) => {
      console.log(error);
    })
  }

  normalizeListings(searchResults, source) { // consider moving this to the server side
    let tempArray = []; // normalize data and put in one listings array
    let listingCount = 0;
    for (let i = 0; i < searchResults.length; i++) {
      if (source === 'Reverb') {
        let listing = {
          id: searchResults[i].id,
          image: searchResults[i].photos[0]._links.large_crop.href,
          name: searchResults[i].title,
          brand: [searchResults[i].make],
          description: searchResults[i].description,
          price: parseInt(searchResults[i].price.amount),
          listingUrl: `http://reverb.com/item/${searchResults[i].id}`,
          source: source
        }
        tempArray.push(listing);
      } else if (source === 'ebay') {
        let descriptionWords = searchResults[i].title[0];
        let listing = {
          id: searchResults[i].itemId[0],
          image: searchResults[i].galleryURL[0],
          name: searchResults[i].title[0],
          brand: '', //(() => { return this.getBrandFromDescription(descriptionWords)})(),
          description: descriptionWords,
          price: parseInt(searchResults[i].sellingStatus[0].currentPrice[0].__value__),
          listingUrl: searchResults[i].viewItemURL[0],
          source: source
        }
        tempArray.push(listing);
      }
    }
    this.setState({
      listings: [...this.state.listings, ...tempArray],
      unsortedListings: [...this.state.unsortedListings, ...tempArray],
      unfilteredListings: [...this.state.unfilteredListings, ...tempArray],
      hideSearchResults: false
    }, () => {
      this.sortListings();
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
                  <SearchResultsFilter filterListings={this.filterListings} handleMinPriceFilterChange={this.handleMinPriceFilterChange} handleMaxPriceFilterChange={this.handleMaxPriceFilterChange} clearFilter={this.clearFilter} filterParams={this.state.filterParams}></SearchResultsFilter>
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