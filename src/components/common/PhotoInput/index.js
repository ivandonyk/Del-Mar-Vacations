import React from 'react';
import PropTypes from 'prop-types';
import PhotoUtils from '../../../helpers/photo_utils';
import './index.scss';

class PhotoInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageCol: [],
    };
  }

  onSubmit = e => {
    e.preventDefault();

    const { imageCol } = this.state;
    const { parentTable, parentId } = this.props;

    const formData = new FormData();
    formData.append('table_name', parentTable);
    formData.append('parent_id', parentId);
    Array.from(imageCol).forEach((image, index) => {
      formData.append('imageCol', image);
    });

    PhotoUtils.uploadFile(formData).then(resp => {
      console.log('firing');
      this.props.close();
    });
  };

  onFileChange = e => {
    this.setState({ imageCol: e.target.files });
  };

  renderPreviewPhotos = () => {
    const { imageCol } = this.state;

    return Array.from(imageCol).map((image, index) => {
      const imgUrl = URL.createObjectURL(image);

      return <img key={index} className="previewImage" src={imgUrl} />;
    });
  };

  render() {
    const { close } = this.props;
    const { imageCol } = this.state;

    return (
      <div>
        <h2> Add Photos </h2>
        <div>{this.renderPreviewPhotos()}</div>
        <div>
          <form onSubmit={this.onSubmit}>
            <div>
              <input
                type="file"
                name="imageCol"
                onChange={this.onFileChange}
                accept="image/*"
                multiple
              />
            </div>
            <div>
              <div className="submit-button-container">
                <button
                  className="orange-button"
                  disabled={imageCol.length === 0}
                  type="submit"
                >
                  Upload
                </button>
                <div className="cancel-button-container">
                  <span className="orange-txt-btn" onClick={close}>
                    Cancel
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

PhotoInput.propTypes = {};

export default PhotoInput;
