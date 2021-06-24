import API from './api';

const PhotoUtils = {};

PhotoUtils.uploadFile = function(formData) {
  return API.uploadFiles(formData);
};

PhotoUtils.getPhoto = function(parentTable, parentId) {
  return API.getFiles(parentTable, parentId);
};

PhotoUtils.extractPhotosFromFiles = files => {
  const mimetypes = ['image/jpg', 'image/jpeg', 'image/png'];
  return files.filter(file => mimetypes.includes(file.mimetype));
};

export default PhotoUtils;
