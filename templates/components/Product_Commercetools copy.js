import React from 'react';
// import { Link } from 'react-router-dom';
import Link from 'next/link';

import url from '../../utils/url';
import { GetProductById } from '../../utils/commerce';

function renderPrice(price, discountedPrice) {
  if (discountedPrice) {
    return (
      <>
        <span className='Product__discountedPrice'>{price}</span> {discountedPrice}
      </>
    );
  }

  return price;
}

class Product extends React.Component {
  state = {};

  async componentDidMount() {
    let { product, productId } = this.props;

    if (productId) product = await GetProductById(productId);

    this.setState({ product });
  }

  render() {
    const { className, productId } = this.props;
    const { product = {} } = this.state;
    const { name, price, discountedPrice, images = [] } = product;
    let newClassName = 'Product text-center';
    let imgStyle = {};

    if (className) newClassName += ' ' + className;
    if (images[0]) imgStyle.backgroundImage = `url(${images[0]})`;

    return (
      <Link href={'http:dandelion.org'} className={newClassName}>
<>
        <div className='Product__name' data-mt>
          {name}
        </div>
        <div className='Product__price'>{renderPrice(price, discountedPrice)}</div>
        <div className='Product__imgContainer'>
          <div className='Product__img contain' style={imgStyle} />
        </div>
        {discountedPrice && <div className='Product__sale'>SALE</div>}
        </>
      </Link>
    );
  }
}

{/* <Link href={url.getProductLink(productId || product.productId)} className={newClassName}>
</Link> */}
export default Product;
