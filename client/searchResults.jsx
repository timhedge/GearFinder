import React from 'react';
import Listing from './listing.jsx';

const searchResults = (props) => {
  return (
    <div id="searchResults">
      <table>
        <thead>
          <tr>
            <th></th>
            <th className="item" onClick={props.handleSortClick}>Item</th>
            <th className="description" onClick={props.handleSortClick}>Description</th>
  <th className={props.sortField === 'price' ? "price sortSelect" : "price"} onClick={props.handleSortClick} data-column="price">Price {props.sortField === 'price' && props.sortOrder === 'asc' ? <i className="fas fa-arrow-up"></i> : props.sortField === 'price' && props.sortOrder === 'desc' ? <i className="fas fa-arrow-down"></i> : ''}</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
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