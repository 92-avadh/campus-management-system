import React from "react";

const About = () => {
  // Team Data (Moved from Contact.js)
  const teamMembers = [
    {
      name: "Avadh Dhameliya",
      role: "Lead Developer",
      image: "/dev1.jpg",
      github: "https://github.com/92-avadh",
      phone: "+91 92651 77693",
      email: "dhameliyaavadh592@gmail.com"
    },
    {
      name: "Ravi Gajera",
      role: "UI/UX Designer",
      image: "/dev2.jpg",
      github: "https://github.com/ravigajera-afk",
      phone: "+91 96386 41139",
      email: "ravigajera0906@gmail.com"
    },
    {
      name: "Smit Bhingradiya",
      role: "Backend Engineer",
      image: "/dev3.jpg",
      github: "https://github.com/Smit1879",
      phone: "+91 78743 62579",
      email: "bhingradiyasmit485@gmail.com"
    },
    {
      name: "Zeel katrodiya",
      role: "Frontend Developer",
      image: "/dev4.jpg",
      github: "https://github.com/zeelkatrodiya",
      phone: "+91 90816 32716",
      email: "zeelkatrodiya21@gmail.com"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ================= HEADER SECTION ================= */}
      <div className="bg-red-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About SDJIC</h1>
          <p className="text-red-200 text-lg max-w-2xl mx-auto">
            A legacy of excellence, innovation, and holistic development since 2010.
          </p>
        </div>
      </div>

      {/* ================= VISION & MISSION ================= */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="text-red-900 text-sm font-bold uppercase tracking-widest mb-2">Who We Are</h2>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Shaping Future Leaders</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              SDJ International College is a premier institution dedicated to providing world-class education in Computer Science, Management, and Commerce. Our focus goes beyond textbooks, emphasizing practical skills, ethical leadership, and global perspectives.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With a campus spread over 10 acres, we offer state-of-the-art infrastructure including modern labs, a digital library, and sports complexes that rival the best in the country.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-red-50 p-8 rounded-2xl border-l-4 border-red-700">
              <h4 className="text-xl font-bold text-red-900 mb-2">Our Vision</h4>
              <p className="text-gray-700 text-sm">
                To be a global center of learning that fosters innovation, inclusivity, and excellence, empowering students to contribute meaningfully to society.
              </p>
            </div>
            <div className="bg-gray-100 p-8 rounded-2xl border-l-4 border-gray-800">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h4>
              <p className="text-gray-700 text-sm">
                To provide a transformative educational experience through rigorous academics, industry collaboration, and a vibrant campus culture.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= MEET OUR DEVELOPERS (Moved Here) ================= */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-red-900 text-sm font-bold uppercase tracking-widest mb-2">The Minds Behind</h2>
            <h3 className="text-3xl font-bold text-gray-900">Meet Our Developers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-red-50 shadow-md">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
                <p className="text-red-600 text-sm font-medium mb-6">{member.role}</p>
                
                <div className="flex justify-center gap-4">
                  <a href={member.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition-colors" title="GitHub">
                    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/github.svg" className="w-5 h-5 filter invert" alt="GitHub" />
                  </a>
                  <a href={`tel:${member.phone}`} className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors" title="Call">
                    📞
                  </a>
                  <a href={`mailto:${member.email}`} className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors" title="Email">
                    ✉️
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRINCIPAL MESSAGE ================= */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="mb-8 relative inline-block">
             <img src="/aditibhatt.jpg" alt="Principal" className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg" />
             <div className="absolute bottom-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Principal</div>
          </div>
          <blockquote className="text-2xl font-serif italic text-gray-700 mb-6">
            "At SDJIC, education is not just about acquiring degrees; it is about building character. We strive to create an environment where intellect meets empathy."
          </blockquote>
          <cite className="font-bold text-gray-900 not-italic">- Dr. Aditi Bhatt</cite>
        </div>
      </section>

    </div>
  );
};

export default About;