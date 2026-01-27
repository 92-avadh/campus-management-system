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
      syllabus: [
        "C Programming", 
        "Web Development", 
        "Database Management Systems (DBMS)", 
        "Data Structures & Algorithms", 
        "Operating Systems"
      ],
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
      eligibility: "10+2 in any stream with min 45% marks.",
      fees: "₹55,000 per semester",
      syllabus: [
        "Principles of Management", 
        "Marketing Management", 
        "Organizational Behavior", 
        "Business Communication", 
        "Human Resource Management"
      ],
      careers: ["HR Manager", "Marketing Executive", "Business Consultant", "Sales Manager"]
    }
  },
  {
    id: 3,
    title: "Bachelor of Commerce (B.Com)",
    category: "Finance",
    duration: "3 Years",
    level: "Undergraduate",
    image: "https://images.unsplash.com/photo-1454165833767-027ffea9e778?q=80&w=2070",
    description: "Build a strong foundation in accounting, taxation, and financial management.",
    details: {
      eligibility: "10+2 with Commerce or Math background.",
      fees: "₹35,000 per semester",
      syllabus: [
        "Financial Accounting", 
        "Business Laws", 
        "Corporate Finance", 
        "Economics for Business", 
        "Auditing and Taxation"
      ],
      careers: ["Accountant", "Tax Consultant", "Banker", "Financial Analyst"]
    }
  }
];

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyCourseName, setApplyCourseName] = useState("");

  const handleApplyClick = (courseTitle) => {
    setApplyCourseName(courseTitle);
    setIsApplyOpen(true);
    setSelectedCourse(null); // Close details modal if open
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1523050335192-ce125a431290?q=80&w=2070" 
            alt="Campus" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            Academic <span className="text-red-600">Programs</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Explore our diverse range of undergraduate programs designed to 
            empower your future and build professional excellence.
          </p>
        </div>
      </section>

      {/* Course Listing */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="group bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-gray-900 uppercase tracking-widest">
                  {course.category}
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
                  {course.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 mb-8">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                      <span className="text-sm font-bold dark:text-gray-200">{course.duration}</span>
                   </div>
                   <div className="w-[1px] h-8 bg-gray-100 dark:bg-gray-800"></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level</span>
                      <span className="text-sm font-bold dark:text-gray-200">{course.level}</span>
                   </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleApplyClick(course.title)}
                    className="px-6 bg-red-700 text-white py-3 rounded-xl font-bold hover:bg-red-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= DETAILS MODAL ================= */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              ×
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-full">
                <img src={selectedCourse.image} alt="" className="w-full h-full object-cover" />
              </div>
              
              <div className="p-10 md:p-12">
                <span className="text-red-600 font-bold uppercase tracking-widest text-xs mb-2 block">Course Overview</span>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 leading-tight">{selectedCourse.title}</h2>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-3">Key Subjects (Syllabus)</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.details.syllabus.map((item, i) => (
                        <span key={i} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-xs font-medium dark:text-gray-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase mb-3">Career Opportunities</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {selectedCourse.details.careers.map((career, i) => (
                        <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> {career}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Level</span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCourse.level}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Eligibility</span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-[10px]">{selectedCourse.details.eligibility}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Fees</span>
                    <p className="font-bold text-red-700 text-sm">{selectedCourse.details.fees}</p>
                  </div>
                </div>

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