import { diskStorage } from 'multer';
import { UPLOAD_CONFIG } from './upload.constants';
import { v4 as uuidv4 } from 'uuid';

export const anyFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: Function,
) => {
  const allowed = UPLOAD_CONFIG.ALLOWED_MIME_TYPES;
  if (Array.isArray(allowed) && allowed.length > 0) {
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
  }
  cb(null, true);
};

export const editFileName = (
  req: any,
  file: Express.Multer.File,
  cb: Function,
) => {
  const fileExtName = file.originalname.split('.').pop();
  const safeName = uuidv4();
  cb(null, fileExtName ? `${safeName}.${fileExtName}` : safeName);
};

export const multerStorage = diskStorage({
  destination: UPLOAD_CONFIG.DESTINATION,
  filename: editFileName,
});
