"use client";

import { useState } from "react";
import Image from "next/image";

export default function PostCourse() {
  const [courseName, setCourseName] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videos, setVideos] = useState([{ title: "", video: null as File | null }]);

  const handleVideoChange = (index: number, file: File | null) => {
    const newVideos = [...videos];
    newVideos[index].video = file;
    setVideos(newVideos);
  };

  const handleVideoTitleChange = (index: number, title: string) => {
    const newVideos = [...videos];
    newVideos[index].title = title;
    setVideos(newVideos);
  };

  const addVideoField = () => {
    setVideos([...videos, { title: "", video: null }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ courseName, thumbnail, videos });
    alert("Course posted!");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-3xl mx-auto text-kc-dark">
      <h2 className="text-xl font-bold mb-4">Post a New Course</h2>

      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        required
      />

      <div className="mb-4">
        <label className="block mb-1 font-medium">Course Thumbnail</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
        {thumbnail && (
          <Image
            src={URL.createObjectURL(thumbnail)}
            alt="Thumbnail Preview"
            width={150}
            height={100}
            className="mt-2 rounded object-cover"
          />
        )}
      </div>

      <div className="space-y-4">
        {videos.map((video, index) => (
          <div key={index}>
            <input
              className="w-full p-2 border rounded mb-1"
              placeholder="Video Title"
              value={video.title}
              onChange={(e) => handleVideoTitleChange(index, e.target.value)}
            />
            <input type="file" accept="video/*" onChange={(e) => handleVideoChange(index, e.target.files?.[0] || null)} />
          </div>
        ))}
      </div>

      <button type="button" onClick={addVideoField} className="text-blue-600 mt-2 underline">
        + Add Another Video
      </button>

      <button type="submit" className="mt-6 bg-kc-green text-white px-4 py-2 rounded">
        Post Course
      </button>
    </form>
  );
}
