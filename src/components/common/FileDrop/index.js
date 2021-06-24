import React from 'react';
import './style.scss';
import API_ENDPOINTS from '../../../helpers/api_endpoints';
import axios from 'axios';
import { Delete as DeleteIcon } from '@material-ui/icons/';

class FileDrop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileCol: [],
      hovering: false,
      error: false,
      uploading: false,
      percentCompleted: 0,
    };
    this.supportedMimetypes = this.props.supportedMimetypes || [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
  }

  onSubmit = e => {
    e.preventDefault();
    this.setState(
      {
        error: false,
        uploading: true,
        percentCompleted: 0,
      },
      () => {
        const { fileCol } = this.state;
        const { parentTable, parentId, columnName } = this.props;

        const formData = new FormData();
        formData.append('table_name', parentTable);
        formData.append('parent_id', parentId);
        formData.append('column_name', columnName || null);
        Array.from(fileCol).forEach((image, index) => {
          formData.append('fileCol', image);
        });

        const config = {
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            this.setState({
              percentCompleted,
            });
          },
        };

        axios
          .post(API_ENDPOINTS.UPLOAD_FILE, formData, config)
          .then(res => {
            this.props.close();
          })
          .catch(err => {
            this.setState({
              error: err.message,
            });
          })
          .finally(() => {
            this.setState({
              uploading: false,
            });
          });
      },
    );
  };

  handleFileRemoval = file => {
    let { fileCol } = this.state;
    fileCol = fileCol.filter(f => f !== file);
    this.setState({ fileCol });
  };

  handleFileChange = e => {
    const { fileCol } = this.state;
    const newfileCol = [].concat(fileCol, [...e.target.files]);
    this.setState({ fileCol: newfileCol });
  };

  renderPreviewPhotos = () => {
    const { fileCol } = this.state;

    return Array.from(fileCol).map((image, index) => {
      const imgUrl = URL.createObjectURL(image);

      return (
        <div key={index} className="file_drop__preview__container__image">
          <DeleteIcon
            className="file_drop__preview__container__image__delete"
            onClick={() => this.handleFileRemoval(image)}
          />
          <img
            className="file_drop__preview__container__image__previewImage"
            src={imgUrl}
          />
        </div>
      );
    });
  };

  handleDrop = e => {
    e.preventDefault();
    this.setState({ hovering: false });

    // the below action cannot wait for the state and doesn't have to
    // dataTransfer is not atomic
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          if (this.supportedMimetypes.includes(file.type)) {
            const { fileCol } = this.state;
            fileCol.push(file);
            this.setState({
              fileCol,
            });
          }
        }
      }
    }
  };

  handleDragEnter = e => {
    e.preventDefault();
    this.setState({ hovering: true });
  };

  handleDragLeave = e => {
    e.preventDefault();
    this.setState({ hovering: false });
  };

  renderMainWidget() {
    const { fileCol, hovering } = this.state;

    return (
      <React.Fragment>
        {fileCol && fileCol.length > 0 && (
          <div className="file_drop__preview">
            <p>Files to upload:</p>
            <div className="file_drop__preview__container">
              {this.renderPreviewPhotos()}
            </div>
          </div>
        )}
        <label
          onDragEnter={this.handleDragEnter}
          onDragLeave={this.handleDragLeave}
          htmlFor="file_drop__dropzone_file"
          onDrop={this.handleDrop}
          className={`file_drop__dropzone${hovering ? ' hovering' : ''}`}
        >
          <p>Click or drop files here</p>
        </label>
        <input
          accept="image/jpeg,image/png,image/jpg"
          id="file_drop__dropzone_file"
          hidden
          type="file"
          multiple
          name="fileCol"
          onChange={this.handleFileChange}
        />
        <button onClick={this.onSubmit} className="orange-btn">
          Upload
        </button>
      </React.Fragment>
    );
  }

  renderUploader() {
    const { percentCompleted } = this.state;
    return (
      <div className="file_drop__uploader">
        <div style={{ width: `${percentCompleted}%` }} className="bar" />
        <span className={percentCompleted > 50 ? 'over_half' : ''}>
          {percentCompleted}%
        </span>
      </div>
    );
  }

  render() {
    const { uploading } = this.state;

    return (
      <div className="file_drop">
        {uploading ? this.renderUploader() : this.renderMainWidget()}
      </div>
    );
  }
}

export default FileDrop;
