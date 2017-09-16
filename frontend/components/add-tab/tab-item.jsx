import React from 'react';
import moment from 'moment';


class TabItem extends React.Component {
  render() {
    return <div className="tab-item">
      <div className="tab-item-header">
        <div>
          <span className="blue-thing type-name">
            {this.props.tabItem.name}
          </span>
        </div>
        <div>
          <span className="blue-thing">{this.addedAt}</span>
        </div>
      </div>
      <div className="tab-item-content">
        <div className="info-container">
          <span className="name">
            <i className="fa fa-address-book"></i>
          </span>
          <span className="info">{this.props.tabItem.adder.name}</span>
        </div>
        <div className="info-container">
          <span className="name">
            <i className="fa fa-address-book-o"></i>
          </span>
          <span className="info">{this.props.tabItem.person.name}</span>
        </div>
        <div className="info-container">
          <span className="name">
            <i className="fa fa-eur"></i>
          </span>
          <span className="info">{this.price}</span>
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

  get price() {
    if (this.props.tabItem.amount === 1) {
      return <span className="price-info">
        <span className="final-price">
          {this.props.tabItem.price}€
        </span>
      </span>
    }
    return <span className="price-info">
      {this.props.tabItem.price}€ x {this.props.tabItem.amount} = <span className="final-price">{this.props.tabItem.total}€</span>
    </span>;
  }
}


export default TabItem;
