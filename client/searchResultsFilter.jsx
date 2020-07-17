import React from 'react';

const searchResultsFilter = (props) => {
  return (
    <form>
      <div className="form-group">
        <label>Price</label>
        <input type="number" className="form-control" placeholder="min" min="0"></input>
        <input type="number" className="form-control" placeholder="max" min="1"></input>
      </div>
      <button type="submit" className="btn btn-secondary">Filter</button>
    </form>
  )
}

export default searchResultsFilter;