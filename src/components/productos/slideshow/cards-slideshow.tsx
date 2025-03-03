'use client';

import Image from 'next/image';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Pagination } from 'swiper/modules';


import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import './slideshow.css';



interface Props {
  images: string[];
  title: string;
  className?: string;
}



export const ProductMobileSlideshow = ( { images, title, className }: Props ) => {


  return (
    <div className={ className }>

      <Swiper
        style={{
          width: '90vw',
        }}
        pagination
        autoplay={{
          delay: 2500
        }}
        modules={ [ FreeMode, Pagination ] }
        className=""
      >

        {
          images.map( image => (
            <SwiperSlide key={ image }>
                <div className='m-4'>
                    <Image
                        width={ 300 }
                        height={ 718 }
                        src={ `/cards/${ image }` }
                        alt={ title }
                        className="rounded-xl mb-10"
                    />
                </div>
            </SwiperSlide>

          ) )
        }
      </Swiper>



    </div>
  );
};