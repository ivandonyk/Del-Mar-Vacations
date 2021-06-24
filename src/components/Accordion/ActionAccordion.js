import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import {
  getFiles,
  updateAction,
  deleteFile,
  toggleGalleryModal,
  getIssuesWithUnscheduledActions,
} from '../../actions';
import FileDrop from '../common/FileDrop';
import { Delete as DeleteIcon } from '@material-ui/icons/';
import checkmark_complete from '../../assets/checkmark_complete.svg';
import scheduled from '../../assets/scheduled.png';
import minusIcon from '../../assets/minus_red.svg';
import plusIcon from '../../assets/plus.svg';
import arrowDown from '../../assets/arrow-down.svg';
import demoImage from '../../assets/demo-lrg.png';
import greenCheckmark from '../../assets/checkmark.svg';
import greenClock from '../../assets/clock-green.svg';

import './style.scss';

const initialState = {
  active: false,
  height: '30px',
  rotate: 'accordion-icon',
  photoUploaderOpen: false,
};

class ActionAccordion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      height: '30px',
      rotate: 'accordion-icon',
      photoUploaderOpen: false,
      nextSteps: props.action
        ? props.action.nextSteps
          ? props.action.nextSteps
          : ''
        : '',
    };
    this.content = React.createRef();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.action.status !== 'complete' &&
      nextProps.action.status === 'complete'
    ) {
      this.setState({
        ...initialState,
      });
    }
  }

  formatTime = (timeStart, timeEnd) => {
    if (!timeStart) {
      return 'Not scheduled';
    }

    const startHr = new moment(timeStart).utc().format('HH:mm A');
    const endHr = new moment(timeEnd).utc().format('HH:mm A');
    return `${startHr} - ${endHr}`;
  };

  toggleAccordion = () => {
    const { active } = this.state;
    this.setState({
      active: !active,
      height: active ? '30px' : `${this.content.current.scrollHeight}px`,
      rotate: active ? 'accordion-icon' : 'accordion-icon rotate',
    });
  };

  togglePhotoUploader = () => {
    this.props.getFiles('Actions', this.props.action.id);
    this.setState({
      photoUploaderOpen: !this.state.photoUploaderOpen,
    });
  };

  deleteFile = id => {
    this.props.deleteFile(id);
  };

  markComplete = () => {
    const { id } = this.props.action;
    this.props.updateAction(id, {
      nextSteps: this.state.nextSteps,
      status: 'complete',
    });
  };

  isPhotoChecked = key => {
    const { currentPhotos } = this.props;
    return currentPhotos.find(photo => photo.key === key);
  }

  renderPresentationalView = () => {
    const {
      toggleGalleryModal,
      drmUsers,
      files,
      action,
      onSelectPhoto = () => {},
    } = this.props;
    const {
      id,
      goal,
      instructions,
      description,
      assignedUser,
      timeStart,
      timeEnd,
      status,
    } = action;
    const { active, height, rotate, photoUploaderOpen } = this.state;
    const user = drmUsers.data.find(u => u.id === assignedUser);

    const photos = (files.data || []).filter(
      file =>
        file.parent_id === id &&
        file.table_name === 'Actions' &&
        file.column_name === 'action_photo',
    );

    const date = new moment(timeStart).utc().format('ddd, MMM DD');
    const diff = new moment(timeEnd).utc().diff(new moment(timeStart).utc(), 'minutes');
    const hours = diff ? `${diff / 60} hours` : 'Unscheduled';
    return (
      <div className="accordion-section presentational">
        <div className="accordion-tittle">
          <button
            className={`accordion ${active ? 'active' : 's'}`}
            onClick={this.toggleAccordion}
          >
            <h2>
              <img className={`${rotate}`} src={arrowDown} />
              Goal
            </h2>
          </button>
          <p>{goal}</p>
        </div>

        <div
          ref={this.content}
          style={{ maxHeight: `${height}` }}
          className="accordion-content"
        >
          <div className="accordion-description">
            <p>{description}</p>
          </div>
        </div>
        <div className="accordion-footer" style={{ marginLeft: 0 }}>
          <div>
            <img src={status === 'complete' ? greenCheckmark : scheduled} />
            <p> {timeStart ? date : 'Not scheduled'}</p>
          </div>
          <div>
            <img src={greenClock} />
            <p>{hours}</p>
          </div>
          <div>
            <p className="grey-box">
              {user
                ? user.firstname && user.lastname
                  ? `${user.firstname} ${user.lastname}`
                  : user.username
                : 'Unknown user'}
            </p>
          </div>
        </div>
        {active && (
          <React.Fragment>
            <div className="instructions">
              <h2>Instructions</h2>
              <p className="pre-line">{instructions}</p>
            </div>

            <div className="estimates-notes">
              <h2>Notes</h2>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit.
              </p>
            </div>

            <div className="accordion-photos" style={{ padding: 0 }}>
              <div
                className="accordion-photos_photos"
                style={{ borderRight: 0 }}
              >
                <h1 className="orange-txt">{photos.length} Photos</h1>
                <div className="accordion-photos-wrapper">
                  {photos.map((photo, index) => (
                    <div
                      // onClick={() => toggleGalleryModal(photos)}
                      className="delete-icon-wrapper pointer photos-attach_images_image"
                      key={index}
                    >
                      <span>
                        <input
                          defaultChecked={this.isPhotoChecked(photo.key)}
                          type="checkbox"
                          onChange={() => onSelectPhoto(photo)}
                        />
                      </span>
                      <img src={`/file/${photo.key}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  };

  render() {
    const {
      toggleGalleryModal,
      drmUsers,
      files,
      action,
      isPresentational = false,
      editAction,
    } = this.props;
    const {
      id,
      goal,
      instructions,
      description,
      assignedUser,
      timeStart,
      timeEnd,
      status,
    } = action;
    const { active, height, rotate, photoUploaderOpen, nextSteps } = this.state;
    const user = drmUsers.data.find(u => u.id === assignedUser);

    const photos = (files.data || []).filter(
      file =>
        file.parent_id === id &&
        file.table_name === 'Actions' &&
        file.column_name === 'action_photo',
    );

    const date = new moment(timeStart).utc().format('ddd, MMM DD');

    if (isPresentational) return this.renderPresentationalView();
    return (
      <div className="accordion-section non_presentational">
        <div className="accordion-tittle">
          <button
            className={`accordion ${active ? 'active' : 's'}`}
            onClick={this.toggleAccordion}
          >
            <h2>
              <img className={`${rotate}`} src={arrowDown} />
              Goal
            </h2>
          </button>
          <p>{goal}</p>
        </div>

        <div
          ref={this.content}
          style={{ maxHeight: `${height}` }}
          className="accordion-content"
        >
          <div className="accordion-description">
            <p>{description}</p>
          </div>
        </div>
        <div className="accordion-footer">
          <div>
            <img src={status === 'complete' ? greenCheckmark : scheduled} />
            <p> {timeStart ? date : 'Not scheduled'}</p>
          </div>
          <div>
            <img src={greenClock} />
            <p>{this.formatTime(timeStart, timeEnd)}</p>
          </div>
          <div>
            <p className="grey-box">
              {user
                ? user.firstname && user.lastname
                  ? `${user.firstname} ${user.lastname}`
                  : user.username
                : 'Unknown user'}
            </p>
          </div>

          <div>
            <p className="orange-txt">{photos.length} photos</p>
          </div>
          <div>
            <button 
            onClick={() => editAction(action)}
            className="empty-btn blue edit-action">
              Edit Action
            </button>
          </div>
        </div>
        {active && (
          <React.Fragment>
            <div className="instructions">
              <h2>Instructions</h2>
              <p className="pre-line">{instructions}</p>
            </div>

            <div className="accordion-photos">
              <div className="accordion-photos_photos">
                <h1 className="orange-txt">{photos.length} Photos</h1>
                <div className="accordion-photos-wrapper">
                  {photos.map((photo, index) => (
                    <div
                      onClick={() => toggleGalleryModal(photos)}
                      className="delete-icon-wrapper pointer"
                      key={index}
                    >
                      <DeleteIcon
                        className="delete-icon"
                        onClick={e => {
                          e.preventDefault();
                          this.deleteFile(photo.id);
                        }}
                      />
                      <img src={`/file/${photo.key}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="accordion-photos_receipt">
                <h1 className="orange-txt">1 Receipt</h1>
                <div>
                  <img src={demoImage} />
                </div>
              </div>
            </div>
            <div className="accordion-uploader-wrapper">
              <button
                className="orange-txt-btn mb-1"
                onClick={this.togglePhotoUploader}
              >
                <img
                  className="open-full-wrapper_body_inner_description_photos_toggle-icon"
                  src={photoUploaderOpen ? minusIcon : plusIcon}
                />
                {photoUploaderOpen ? 'Collapse' : 'Add Photos'}
              </button>
              {photoUploaderOpen ? (
                <FileDrop
                  columnName="action_photo"
                  parentTable="Actions"
                  parentId={id}
                  close={this.togglePhotoUploader}
                />
              ) : null}
            </div>

            <div className="next-steps">
              {status === 'complete' ? (
                <div className="next-steps-complete">
                  <h2>Next Steps</h2>
                  <p>{nextSteps || ''}</p>
                </div>
              ) : (
                <textarea
                  value={nextSteps || ''}
                  onChange={e => this.setState({ nextSteps: e.target.value })}
                  placeholder="How was this action completed or resolved? Are there next steps?"
                />
              )}
            </div>

            <div className="complete-section">
              <div className="complete-wrapper">
                {status === 'complete' ? (
                  <span className="action_accordion-complete">
                    <span>Complete</span>
                    <img src={greenCheckmark} />
                  </span>
                ) : (
                  <React.Fragment>
                    <button className="empty-btn blue">Cancel</button>
                    <button
                      onClick={this.markComplete}
                      className="border-btn blue"
                    >
                      <img src={checkmark_complete} />
                      Complete
                    </button>
                  </React.Fragment>
                )}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ drmUsers, files }) => ({ drmUsers, files });

export default connect(mapStateToProps, {
  getFiles,
  deleteFile,
  toggleGalleryModal,
  getIssuesWithUnscheduledActions,
  updateAction,
})(ActionAccordion);
