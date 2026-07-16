import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getRequiredEnv, loadLocalEnv } from "./env";

loadLocalEnv();

export const getBucketName = () => getRequiredEnv("R2_BUCKET_NAME");

export const createR2Client = () =>
  new S3Client({
    region: "auto",
    endpoint: `https://${getRequiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

export const putObject = async (input: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}) => {
  const client = createR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: input.cacheControl,
    }),
  );
};

export const headObject = async (key: string) => {
  const client = createR2Client();
  return client.send(
    new HeadObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
};
