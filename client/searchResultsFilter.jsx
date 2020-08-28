import React from 'react';
import BrandFilter from './BrandFilter.jsx';

const searchResultsFilter = (props) => {
  return (
    <form onSubmit={props.filterListings}>
      <div className="form-group">
        <label>Price</label>
        <input type="number" className="form-control" placeholder="min" min="0" value={props.filterParams.minPrice} onChange={props.handleMinPriceFilterChange}></input>
        <input type="number" className="form-control" placeholder="max" min="1" value={props.filterParams.maxPrice} onChange={props.handleMaxPriceFilterChange}></input>
      </div>
      <BrandFilter handleBrandSelectionFilter={props.handleBrandSelectionFilter} brandList={props.brandList} selectedBrands={props.filterParams.brands}/>
      <button type="submit" className="btn btn-secondary">Filter</button>
      <button type="button" onClick={props.clearFilter} className="btn btn-light">Clear</button>
    </form>
  )
}

export default searchResultsFilter;