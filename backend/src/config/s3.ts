import { config } from './index';

export const s3Config = {
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
  region: config.aws.region,
  bucket: config.aws.s3Bucket,
};
