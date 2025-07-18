import crypto from 'crypto';

export class EncryptionService {
  private keyId: string;
  private algorithm = 'aes-256-gcm';

  constructor() {
    this.keyId = process.env.KMS_KEY_ID || '';
  }

  async encryptSensitiveData(data: any): Promise<EncryptedData> {
    try {
      const plaintext = JSON.stringify(data);
      const iv = crypto.randomBytes(16);

      const dataKey = await this.generateDataKey();

      const cipher = crypto.createCipher(this.algorithm, dataKey.plaintext);
      cipher.setAAD(Buffer.from('additional-auth-data'));

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        encryptedDataKey: dataKey.ciphertext,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  async decryptSensitiveData(encryptedData: EncryptedData): Promise<any> {
    try {
      const dataKey = await this.decryptDataKey(encryptedData.encryptedDataKey);

      const decipher = crypto.createDecipher(encryptedData.algorithm, dataKey);
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      decipher.setAAD(Buffer.from('additional-auth-data'));

      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  private async generateDataKey(): Promise<{ plaintext: Uint8Array; ciphertext: string }> {
    const plaintext = crypto.randomBytes(32);

    return {
      plaintext,
      ciphertext: Buffer.from(plaintext).toString('base64')
    };
  }

  private async decryptDataKey(encryptedKey: string): Promise<Uint8Array> {
    return Buffer.from(encryptedKey, 'base64');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512');
    return hash === verifyHash.toString('hex');
  }
}

export interface EncryptedData {
  encryptedData: string;
  encryptedDataKey: string;
  iv: string;
  authTag: string;
  algorithm: string;
}
