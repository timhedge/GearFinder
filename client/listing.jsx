import React from 'react';
import ReactHtmlParser from 'react-html-parser';

const listing = (props) => {
  return (
    <tr key={props.listing.index}>
      <td scope="row">
        <img className="listingImg" src={props.listing.image}></img>
      </td>
      <td className="listingName">{props.listing.name}</td>
      <td className="listingDesc">
        {props.listing.source === 'Reverb' ?
          <div className="longDesc">{ReactHtmlParser(props.listing.description)}</div> : props.listing.description}
      </td>
      <td className="listingCell">${props.listing.price}</td>
      <td className="listingCell">
        <a className="listingLink" href={props.listing.listingUrl} target="_blank">View on {props.listing.source}</a>
      </td>
      <td className="listingCell listingSource">
        {props.listing.source === 'Reverb' ?
          <a href="http://reverb.com" target="_blank"><img className="listingSrcReverb" src="https://images.reverb.com/image/upload/s--N7IPDaUB--/v1496943615/reverb-r-logo-2017_omsytb.png"></img></a>
          :
          <a href="http://ebay.com" target="_blank"><img className="listingSrcEbay" src="https://mvp-gearfinder.s3.us-east-2.amazonaws.com/Right+Now+108x45.gif"></img></a>}
      </td>
    </tr>
  )
}

export default listing;