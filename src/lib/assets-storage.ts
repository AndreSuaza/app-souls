import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { toAssetPath, toAssetStorageUrl } from "@/utils/asset-path";

type ListItem = {
  pathname: string;
  url: string;
};

type UploadParams = {
  path: string;
  buffer: Buffer;
  contentType: string;
  cacheControl?: string;
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

export const uploadAsset = async ({
  path,
  buffer,
  contentType,
  cacheControl = "public, max-age=31536000, immutable",
}: UploadParams) => {
  const pathname = toAssetPath(path);
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: pathname,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );

  return {
    pathname,
    url: toAssetStorageUrl(pathname),
  };
};

export const deleteAsset = async (url: string) => {
  if (!url) return;
  const pathname = toAssetPath(url);
  if (!pathname || pathname.startsWith("http")) return;

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: pathname,
    }),
  );
};

export const copyAsset = async (source: string, destination: string) => {
  const sourcePathname = toAssetPath(source);
  const destinationPathname = toAssetPath(destination);
  if (
    !sourcePathname ||
    !destinationPathname ||
    sourcePathname.startsWith("http") ||
    destinationPathname.startsWith("http")
  ) {
    throw new Error("Ruta de R2 invalida para copiar.");
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
    url: toAssetStorageUrl(destinationPathname),
  };
};

export const assetExists = async (url: string) => {
  if (!url) return false;
  const pathname = toAssetPath(url);
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

export const listAssets = async (prefix: string): Promise<ListItem[]> => {
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
      items.push({ pathname: object.Key, url: toAssetStorageUrl(object.Key) });
    });
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return items;
};
