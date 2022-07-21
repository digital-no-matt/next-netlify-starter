/* eslint-disable @next/next/no-img-element */
import React from 'react';
// import { Link } from 'react-router-dom';
import Link from 'next/link';

import url from '../../utils/url';
import { GetProductById } from '../../utils/commerce';
import Commercetools from '../../utils/Commercetools';
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

function hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
  
    try {
      console.log("hasJsonStructures" + str)
      const result = JSON.parse(str);
      console.log("DONE")
      const type = Object.prototype.toString.call(result);
  
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }

function extractProductObject(fullProductId, isCategory) {
    if (!fullProductId) return {};
  
    let definitionName;
    let connectionName;
    let productId;
    let categoryId;
  
    if (hasJsonStructure(fullProductId)) {
      console.log("extractProductObject" + fullProductId)
      const propObject = JSON.parse(fullProductId);
      console.log("DONE")
      
      definitionName = propObject.definitionName;
      connectionName = propObject.connectionName;
      categoryId = propObject.categoryId;
      productId = propObject.productId;
    } else {
      if (fullProductId.indexOf('/') > -1) {
        const propArray = fullProductId.split('/');
  
        definitionName = propArray[0];
        connectionName = propArray[1];
  
        if (isCategory) {
          categoryId = propArray[2];
        } else {
          productId = propArray[2];
        }
      } else {
        productId = fullProductId;
      }
    }


  return {
    definitionName,
    connectionName,
    productId,
    categoryId,
  };
}

class Product extends React.Component {
  state = {};

  async componentDidMount() {
    let { productId, title } = this.props;
    
    let product;
    console.log("productID:" + productId)

    const productObject = extractProductObject(productId);

    // if (productId) product = await GetProductById2(productId);

    // this.setState({ product });

    console.log("productID:" + productId)

    let definitionName;
    let connectionName;
    let productId_UUID;

    definitionName = productObject.definitionName;
    connectionName = productObject.connectionName;
    productId_UUID = productObject.productId;

    console.log("productId_UUID:" + productId_UUID)

    await Commercetools.init()
    product = await Commercetools.getProductById(productId_UUID);
    console.log("productCT:" + product)
    this.setState({ product });
  }

  render() {
    console.log("render1");
    const { className, productId } = this.props;
    const { product = {} } = this.state;
    let { name, price, discountedPrice, images = [] } = product;
    
    if (this.props.title){
      name = this.props.title;
    }
    let newClassName = 'Product text-center';
    let imgStyle = {};

    if (className) newClassName += ' ' + className;
    if (images[0]) imgStyle.backgroundImage = `url(${images[0]})`;

    console.log("render3");
    return (
      <div className={newClassName}>
<>
        <div className='Product__name' data-mt>
          {name}
        </div>
        <div className='Product__price'>{renderPrice(price, discountedPrice)}</div>
        <div className='Product__imgContainer'>
          
          <img src={images[0]} alt='Etiam Purus' />

          <div className='Product__img contain' style={imgStyle} />
        </div>
        {discountedPrice && <div className='Product__sale'>SALE</div>}

        <div className="shop">SHOP</div>
        </>
      </div>
    );
  }
}

{/* <Link href={url.getProductLink(productId || product.productId)} className={newClassName}>
</Link> */}
export default Product;
