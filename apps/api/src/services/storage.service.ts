import fs from 'fs';
import path from 'path';

export interface StorageResult {
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface IStorageService {
  saveFile(file: Express.Multer.File, subfolder?: string): Promise<StorageResult>;
  deleteFile(filePath: string): Promise<boolean>;
}

export class LocalStorageService implements IStorageService {
  private baseUploadDir: string;

  constructor() {
    this.baseUploadDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  public async saveFile(file: Express.Multer.File, subfolder: string = ''): Promise<StorageResult> {
    const targetDir = path.join(this.baseUploadDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const destination = path.join(targetDir, uniqueFileName);

    if (file.buffer) {
      await fs.promises.writeFile(destination, file.buffer);
    }

    const relativePath = `/uploads/${subfolder ? subfolder + '/' : ''}${uniqueFileName}`;

    return {
      filePath: relativePath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(__dirname, '../../', filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
    } catch {
      // Ignore errors in dev
    }
    return false;
  }
}
