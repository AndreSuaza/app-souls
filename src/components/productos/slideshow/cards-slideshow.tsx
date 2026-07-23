"use client";

import Image from "next/image";
import { cardImageBlurDataURL } from "@/models/images.models";
import { resolveCardImageUrl } from "@/utils/card-image";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import "./slideshow.css";

interface Props {
  images: string[];
  title: string;
  className?: string;
}

export const ProductMobileSlideshow = ({ images, title, className }: Props) => {
  return (
    <div className={className}>
      <Swiper
        style={{
          width: "90vw",
        }}
        pagination
        autoplay={{
          delay: 2500,
        }}
        modules={[FreeMode, Pagination]}
        className=""
      >
        {images.map((image) => {
          const imageSrc = resolveCardImageUrl({ imageKey: image });

          return (
          <SwiperSlide key={image}>
            <div className="m-4">
              <Image
                width={300}
                height={718}
                src={imageSrc}
                alt={title}
                title={title}
                placeholder="blur"
                blurDataURL={cardImageBlurDataURL}
                className="rounded-xl mb-10"
              />
            </div>
          </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
