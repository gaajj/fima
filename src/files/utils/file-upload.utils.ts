import { diskStorage } from 'multer';
import { UPLOAD_CONFIG } from './upload.constats';
import { v4 as uuidv4 } from 'uuid';

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: Function,
) => {
  if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPG and PNG files are allowed.'), false);
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
  cb(null, `${safeName}.${fileExtName}`);
};

export const multerStorage = diskStorage({
  destination: UPLOAD_CONFIG.DESTINATION,
  filename: editFileName,
});
