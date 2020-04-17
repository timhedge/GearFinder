import React from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import SearchResults from './searchResults.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      lastSearchText: '',
      categories: [],
      listings: [],
      unsortedListings: [],
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
    this.sortListings = this.sortListings.bind(this);
  }

  handleSortClick(event) {
    this.setState({
      sortField: event.target.dataset.column,
      sortOrder: this.state.sortOrder === '' ? 'asc' : this.state.sortOrder === 'asc' ? 'desc' : ''
    }, () => {
      console.log('hello search click')
      this.handleSearchClick();
    })
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

  handleSearchClick(callback) {
    this.setState({
      lastSearchText: this.state.searchText,
      listings: [],
      unsortedListings: [],
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
      unsortedListings: [],
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
          description: searchResults[i].description,
          price: parseInt(searchResults[i].price.amount),
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
      hideSearchResults: false
    }, () => {
      this.sortListings();
    });
  }

  render() {
    return (
      <div className={this.state.hideSearchResults ? "container center" : "container"}>
        <h1 className={this.state.hideSearchResults ? "heading centerText" : "heading"}>GearFinder<i className="fas fa-drum"></i><i className="fas fa-guitar"></i><i className="fas fa-microphone-alt"></i></h1>
        <div className={this.state.hideSearchResults ? "searchContainer centerText" : "searchContainer"}>
          <input onChange={this.handleSearchText} onKeyPress={this.handleSearchKeyPress} value={this.state.searchText}></input>
          <button onClick={this.handleSearchClick}>Search</button>
        </div>
        <div className={this.state.hideSearchResults ? "placeHolder centerText" : "placeHolder hide"}>
          <h3>Search Used and Vintage Music Gear!</h3>
        </div>
        <div className={this.state.hideSearchResults || this.state.lastSearchText === '' ? "listingCount hide" : "listingCount"}>
          <p>{this.state.totalListings} results for "{this.state.lastSearchText}"</p>
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
        <p className={this.state.hideSearchResults ? "footer hide" : "footer"}>Not affiliated with or endorsed by Reverb.com, LLC or eBay Inc.</p>
      </div>
    )
  }
}