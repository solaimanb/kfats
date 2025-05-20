"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AiOutlineDoubleRight } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import courseData from "@/data/courses.json" assert { type: "json" };

interface Instructor {
  name: string;
  image: string;
}

const extractUniqueInstructors = () => {
  const seen = new Set<string>();
  return courseData.courses.reduce<Instructor[]>((acc, course) => {
    if (!seen.has(course.instructor)) {
      seen.add(course.instructor);
      acc.push({
        name: course.instructor,
        image: course.instructorImage,
      });
    }
    return acc;
  }, []);
};

export default function MentorsSection() {
    const targetRef = useRef(null);
  const allMentors = extractUniqueInstructors();
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward

  const handleNext = () => {
    setDirection(1);
    if (startIndex + 4 < allMentors.length) {
      setStartIndex(startIndex + 4);
    } else {
      setStartIndex(0); // Loop back to start
    }
  };

  const visibleMentors = allMentors.slice(startIndex, startIndex + 4);

  return (
    <section ref={targetRef} className="py-16 bg-white text-center">
      <div className="relative mt-6 mb-4">
        <h2 className="inline-block text-3xl font-bold text-kc-text relative z-10 px-4">
          আমাদের মেন্টরগণ
        </h2>
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full h-12 bg-[#511944]/10 z-0" />
      </div>     

      <motion.div
      initial={{opacity: 0, x:50}}
            whileInView={{opacity: 1, x:0}}
            transition={{duration:1}}
       className="relative max-w-6xl mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={startIndex} // changing this triggers animation
            initial={{ x: direction === 1 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 1 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center justify-center"
          >
            {visibleMentors.map((mentor, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-36 h-36 md:w-48 md:h-48 2xl:w-64 2xl:h-64 rounded-full overflow-hidden border-4 border-kc-green relative">
                  <Image
                    src={mentor.image}
                    alt={mentor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-sm md:text-base text-kc-text font-bold">
                  {mentor.name}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNext}
          className="absolute top-1/2 right-1 transform -translate-y-1/2 bg-kc-green text-white p-2 rounded-full shadow-md hover:bg-green-700 transition"
        >
          <AiOutlineDoubleRight className="w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
}
