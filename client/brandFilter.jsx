import React from 'react';

const brandFilter = (props) => {
  let brands = Object.keys(props.brandList);
  return (
    <div className="form-group">
      <label>Brands</label>
      <div className="form-check">
        {brands.map((brand, index) => {
          return (
            <div key={index}>
              <input className="form-check-input" type="checkbox" value="" id={brand}></input>
              <label className="form-check-label" htmlFor={brand}>
                {brand[0].toUpperCase() + brand.substring(1)}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default brandFilter;