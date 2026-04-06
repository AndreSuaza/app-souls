export type MediaSectionKey =
  | "news-banners"
  | "news-cards"
  | "profile-avatars"
  | "profile-banners"
  | "products"
  | "cards";

type MediaSectionConfig = {
  label: string;
  folder: string;
  maxSizeMb: number;
  allowUpload: boolean;
  allowDelete: boolean;
};

export const MEDIA_SECTION_CONFIG: Record<MediaSectionKey, MediaSectionConfig> =
  {
    "news-banners": {
      label: "Banners",
      folder: "souls/news/banners",
      maxSizeMb: 8,
      allowUpload: true,
      allowDelete: true,
    },
    "news-cards": {
      label: "Cards",
      folder: "souls/news/cards",
      maxSizeMb: 4,
      allowUpload: true,
      allowDelete: true,
    },
    "profile-avatars": {
      label: "Avatares",
      folder: "souls/profile/avatars",
      maxSizeMb: 2,
      allowUpload: true,
      allowDelete: true,
    },
    "profile-banners": {
      label: "Banners de perfil",
      folder: "souls/profile/banners",
      maxSizeMb: 6,
      allowUpload: true,
      allowDelete: true,
    },
    products: {
      label: "Productos",
      folder: "souls/products",
      maxSizeMb: 6,
      allowUpload: true,
      allowDelete: true,
    },
    cards: {
      label: "Cartas",
      folder: "souls/cards",
      maxSizeMb: 2,
      allowUpload: false,
      allowDelete: false,
    },
  };

export const MEDIA_GROUPS: Array<{
  id: string;
  label: string;
  sections: MediaSectionKey[];
}> = [
  {
    id: "news",
    label: "Noticias",
    sections: ["news-banners", "news-cards"],
  },
  {
    id: "profile",
    label: "Perfil",
    sections: ["profile-avatars", "profile-banners"],
  },
  {
    id: "products",
    label: "Productos",
    sections: ["products"],
  },
  {
    id: "cards",
    label: "Cartas",
    sections: ["cards"],
  },
];
