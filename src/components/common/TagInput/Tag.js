import React from 'react';

const Tag = ({ tile, id, removeTile }) => (
  <span className="tile">
    <span>{tile.name}</span>
    <i className="tile__icon fa fa-times" onClick={() => removeTile(id)} />
  </span>
);

export default Tag;
