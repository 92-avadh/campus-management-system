import React, { useState } from "react";
import ApplyModal from "../components/ApplyModal";

// ================= COURSE DATA =================
const courses = [
  {
    id: 1,
    title: "Bachelor of Computer Applications (BCA)",
    category: "Technology",
    duration: "3 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070",
    description: "Master the fundamentals of computer science, software development, and web technologies.",
    details: {
      eligibility: "10+2 from a recognized board with min 50% marks.",
      fees: "₹45,000 per semester",
      syllabus: ["C Programming", "Data Structures", "Web Development", "DBMS", "Java & Python"],
      careers: ["Software Developer", "Web Designer", "System Analyst", "Network Administrator"]
    }
  },
  {
    id: 2,
    title: "Bachelor of Business Administration (BBA)",
    category: "Management",
    duration: "3 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032",
    description: "Develop leadership skills and business acumen to thrive in the corporate world.",
    details: {
      eligibility: "10+2 in any stream with English as a subject.",
      fees: "₹40,000 per semester",
      syllabus: ["Principles of Management", "Marketing", "Financial Accounting", "HR Management", "Business Law"],
      careers: ["HR Executive", "Marketing Manager", "Business Consultant", "Sales Executive"]
    }
  },
  {
    id: 3,
    title: "B.Tech in Computer Science",
    category: "Engineering",
    duration: "4 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070",
    description: "A comprehensive engineering program focusing on AI, Machine Learning, and Software Engineering.",
    details: {
      eligibility: "10+2 with Physics, Chemistry, and Math (PCM).",
      fees: "₹85,000 per semester",
      syllabus: ["Engineering Math", "Digital Logic", "OS", "Artificial Intelligence", "Compiler Design"],
      careers: ["Software Engineer", "Data Scientist", "AI Specialist", "Cloud Architect"]
    }
  },
  {
    id: 4,
    title: "Bachelor of Commerce (B.Com)",
    category: "Commerce",
    duration: "3 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070",
    description: "Gain expertise in accounting, finance, taxation, and economics.",
    details: {
      eligibility: "10+2 with Commerce stream.",
      fees: "₹25,000 per semester",
      syllabus: ["Financial Accounting", "Microeconomics", "Business Statistics", "Taxation Law", "Auditing"],
      careers: ["Accountant", "Tax Consultant", "Financial Analyst", "Banker"]
    }
  },
  {
    id: 5,
    title: "M.Sc in Information Technology",
    category: "Technology",
    duration: "2 Years",
    level: "Postgraduate",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070",
    description: "Advanced studies in IT infrastructure, cloud computing, and enterprise software.",
    details: {
      eligibility: "BCA / B.Sc (IT/CS) graduates.",
      fees: "₹55,000 per semester",
      syllabus: ["Advanced Java", "Cloud Computing", "Cyber Security", "Mobile App Development", "Big Data"],
      careers: ["IT Project Manager", "Cyber Security Analyst", "Cloud Engineer", "Senior Developer"]
    }
  },
  {
    id: 6,
    title: "Master of Business Administration (MBA)",
    category: "Management",
    duration: "2 Years",
    level: "Postgraduate",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070",
    description: "Specializations available in Marketing, Finance, HR, and International Business.",
    details: {
      eligibility: "Any Graduate with valid entrance score (CAT/CMAT).",
      fees: "₹1,20,000 per semester",
      syllabus: ["Strategic Management", "Corporate Finance", "Consumer Behavior", "Operations Research", "Leadership"],
      careers: ["Investment Banker", "Marketing Director", "Operations Manager", "Entrepreneur"]
    }
  },
  {
    id: 7,
    title: "B.Sc in Data Science",
    category: "Science",
    duration: "3 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070",
    description: "Learn to analyze complex data sets and derive actionable insights for businesses.",
    details: {
      eligibility: "10+2 with Mathematics/Statistics.",
      fees: "₹60,000 per semester",
      syllabus: ["Probability & Statistics", "Python for Data Science", "Machine Learning", "Data Visualization", "SQL"],
      careers: ["Data Analyst", "Business Intelligence Developer", "Data Engineer", "Statistician"]
    }
  },
  {
    id: 8,
    title: "B.Des in Fashion Design",
    category: "Arts & Design",
    duration: "4 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=2059",
    description: "Explore creativity and style with our comprehensive fashion design curriculum.",
    details: {
      eligibility: "10+2 in any stream with creative aptitude.",
      fees: "₹75,000 per semester",
      syllabus: ["Textile Science", "Pattern Making", "Garment Construction", "Fashion Illustration", "Merchandising"],
      careers: ["Fashion Designer", "Stylist", "Textile Designer", "Fashion Merchandiser"]
    }
  },
  {
    id: 9,
    title: "B.Tech in Artificial Intelligence",
    category: "Engineering",
    duration: "4 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2032",
    description: "Specialized engineering track focused on Neural Networks, Robotics, and Deep Learning.",
    details: {
      eligibility: "10+2 with PCM (Min 60%).",
      fees: "₹95,000 per semester",
      syllabus: ["Neural Networks", "NLP", "Robotics", "Computer Vision", "Deep Learning"],
      careers: ["AI Engineer", "Robotics Scientist", "NLP Engineer", "Machine Learning Engineer"]
    }
  }
];

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null); // For Details Modal
  
  // NEW: State for Apply Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyCourseName, setApplyCourseName] = useState("");

  const categories = ["All", "Technology", "Management", "Engineering", "Commerce", "Science", "Arts & Design"];

  // Filter Logic
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handler to open Apply Modal from Course Details
  const handleApplyClick = (courseTitle) => {
    setApplyCourseName(courseTitle);
    setIsApplyOpen(true);
    // Optional: Close the details modal when opening apply modal? 
    // Uncomment next line if you want that behavior:
    // setSelectedCourse(null); 
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* ================= HEADER ================= */}
      <div className="bg-red-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Academic Programs</h1>
          <p className="text-red-200 text-lg max-w-2xl mx-auto">
            Discover a wide range of courses designed to equip you with the skills needed for the future.
          </p>
        </div>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="container mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <input 
            type="text"
            placeholder="Search for a course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700 pl-12"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                selectedCategory === cat
                  ? "bg-red-700 text-white shadow-md transform scale-105"
                  : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ================= COURSE GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group flex flex-col h-full">
              
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-red-800 uppercase tracking-wide shadow-sm">
                  {course.level}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider">
                  {course.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-red-700 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                  {course.description}
                </p>
                
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                  <span className="text-sm font-semibold text-gray-500 flex items-center">
                    <span className="mr-2">⏳</span> {course.duration}
                  </span>
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className="text-red-700 font-bold text-sm hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No courses found matching "{searchTerm}".</p>
            <button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="mt-4 text-red-700 font-bold hover:underline">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ================= COURSE DETAIL MODAL ================= */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors z-10"
            >
              ✕
            </button>

            {/* Modal Header Image */}
            <div className="relative h-64">
              <img 
                src={selectedCourse.image} 
                alt={selectedCourse.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div>
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                    {selectedCourse.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedCourse.title}</h2>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Details */}
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-red-100 text-red-700 p-2 rounded-lg mr-3">📖</span> Course Overview
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedCourse.description} This course is designed to provide students with theoretical knowledge and practical skills necessary for a successful career in {selectedCourse.category}.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-red-100 text-red-700 p-2 rounded-lg mr-3">📝</span> Key Syllabus Topics
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCourse.details.syllabus.map((topic, index) => (
                      <li key={index} className="flex items-center text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="bg-red-100 text-red-700 p-2 rounded-lg mr-3">🚀</span> Career Prospects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.details.careers.map((job, index) => (
                      <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {job}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Info Box */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-fit">
                <h4 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Program Details</h4>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Duration</span>
                    <p className="font-semibold text-gray-900">{selectedCourse.duration}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Level</span>
                    <p className="font-semibold text-gray-900">{selectedCourse.level}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Eligibility</span>
                    <p className="font-semibold text-gray-900 text-sm">{selectedCourse.details.eligibility}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Fees</span>
                    <p className="font-bold text-red-700 text-xl">{selectedCourse.details.fees}</p>
                  </div>
                </div>

                {/* Apply Button Inside Details Modal */}
                <button 
                  onClick={() => handleApplyClick(selectedCourse.title)}
                  className="w-full mt-8 bg-red-700 text-white py-3 rounded-xl font-bold hover:bg-red-800 transition-colors shadow-lg"
                >
                  Apply Now
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= APPLY MODAL (Global) ================= */}
      <ApplyModal 
        isOpen={isApplyOpen} 
        onClose={() => setIsApplyOpen(false)}
        defaultCourse={applyCourseName} 
      />

    </div>
  );
};

export default Courses;