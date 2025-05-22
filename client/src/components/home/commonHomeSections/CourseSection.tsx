"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import courseData from "@/data/courses.json" assert { type: "json" };
import Link from "next/link";
import { useRef } from "react";
import { motion} from "framer-motion";

// TypeScript interface for course data
interface Course {
  name: string;
  thumbnail: string;
  instructor: string;
  instructorImage: string;
  ratings: number;
  fee: string;
}

const typedCourses: Course[] = courseData.courses;

export default function CourseSection() {
  const targetRef = useRef(null);
  const [cardCount, setCardCount] = useState(6);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const updateCardCount = () => {
      const width = window.innerWidth;
      if (width >= 1536) setCardCount(8);
      else if (width >= 768) setCardCount(6);
      else setCardCount(4);
    };

    updateCardCount();
    window.addEventListener("resize", updateCardCount);
    return () => window.removeEventListener("resize", updateCardCount);
  }, []);

  return (
    <section ref={targetRef} 
      className="bg-[#FDFCF8] py-20 px-4 text-[#1e1e1e] bg-contain bg-no-repeat bg-center relative w-full overflow-hidden"
      style={{ backgroundImage: "url('/images/coursebg.png')" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto flex gap-10">
        {/* Left Panel */}
        <div className="flex flex-col items-center md:items-start justify-center w-1/3">
          <div className="relative w-48 md:w-96 2xl:w-[400px] h-[500px] 2xl:h-[600px] 2xl:-translate-x-28">
            <Image
              src="/images/dami.png"
              alt="Character pointing"
              fill
              className="object-contain"
              priority
            />
            <h2 className="absolute top-1/3 left-1/2 text-2xl md:text-3xl font-bold text-kc-text mt-4 text-shadow-xs text-shadow-amber-950 text-center md:text-left">
              আমাদের <br /> কোর্সসমূহ →
            </h2>
          </div>
        </div>

        {/* Right Panel */}
        <motion.div
        initial={{opacity: 0, x:60}}
            whileInView={{opacity: 1, x:0}}
            transition={{duration:1}}
         className="w-2/3 overflow-hidden">
          <div
            className="relative"
            style={{
              transform: "perspective(1200px) rotateY(-22deg) scale(0.85)",
              transformOrigin: "left center",
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-5 translate-x-2">
              {typedCourses.slice(0, cardCount).map((course, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedCourse(course)}
                  className="h-72 w-full bg-white rounded-lg shadow-md p-2 flex flex-col items-center justify-start transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
                >
                  {/* Thumbnail - show full image */}
                  <div className="w-full h-28 relative rounded-md overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <h3 className="text-center text-sm font-semibold mt-2 px-2 line-clamp-2">
                    {course.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-700">
                    <div className="w-6 h-6 relative rounded-full overflow-hidden border">
                      <Image
                        src={course.instructorImage}
                        alt={course.instructor}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[0.75rem]">{course.instructor}</span>
                  </div>

                  <div className="mt-1 text-xs text-gray-600">
                    💳 {course.fee} ৳ &nbsp;&nbsp; ⭐ {course.ratings}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto mb-2">
                    <button className="bg-kc-orange text-white text-sm font-semibold px-4 py-1 rounded hover:bg-orange-600 transition-colors">
                      Apply now
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View More Button */}
          <div className="text-right mt-6">
            <Link href="/courses">
            <button className="text-kc-text font-semibold hover:text-kc-green text-lg flex items-center justify-end gap-2">
              আরো দেখুন <span className="text-xl">→</span>
            </button>
            </Link>
            
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-red-500"
            >
              ×
            </button>

            <div className="w-full h-40 relative mb-4 rounded-md overflow-hidden">
              <Image
                src={selectedCourse.thumbnail}
                alt={selectedCourse.name}
                fill
                className="object-contain"
              />
            </div>

            <h2 className="text-lg font-bold mb-2">{selectedCourse.name}</h2>
            <p className="text-sm text-gray-700 mb-1">
              Instructor: {selectedCourse.instructor}
            </p>
            <p className="text-sm text-gray-700 mb-1">💳 {selectedCourse.fee} ৳</p>
            <p className="text-sm text-gray-700 mb-4">⭐ {selectedCourse.ratings}</p>
            
            <button className="w-full bg-kc-orange text-white py-2 rounded hover:bg-orange-600 transition">
              Apply Now
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
