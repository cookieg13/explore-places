import React from "react";
import "./UserItem.css";
const UserItem = (props) => {
  return (
    <li className="user-item">
      <div className="user-item__content">
        <image src={props.image} alt={props.name} />
      </div>
      <div className="user-item__info">
        <h2>{props.name}</h2>
        <h2>
          {props.placeCount}
          {props.placeCount === 1 ? "Place" : "Places"}
        </h2>
      </div>
    </li>
  );
};

export default UserItem;
