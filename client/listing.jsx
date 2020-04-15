import React from 'react';
import ReactHtmlParser from 'react-html-parser';

const listing = (props) => {
  return (
    <tr key={props.listing.index}>
      <td><img className="listingImg" src={props.listing.image}></img></td>
      <td className="listingName">{props.listing.name}</td>
      <td className="listingDesc">{props.listing.source === 'Reverb' ? <div className="longDesc">{ReactHtmlParser(props.listing.description)}</div> : props.listing.description}</td>
      <td className="listingCell">${props.listing.price}</td>
      <td className="listingCell listingLink"><a href={props.listing.listingUrl} target="_blank">View on {props.listing.source}</a></td>
      <td className="listingCell listingSource">{props.listing.source}</td>
    </tr>
  )
}

export default listing;