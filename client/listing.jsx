import React from 'react';
import ReactHtmlParser from 'react-html-parser';

const listing = (props) => {
  return (
    <tr key={props.listing.index}>
      <td><img className="listingImg" src={props.listing.image}></img></td>
      <td className="listingName">{props.listing.name}</td>
      <td className="listingDesc">{props.listing.source === 'Reverb' ? <div className="longDesc">{ReactHtmlParser(props.listing.description)}</div> : props.listing.description}</td>
      <td className="listingCell">${props.listing.price}</td>
      <td className="listingCell"><a className="listingLink" href={props.listing.listingUrl} target="_blank">View on {props.listing.source}</a></td>
      <td className="listingCell listingSource"><img className="listingSrcImg" src={props.listing.source === 'Reverb' ? "https://images.reverb.com/image/upload/s--N7IPDaUB--/v1496943615/reverb-r-logo-2017_omsytb.png" : "placeholder for ebay"}></img></td>
    </tr>
  )
}

export default listing;