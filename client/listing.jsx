import React from 'react';

const listing = (props) => {
  return (
    <tr key={props.listing.index}>
      <td><img src={props.listing.image}></img></td>
      <td>{props.listing.name}</td>
      <td>{props.listing.description}</td>
      <td>{props.listing.price}</td>
      <td>{props.listing.listingUrl}</td>
      <td>{props.listing.source}</td>
    </tr>
  )
}

export default listing;