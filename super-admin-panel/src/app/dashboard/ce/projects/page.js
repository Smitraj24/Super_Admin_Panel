"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const projects = [
  {
    title: "Wanderlust",
    desc: "Travel listing platform with authentication, CRUD operations, and secure password hashing.",
    tech: "Node.js, Express, MongoDB, Passport.js",
    live: "#",
    github: "https://github.com/Smitraj24/wanderlust.git",
  },
  {
    title: "Zerodha Clone",
    desc: "Frontend clone of Zerodha with responsive UI and modern design.",
    tech: "React, Tailwind CSS",
    live: "#",
    github: "#",
  },
  {
    title: "Password Manager",
    desc: "Secure app to store and manage passwords with encryption.",
    tech: "React, Node.js",
    live: "#",
    github: "https://github.com/Smitraj24/PasswordManager.git",
  },
  {
    title: "Mini Weather App",
    desc: "Weather app using real-time API to show temperature and conditions.",
    tech: "React, API",
    live: "#",
    github: "https://github.com/Smitraj24/Weather-App-mini-Project.git",
  },
];

function Projects() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Sidebar />
      <Navbar />

      <div className="lg:ml-64 mt-20 px-4 md:px-8 py-10">
        
        <section className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Our Projects
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            A collection of real-world and practice projects
          </p>
        </section>

        <section className="max-w-6xl mx-auto mt-12 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="
                group
                bg-white/70 backdrop-blur-lg
                border border-gray-200
                rounded-2xl p-6
                shadow-md
                transition-all duration-300
                hover:-translate-y-2
                hover:shadow-xl
                hover:border-indigo-400
              "
            >
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600">
                {project.title}
              </h2>

              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                {project.desc}
              </p>

              <p className="text-xs text-indigo-500 mt-4 font-medium">
                ⚙️ {project.tech}
              </p>

              <div className="flex gap-3 mt-6">
                <a
                  href={project.live}
                  target="_blank"
                  className="
                    flex-1 text-center
                    px-4 py-2 rounded-lg
                    bg-indigo-500 text-white text-sm
                    hover:bg-indigo-600
                    transition
                  "
                >
                  Live Demo
                </a>

                <a
                  href={project.github}
                  target="_blank"
                  className="
                    flex-1 text-center
                    px-4 py-2 rounded-lg
                    border border-gray-300 text-sm
                    hover:border-indigo-500 hover:text-indigo-600
                    transition
                  "
                >
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Projects;
