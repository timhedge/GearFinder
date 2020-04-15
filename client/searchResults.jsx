import React from 'react';
import Listing from './listing.jsx';

const searchResults = (props) => {
  return (
    <div id="searchResults">
      <table>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {props.listings.map((listing, index) => {
            return (
              <Listing index={index} listing={listing}/>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default searchResults;