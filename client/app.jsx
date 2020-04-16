import React from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import SearchResults from './searchResults.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      categories: [],
      listings: [],
      currentPage: 1,
      pageCount: 1,
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
  }

  handleSortClick(event) {
    this.setState({
      sortField: event.target.className,
      sortOrder: this.state.sortOrder === '' ? 'asc' : this.state.sortOrder === 'asc' ? 'desc' : ''
    }, () => {
     this.handleSearchClick();
    })
  }

  handleSearchClick() {
    this.setState({
      listings: [],
      currentPage: 1,
      totalListings: 0
    }, () => {
      this.getReverbListings();
      this.getEbayListings();
    })
  }

  handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleSearchClick();
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
      totalListings: 0
    }, () => {
      if (this.state.listingCountByService.reverb >= (this.state.currentPage - 1) * (this.state.listingsPerPage / 2)) {
        this.getReverbListings();
      }
      if (this.state.listingCountByService.ebay >= (this.state.currentPage - 1) * (this.state.listingsPerPage / 2)) {
        this.getEbayListings();
      }
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
      let listingCount = results.data.total + this.state.totalListings;
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
      let listingCount = parseInt(results.data.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0]) + this.state.totalListings;
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
          description: searchResults[i].description,
          price: searchResults[i].price.amount,
          listingUrl: `http://reverb.com/item/${searchResults[i].id}`,
          source: source
        }
        tempArray.push(listing);
      } else if (source === 'ebay') {
        let listing = {
          id: searchResults[i].itemId[0],
          image: searchResults[i].galleryURL[0],
          name: searchResults[i].title[0],
          description: searchResults[i].title[0],
          price: searchResults[i].sellingStatus[0].currentPrice[0].__value__,
          listingUrl: searchResults[i].viewItemURL[0],
          source: source
        }
        tempArray.push(listing);
      }
    }
    this.setState({
      listings: [...this.state.listings, ...tempArray],
      hideSearchResults: false
    });
  }

  render() {
    return (
      <div>
        <h1>GearFinder<i className="fas fa-drum"></i><i className="fas fa-guitar"></i><i className="fas fa-microphone-alt"></i></h1>
        <input onChange={this.handleSearchText} onKeyPress={this.handleSearchKeyPress} value={this.state.searchText}></input>
        <button onClick={this.handleSearchClick}>Search</button>
        <div className={this.state.hideSearchResults ? "placeHolder" : "placeHolder hide"}>
          <h3>Search Used and Vintage Gear!</h3>
        </div>
        <div className={this.state.hideSearchResults ? "resultsContainer hide" : "resultsContainer"}>
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
    )
  }
}