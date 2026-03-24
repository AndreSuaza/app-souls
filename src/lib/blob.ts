import { del, list, put } from "@vercel/blob";

type ListItem = {
  pathname: string;
  url: string;
};

type UploadParams = {
  path: string;
  buffer: Buffer;
  contentType: string;
};

export const uploadBlob = async ({ path, buffer, contentType }: UploadParams) =>
  put(path, buffer, {
    access: "public",
    contentType,
  });

export const deleteBlob = async (url: string) => {
  if (!url) return;
  await del(url);
};

export const listBlob = async (prefix: string): Promise<ListItem[]> => {
  const items: ListItem[] = [];
  let cursor: string | undefined;

  do {
    const response = await list({
      prefix,
      cursor,
      limit: 1000,
    });
    response.blobs.forEach((blob) => {
      items.push({ pathname: blob.pathname, url: blob.url });
    });
    cursor = response.cursor ?? undefined;
  } while (cursor);

  return items;
};
