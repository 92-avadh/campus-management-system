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
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ================= HEADER SECTION ================= */}
      <div className="bg-red-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-red-200 text-lg max-w-2xl mx-auto">
            Have questions? We are here to help. Reach out to our admission cell or administration office.
          </p>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* LEFT COLUMN: Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 transition-all outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 transition-all outline-none"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 transition-all outline-none"
                >
                  <option value="">Select a Topic</option>
                  <option value="Admissions">Admissions Inquiry</option>
                  <option value="Fees">Fee Structure</option>
                  <option value="Hostel">Hostel Facilities</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 transition-all outline-none resize-none"
                  placeholder="How can we assist you today?"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Info & Map */}
          <div className="space-y-8">
            
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mb-4">📍</div>
                <h4 className="font-bold text-gray-900 mb-2">Campus Address</h4>
                <p className="text-gray-600 text-sm">Someshwara Enclave,<br/>Vesu, Surat 395007</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mb-4">📞</div>
                <h4 className="font-bold text-gray-900 mb-2">Call Us</h4>
                <p className="text-gray-600 text-sm">+91 87996 79215<br/>+91 261 1234567</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mb-4">✉️</div>
                <h4 className="font-bold text-gray-900 mb-2">Email Us</h4>
                <p className="text-gray-600 text-sm">info@sdjic.org<br/>admissions@sdjic.org</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mb-4">⏰</div>
                <h4 className="font-bold text-gray-900 mb-2">Office Hours</h4>
                <p className="text-gray-600 text-sm">Mon - Sat: 9:00 AM - 4:00 PM<br/>Sunday: Closed</p>
              </div>
            </div>

            {/* LIVE GOOGLE MAP CONTAINER */}
            <div className="bg-white p-2 rounded-3xl shadow-lg border border-gray-100 h-80 relative overflow-hidden group">
              <iframe
                title="SDJIC Campus Map"
                className="w-full h-full rounded-2xl"
                src="https://maps.google.com/maps?q=SDJ%20International%20College%2C%20Vesu%2C%20Surat&t=&z=15&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              {/* Overlay button that disappears on interaction/hover */}
              <a 
                href="https://www.google.com/maps/search/?api=1&query=SDJ+International+College+Vesu+Surat" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white text-red-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-red-50 transition-colors opacity-90 hover:opacity-100"
              >
                Open in Google Maps ↗
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* ================= FAQ SECTION ================= */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-red-900 text-sm font-bold uppercase tracking-widest mb-2">Common Queries</h2>
            <h3 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            <details className="group bg-gray-50 rounded-xl p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none">
                <span>When do admissions start for the 2025 batch?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Admissions typically begin in May 2025. Please check our "News & Events" section for the official announcement dates.
              </p>
            </details>

            <details className="group bg-gray-50 rounded-xl p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none">
                <span>Is hostel accommodation available for outstation students?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Yes, we have separate hostels for boys and girls located within 2km of the campus with bus facilities.
              </p>
            </details>

            <details className="group bg-gray-50 rounded-xl p-6 cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none">
                <span>Can I visit the campus before applying?</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Absolutely! We encourage students and parents to visit. Campus tours are available Mon-Fri between 10 AM and 4 PM.
              </p>
            </details>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Contact;