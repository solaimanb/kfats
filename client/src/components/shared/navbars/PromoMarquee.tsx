'use client';

import React from 'react';

const promotionalAds: string[] = [
  '৫০% ছাড় সব কোর্সে!',
  'ফ্রি ওয়ার্কশপে রেজিস্টার করুন!',
  'নতুন কোর্স – এখনই শুরু করুন!',
  'সার্টিফিকেটসহ কোর্স সম্পূর্ণ করুন!',
  'আজই জয়েন করুন আমাদের কমিউনিটিতে!',
  'সীমিত সময়ের অফার!',
];

const PromoMarquee: React.FC = () => {
  return (
    <div className="bg-kc-green text-white text-sm py-1 marquee">
      <div className="marquee-content">
        {/* Render the ads twice for seamless loop */}
        {[...promotionalAds, ...promotionalAds].map((text, index) => (
          <span key={index} className="inline-block mr-8 px-2">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoMarquee;
