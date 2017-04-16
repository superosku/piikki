import React from 'react';
import moment from 'moment';


class TabItem extends React.Component {
  render() {
    return <div className="tab-item">
      <div className="tab-item-header">
        <div>
          <span className="type-name">
            {this.props.tabItem.name}
          </span>
        </div>
        <div>
          {this.addedAt}
        </div>
      </div>
      <div className="tab-item-content">
        <div className="info-container">
          <span className="name">Price</span>
          <span className="info"> {this.props.tabItem.price}€ x {this.props.tabItem.amount} = {this.props.tabItem.total}€</span>
        </div>
        <div className="info-container">
          <span className="name">By</span>
          <span className="info">{this.props.tabItem.adder.name}</span>
        </div>
        <div className="info-container">
          <span className="name">For</span>
          <span className="info">{this.props.tabItem.person.name}</span>
        </div>
      </div>
    </div>
  }

  get addedAt() {
    return <span>
      <i className="fa fa-calendar"></i>
      {moment(this.props.tabItem.added_at).format('DD.MM.YY')}
      <i className="fa fa-clock-o"></i>
      {moment(this.props.tabItem.added_at).format('HH:mm')}
    </span>
    return moment(this.props.tabItem.added_at).format('DD.MM.YY - HH:mm');
  }
}


export default TabItem;
