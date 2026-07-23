import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { toBlobPath, toBlobUrl } from "@/utils/blob-path";

type ListItem = {
  pathname: string;
  url: string;
};

type UploadParams = {
  path: string;
  buffer: Buffer;
  contentType: string;
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required R2 environment variable: ${name}`);
  }
  return value;
};

const getBucketName = () => getRequiredEnv("R2_BUCKET_NAME");

const createR2Client = () => {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
};

let r2Client: S3Client | null = null;

const getR2Client = () => {
  r2Client ??= createR2Client();
  return r2Client;
};

export const uploadBlob = async ({ path, buffer, contentType }: UploadParams) => {
  const pathname = toBlobPath(path);
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: pathname,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    pathname,
    url: toBlobUrl(pathname),
  };
};

export const deleteBlob = async (url: string) => {
  if (!url) return;
  const pathname = toBlobPath(url);
  if (!pathname || pathname.startsWith("http")) return;

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: pathname,
    }),
  );
};

export const copyBlob = async (source: string, destination: string) => {
  const sourcePathname = toBlobPath(source);
  const destinationPathname = toBlobPath(destination);
  if (
    !sourcePathname ||
    !destinationPathname ||
    sourcePathname.startsWith("http") ||
    destinationPathname.startsWith("http")
  ) {
    throw new Error("Ruta de Blob invalida para copiar.");
  }

  const bucket = getBucketName();
  const encodedSource = `${bucket}/${encodeURIComponent(sourcePathname).replace(
    /%2F/g,
    "/",
  )}`;

  await getR2Client().send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: destinationPathname,
      CopySource: encodedSource,
    }),
  );

  return {
    pathname: destinationPathname,
    url: toBlobUrl(destinationPathname),
  };
};

export const blobExists = async (url: string) => {
  if (!url) return false;
  const pathname = toBlobPath(url);
  if (!pathname || pathname.startsWith("http")) return false;

  try {
    await getR2Client().send(
      new HeadObjectCommand({
        Bucket: getBucketName(),
        Key: pathname,
      }),
    );
    return true;
  } catch (error) {
    const statusCode = (error as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (statusCode === 404) return false;
    throw error;
  }
};

export const listBlob = async (prefix: string): Promise<ListItem[]> => {
  const items: ListItem[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await getR2Client().send(
      new ListObjectsV2Command({
        Bucket: getBucketName(),
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    response.Contents?.forEach((object) => {
      if (!object.Key) return;
      items.push({ pathname: object.Key, url: toBlobUrl(object.Key) });
    });
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return items;
};
