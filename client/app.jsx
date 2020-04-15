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
      currentPage: 1
    }
    this.handleSearchText = this.handleSearchText.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
  }

  handleSearchClick() {
    this.getReverbListings();
    this.getEbayListings();
    //add more gets
  }

  handleSearchText(event) {
    this.setState({
      searchText: event.target.value
    });
  }

  getReverbListings() {
    axios.get('http://localhost:3000/reverbSearch', {
      params: {
        searchQuery: this.state.searchText
      }
    })
    .then((results) => {
      // console.log(results.data.listings)
      this.normalizeListings(results.data.listings, 'reverb');
    })
    .catch((error) => {
      console.log(error);
    })
  }

  getEbayListings() {
    axios.get('http://localhost:3000/ebaySearch', {
      params: {
        searchQuery: this.state.searchText
      }
    })
    .then((results) => {
      //console.log(results.data)
      this.normalizeListings(results.data.findItemsAdvancedResponse[0].searchResult[0].item, 'ebay');
    })
    .catch((error) => {
      console.log(error);
    })
  }

  normalizeListings(searchResults, source) {
    let tempArray = []; // normalize data and put in one listings array
    for (let i = 0; i < searchResults.length; i++) {
      if (source === 'reverb') {
        let listing = {
          id: searchResults[i].id,
          image: searchResults[i].photos[0]._links.thumbnail.href,
          name: searchResults[i].title,
          description: searchResults[i].description,
          price: searchResults[i].price.amount,
          listingUrl: `reverb.com/item/${searchResults[i].id}`,
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
      listings: [...this.state.listings, ...tempArray]
    });
  }

  render() {
    return (
      <div>
        <h1>GearFinder</h1>
        <input onChange={this.handleSearchText}></input>
        <button onClick={this.handleSearchClick}>Search</button>
        <div className="resultsContainer">
          <SearchResults listings={this.state.listings}/>
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
    )
  }
}