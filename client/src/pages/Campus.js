import React, { useState } from "react";

// ================= GALLERY DATA =================
const campusImages = [
  {
    id: 1,
    category: "Infrastructure",
    src: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086",
    title: "Main Administrative Block",
    desc: "The heart of our campus, housing administrative offices and conference halls."
  },
  {
    id: 2,
    category: "Labs",
    src: "https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=2070",
    title: "Advanced Robotics Lab",
    desc: "Equipped with latest automation tools for engineering students."
  },
  {
    id: 3,
    category: "Library",
    src: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070",
    title: "Central Digital Library",
    desc: "A quiet space with over 50,000 books and digital access to global journals."
  },
  {
    id: 4,
    category: "Sports",
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070",
    title: "Indoor Sports Complex",
    desc: "Facilities for badminton, table tennis, and a fully equipped gym."
  },
  {
    id: 5,
    category: "Student Life",
    src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070",
    title: "Student Lounge & Cafeteria",
    desc: "A vibrant space for students to relax, collaborate, and enjoy healthy meals."
  },
  {
    id: 6,
    category: "Infrastructure",
    src: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070",
    title: "Smart Classrooms",
    desc: "Air-conditioned classrooms with projectors and smart boards."
  },
  {
    id: 7,
    category: "Labs",
    src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070",
    title: "Chemistry & Biotech Lab",
    desc: "State-of-the-art safety equipment for advanced research."
  },
  {
    id: 8,
    category: "Student Life",
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070",
    title: "Green Campus Gardens",
    desc: "Lush green spaces promoting a peaceful environment for study."
  },
  {
    id: 9,
    category: "Events",
    src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070",
    title: "Open Air Amphitheater",
    desc: "The venue for our annual cultural fests and convocation ceremonies."
  }
];

const Campus = () => {
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Infrastructure", "Labs", "Library", "Sports", "Student Life"];

  const filteredImages = filter === "All" 
    ? campusImages 
    : campusImages.filter(img => img.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ================= HEADER ================= */}
      <div className="bg-red-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Explore Our Campus</h1>
          <p className="text-red-200 text-lg max-w-2xl mx-auto">
            Experience the world-class infrastructure and vibrant atmosphere at SDJIC.
          </p>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                filter === cat
                  ? "bg-red-700 text-white shadow-md transform scale-105"
                  : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ================= PHOTO GRID ================= */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredImages.map((image) => (
            <div key={image.id} className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
              <div className="relative overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.title} 
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {image.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{image.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {image.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Campus;