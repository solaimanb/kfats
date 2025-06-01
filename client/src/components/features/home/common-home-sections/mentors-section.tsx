"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import courseData from "@/data/courses.json" assert { type: "json" };
import { FaChalkboardTeacher } from "react-icons/fa";
import { SectionTitle } from "@/components/common";
import { fadeIn } from "@/lib/utils/common/motion";

interface Mentor {
  name: string;
  image: string;
}

const extractUniqueMentors = () => {
  const seen = new Set();
  return courseData.courses.reduce<Mentor[]>((acc, course) => {
    if (!seen.has(course.mentor)) {
      seen.add(course.mentor);
      acc.push({
        name: course.mentor,
        image: course.mentorImage,
      });
    }
    return acc;
  }, []);
};

const MentorsSection = () => {
  const allMentors = extractUniqueMentors();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Meet Our Expert Mentors"
          subtitle="Learn from experienced professionals"
          Icon={FaChalkboardTeacher}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12">
          {allMentors.map((mentor, index) => (
            <motion.div
              variants={fadeIn("up", "spring", index * 0.2, 0.75)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              key={mentor.name}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="relative h-48">
                <Image
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {mentor.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Expert Mentor</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorsSection;
