'use client';

import Image from "next/image";
import React, { useState } from "react";

const PurposeSection = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section className="bg-[#FDFCF8] py-10 px-4 text-center text-[#1e1e1e]">
      {/* Image Placeholder */}
      <div className="max-w-4xl mx-auto">
        <div
          className="h-64 flex items-center justify-center relative w-full"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src="/images/kushtiamap.png"
            alt="Map of Kushtia"
            width={700}
            height={700}
            className="object-contain w-96"
          />

          {/* Tooltip */}
          {showTooltip && (
            <div
              className="fixed z-50 bg-black text-white text-sm px-3 py-1 rounded pointer-events-none"
              style={{
                top: cursorPos.y + 10,
                left: cursorPos.x + 10,
              }}
            >
              Map of Kushtia
            </div>
          )}
        </div>
      </div>

      {/* Section Title */}
      <div className="relative mt-6 mb-4">
        <h2 className="inline-block text-3xl font-bold text-kc-text relative z-10 px-4">
          আমাদের উদ্দেশ্য
        </h2>
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full h-12 bg-[#511944]/10 z-0" />
      </div>

      {/* Paragraph */}
      <p className="max-w-4xl mx-auto text-justify leading-relaxed text-[17px] text-[#222]">
        আমাদের প্ল্যাটফর্মটি কুষ্টিয়ার যুব শিল্পী, কুষ্টির শিল্পী, শিক্ষক,
        শিক্ষার্থী, দোনার, উদ্যোক্তা, বেকার যুবক এবং সমাজের প্রতিটি স্তরের
        মানুষের জন্য একটি ডিজিটাল কেন্দ্রবিন্দু। আমরা বিশ্বাস করি, প্রতিটি
        প্রতিভা এবং পেশাজীবী মানুষের কাছের মূল্য থাকা উচিত এবং তা আরও অনেক
        মানুষের কাছে পৌঁছানোর দরকার। এই প্ল্যাটফর্মের মাধ্যমে স্থানীয় শিল্পীরা
        তাঁদের আর্ট বিক্রি করতে পারবেন, শিক্ষকেরা কোর্স চালু করতে পারবেন,
        শিক্ষার্থীরা দক্ষতা অর্জন করতে পারবেন, এবং সমাজের যেকোনো শ্রেণির মানুষ
        নিজেদের পরিচিতি ও প্রোফাইল তৈরি করে বিভিন্ন সুযোগ সুবিধা পেতে পারবেন।
        আমাদের লক্ষ্য একটি শক্তিশালী, ডিজিটালি সংযুক্ত, এবং সহানুভূতিশীল
        কমিউনিটি গড়ে তোলা – যেখানে প্রযুক্তি ও সংস্কৃতি একসাথে এগিয়ে যায়।
      </p>
    </section>
  );
};

export default PurposeSection;
