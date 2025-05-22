"use client";

import Image from "next/image";
import { useState } from "react";

const dummyCourses = [
  {
    id: "1",
    name: "Mastering React for Beginners",
    thumbnail: "/images/courses/react-course.jpg",
    videos: [
      { title: "Intro to React", videoUrl: "/videos/intro-react.mp4" },
      { title: "React Components", videoUrl: "/videos/react-components.mp4" },
    ],
  },
  {
    id: "2",
    name: "Complete Guide to Digital Painting",
    thumbnail: "/images/courses/digital-painting.jpg",
    videos: [
      { title: "Tools & Setup", videoUrl: "/videos/tools-setup.mp4" },
      { title: "Layering Techniques", videoUrl: "/videos/layering.mp4" },
    ],
  },
];

export default function ManageCourses() {
  const [courses, setCourses] = useState(dummyCourses);

  const handleDeleteVideo = (courseId: string, videoIndex: number) => {
    const updated = courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            videos: course.videos.filter((_, index) => index !== videoIndex),
          }
        : course
    );
    setCourses(updated);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleThumbnailChange = (courseId: string, file: File) => {
    alert("Simulating thumbnail update for " + courseId);
  };

  return (
    <div className="p-6 text-kc-dark">
      <h2 className="text-2xl font-bold mb-6">Manage Your Courses</h2>

      {courses.map((course) => (
        <div key={course.id} className="mb-8 p-4 border rounded shadow bg-white">
          <div className="flex gap-4 items-center mb-4">
            <Image src={course.thumbnail} alt="Course" width={120} height={80} className="rounded object-cover" />
            <div>
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleThumbnailChange(course.id, e.target.files[0])} />
            </div>
          </div>

          <ul className="space-y-2">
            {course.videos.map((video, index) => (
              <li key={index} className="flex justify-between items-center border p-2 rounded">
                <span>{video.title}</span>
                <button
                  onClick={() => handleDeleteVideo(course.id, index)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Delete Video
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
