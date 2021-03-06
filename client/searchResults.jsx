import React from 'react';
import Listing from './listing.jsx';

const searchResults = (props) => {
  return (
    <div id="searchResults" className="h-100">
      <table className="table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" className="item" onClick={props.handleSortClick}>Item</th>
            <th scope="col" className="d-none d-sm-table-cell" onClick={props.handleSortClick}>Description</th>
  <th scope="col" className={props.sortField === 'price' && props.sortOrder === 'asc' || props.sortOrder === 'desc' ? "price sortSelect" : "price"} onClick={props.handleSortClick} data-column="price">Price {props.sortField === 'price' && props.sortOrder === 'asc' ? <i className="fas fa-arrow-up"></i> : props.sortField === 'price' && props.sortOrder === 'desc' ? <i className="fas fa-arrow-down"></i> : ''}</th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody className="h-100">
          {props.listings.map((listing, index) => {
            return (
              <Listing key={index} listing={listing}/>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default searchResults;