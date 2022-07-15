import React from 'react';

const Image = (props) => {
  let imageUrl = '';

  if (props.image['@id']){
    const imageProvider =  props.image['@id'].split(':')[0]
    console.log("IMG Provider: " + imageProvider)
    
    if (imageProvider == "bynder"){
      imageUrl = props.image['@link']
    }else{
      imageUrl = process.env.NEXT_PUBLIC_MGNL_HOST + '/dam/' + props.image['@id'] + props.image['@path']
    }
    console.log("IMG: " + props.image["@link"])
  }


return (
  <img
    className='Image'
    src={imageUrl}
    alt='Etiam Purus'
  />
);
}

export default Image;
