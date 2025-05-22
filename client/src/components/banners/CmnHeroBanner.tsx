'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';

const vectorImages = [
  '/images/artists/artist1.png',
  '/images/artists/artist2.png',
  '/images/artists/artist3.png',
  '/images/artists/artist4.png',
  // add more as needed
];

const CmnHeroBanner = () => {
  return (
    <section
      className="relative flex w-full min-h-[90vh] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/navbg.jpg')" }}
    >

      {/* Content Wrapper */}
      <div className="relative flex w-full flex-col md:flex-row z-10 border-b-2 border-amber-800">
        {/* Left Vector Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
  <div className="-translate-x-14"> {/* Shift left by 6 units (1.5rem) */}
    <Swiper
      modules={[Autoplay]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      loop={true}
      className="w-96 h-96"
    >
      {vectorImages.map((src, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={`Vector ${index + 1}`}
              width={385}
              height={385}
              className="object-contain"
              priority={index === 0}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
</div>


        {/* Right Content Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 text-center">
          <div className="text-2xl md:text-3xl font-semibold text-kc-text leading-relaxed mb-6">
            “কুষ্টিয়ার শিল্প, শিক্ষা ও <br /> সমাজ উন্নয়নের <br /> ডিজিটাল প্ল্যাটফর্ম”
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button className="bg-white border border-kc-text text-kc-text hover:border-kc-green hover:text-kc-green px-6 py-2 rounded cursor-pointer">
              আমাদের কোর্সগুলো দেখুন
            </button>
            <button className="bg-kc-text hover:bg-kc-green text-white px-6 py-2 rounded cursor-pointer">
              আমাদের সাথে যুক্ত হোন
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CmnHeroBanner;
