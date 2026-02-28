import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us! We will get back to you shortly.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ================= HEADER SECTION ================= */}
      <div className="bg-gradient-to-br from-red-950 via-red-900 to-red-800 text-white py-24 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full mix-blend-overlay filter blur-3xl"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Contact Us</h1>
          <p className="text-red-200 text-lg max-w-2xl mx-auto font-medium">
            Have questions? We are here to help. Reach out to our admission cell or administration office.
          </p>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="container mx-auto px-6 py-16 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* LEFT COLUMN: Contact Form */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all outline-none font-medium"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all outline-none font-medium"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Subject</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all outline-none font-medium appearance-none"
                >
                  <option value="">Select a Topic</option>
                  <option value="Admissions">Admissions Inquiry</option>
                  <option value="Fees">Fee Structure</option>
                  <option value="Hostel">Hostel Facilities</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all outline-none resize-none font-medium"
                  placeholder="How can we assist you today?"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/30 transform hover:-translate-y-0.5"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Info & Map */}
          <div className="space-y-8 mt-10 lg:mt-0">
            
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">📍</div>
                <h4 className="font-extrabold text-gray-900 mb-2">Campus Address</h4>
                <p className="text-slate-500 text-sm font-medium">123 Education Blvd,<br/>Innovation District, Tech City</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">📞</div>
                <h4 className="font-extrabold text-gray-900 mb-2">Call Us</h4>
                <p className="text-slate-500 text-sm font-medium">+1 (555) 123-4567<br/>+1 (555) 987-6543</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">✉️</div>
                <h4 className="font-extrabold text-gray-900 mb-2">Email Us</h4>
                <p className="text-slate-500 text-sm font-medium">info@globalcollege.edu<br/>admissions@globalcollege.edu</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">⏰</div>
                <h4 className="font-extrabold text-gray-900 mb-2">Office Hours</h4>
                <p className="text-slate-500 text-sm font-medium">Mon - Sat: 9:00 AM - 5:00 PM<br/>Sunday: Closed</p>
              </div>
            </div>

            {/* LIVE GOOGLE MAP CONTAINER - Generic Map */}
            <div className="bg-white p-2 rounded-[2rem] shadow-lg border border-slate-100 h-80 relative overflow-hidden group">
              <iframe
                title="Campus Map"
                className="w-full h-full rounded-[1.5rem]"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.183948574164!2d-73.98773128459377!3d40.75797477932684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c64a7873%3A0xd64f1dc0b0d39df1!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1614041130000!5m2!1sen!2sus"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

        </div>
      </div>

      {/* ================= FAQ SECTION ================= */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-red-600 text-sm font-bold uppercase tracking-widest mb-2">Common Queries</h2>
            <h3 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            <details className="group bg-slate-50 rounded-2xl p-6 cursor-pointer border border-slate-100 transition-all hover:border-red-200">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none text-lg">
                <span>When do admissions start for the 2026 batch?</span>
                <span className="transition group-open:rotate-180 text-red-500">▼</span>
              </summary>
              <p className="text-slate-600 mt-4 leading-relaxed font-medium">
                Admissions typically begin in May 2026. Please check our "News & Events" section on the Home page for the official announcement dates.
              </p>
            </details>

            <details className="group bg-slate-50 rounded-2xl p-6 cursor-pointer border border-slate-100 transition-all hover:border-red-200">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none text-lg">
                <span>Is hostel accommodation available for outstation students?</span>
                <span className="transition group-open:rotate-180 text-red-500">▼</span>
              </summary>
              <p className="text-slate-600 mt-4 leading-relaxed font-medium">
                Yes, we have separate premium hostels for boys and girls located within 2km of the campus with dedicated bus facilities and 24/7 security.
              </p>
            </details>

            <details className="group bg-slate-50 rounded-2xl p-6 cursor-pointer border border-slate-100 transition-all hover:border-red-200">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none text-lg">
                <span>Can I visit the campus before applying?</span>
                <span className="transition group-open:rotate-180 text-red-500">▼</span>
              </summary>
              <p className="text-slate-600 mt-4 leading-relaxed font-medium">
                Absolutely! We encourage students and parents to visit. Campus tours are available Monday through Friday between 10 AM and 4 PM.
              </p>
            </details>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Contact;