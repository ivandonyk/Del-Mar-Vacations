import React, { Component } from 'react';
import moment from 'moment';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

import close_icon from '../../assets/close_orange.svg';
import './style.scss';

class GalleryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      galleryIndex: 0,
    };
    this.outsideGalleryClickRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = event => {
    if (
      this.outsideGalleryClickRef &&
      !this.outsideGalleryClickRef.contains(event.target)
    ) {
      this.props.onClose();
    }
  };

  _renderPhotos = images => {
    console.log('images', images);
    return images.map((item, index) => (
      <a
        key={index}
        href={`${window.location.origin}/file/${item.key}`}
        target="_blank"
        style={{
          display: 'flex',
          flex: 1,
        }}
      >
        <img src={`/file/${item.key}`} alt="" />
      </a>
    ));
  };

  render() {
    const { galleryIndex } = this.state;
    const {
      images,
      title = '',
      onClose = () => {},
      isOpen = false,
    } = this.props;
    const fixed_title = title ? title.replace(/_/g, ' ') : '';
    if (!isOpen) return null;

    if (images.length === 0) {
      return (
        <div className="gallery-modal--container">
          <div
            className="gallery-modal--table"
            ref={ref => (this.outsideGalleryClickRef = ref)}
          >
            <div className="gallery-title">
              <h1>No images</h1>
              <img
                onClick={onClose}
                className="delete-btn"
                src={close_icon}
                style={{ height: '20px' }}
                alt=""
              />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="gallery-modal--container">
        <div
          className="gallery-modal--table"
          ref={ref => (this.outsideGalleryClickRef = ref)}
        >
          <div className="gallery-title">
            <h1>
              Photo {galleryIndex + 1} of {images.length}
            </h1>
            <img
              onClick={() => {
                this.setState({ galleryIndex: 0 });
                onClose();
              }}
              className="delete-btn"
              src={close_icon}
              style={{ height: '20px' }}
              alt=""
            />
          </div>
          <div className="gallery-title">
            {fixed_title && <p>{fixed_title} </p>}
            <h2>{images[galleryIndex].caption}</h2>
            <p className="s-p italic-txt">
              Uploaded{' '}
              {new moment(images[galleryIndex].createdAt).format(
                'MMM DD, YYYY',
              )}
            </p>
          </div>

          <Carousel
            showStatus={false}
            infiniteLoop
            showIndicators={false}
            onChange={evt => {
              this.setState({ galleryIndex: evt });
              return evt;
            }}
            selectedItem={galleryIndex}
          >
            {this._renderPhotos(images)}
          </Carousel>
        </div>
      </div>
    );
  }
}

export default GalleryModal;
