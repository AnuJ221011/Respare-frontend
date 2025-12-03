import React from 'react';

export default function HomePage() {
  return (
    <div className="antialiased bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
        .text-accent {
          color: #059669;
        }
        .bg-accent {
          background-color: #059669;
        }
        .hover\\:bg-accent-dark:hover {
          background-color: #047857;
        }
        .border-accent {
          border-color: #059669;
        }
        .gradient-text {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(5, 150, 105, 0.3);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20 shadow-sm">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden flex items-center justify-center bg-white/90 shadow-xl">
              <img
                src="https://res.cloudinary.com/dlnyzjn5e/image/upload/v1764753429/ChatGPT_Image_Nov_10_2025_08_57_35_PM_2_1_lldkzn.svg"
                alt="ReSpare Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Remove this text if you no longer want it */}
            {/* <span className="ml-2 text-base font-bold text-gray-800">ReSpare</span> */}
          </a>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <a href="#why-choose" className="text-gray-600 text-xs px-2 py-1.5 rounded-md hover:text-accent hover:bg-emerald-50 transition duration-150 hidden sm:inline-block">
              Why Us
            </a>
            <a href="#how-it-works" className="text-gray-600 text-xs px-2 py-1.5 rounded-md hover:text-accent hover:bg-emerald-50 transition duration-150 hidden sm:inline-block">
              Process
            </a>
            <a href="#testimonials" className="text-gray-600 text-xs px-2 py-1.5 rounded-md hover:text-accent hover:bg-emerald-50 transition duration-150 hidden sm:inline-block">
              Reviews
            </a>
            <a href="/admin/login" className="text-white text-xs px-2 py-1.5 rounded-md hover:text-accent bg-gradient-to-r from-emerald-600 to-emerald-500 transition duration-150 hidden md:inline-block">
              Get Started
            </a>
            <a href="https://wa.me/918777765887" className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-emerald-600 transition duration-150 ml-2">
              Order Now
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero" className="relative bg-gradient-to-b from-white to-gray-50 pt-12 pb-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full mb-3 border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              India's Trusted Used Auto Parts
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
              Used Car Parts you can <span className="gradient-text">Trust</span>
            </h1>
            <p className="text-base sm:text-lg font-semibold text-gray-600 mb-2 max-w-2xl mx-auto">
              Sahi Part. Sahi Price. Sahi Time.
            </p>
            <p className="text-xs text-gray-400 mb-6 flex items-center justify-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
              Serving Delhi NCR & Kolkata
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
              <a
                href="https://wa.me/918777765887"
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 transition duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp Request
              </a>
              <div className="group relative">
                <button className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg bg-white hover:bg-gray-50 transition duration-150 w-full">
                  <span className="text-gray-700 group-hover:opacity-0 transition duration-150">
                    Download App
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-orange-500 font-bold opacity-0 group-hover:opacity-100 transition duration-150">
                    Coming Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section id="why-choose" className="py-10 sm:py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose <span className="gradient-text">ReSpare</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-white to-emerald-50/30 p-5 rounded-xl border border-gray-200 card-hover">
                <div className="text-2xl mb-2">🛠️</div>
                <h3 className="text-base font-bold text-gray-800 mb-1.5">Massive Inventory</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  <b>1 lakh+ parts</b> of <b>1000+ brands</b>. Find exactly what you need.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-emerald-50/30 p-5 rounded-xl border border-gray-200 card-hover">
                <div className="text-2xl mb-2">✅</div>
                <h3 className="text-base font-bold text-gray-800 mb-1.5">Quality Assured</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Every part undergoes rigorous inspection for reliability.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-emerald-50/30 p-5 rounded-xl border border-gray-200 card-hover">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="text-base font-bold text-gray-800 mb-1.5">Big Savings</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Save <b>50%-70%</b> compared to brand new parts.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-emerald-50/30 p-5 rounded-xl border border-gray-200 card-hover">
                <div className="text-2xl mb-2">🛡️</div>
                <h3 className="text-base font-bold text-gray-800 mb-1.5">Warranty Included</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Peace of mind with comprehensive warranty coverage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-10 sm:py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
              Our <span className="gradient-text">Simple Process</span>
            </h2>
            <div className="relative max-w-3xl mx-auto">
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-200"></div>

              <div className="space-y-10">
                {[
                  { num: 1, title: "Send Request", desc: "WhatsApp your car number and part photo for instant processing." },
                  { num: 2, title: "We Find Parts", desc: "We verify VIN and locate compatible parts from inspected inventory." },
                  { num: 3, title: "Review & Choose", desc: "See photos, condition notes, pricing, and warranty details." },
                  { num: 4, title: "Fast Delivery", desc: "Quick delivery with real-time tracking to your doorstep." },
                  { num: 5, title: "Easy Returns", desc: "Hassle-free replacement or refund if needed." }
                ].map((step, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div
                      key={step.num}
                      className="relative flex flex-col items-center text-center md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6"
                    >
                      <div
                        className={`w-full max-w-sm md:max-w-none bg-white/90 border border-emerald-50 rounded-xl shadow-sm p-4 md:p-5 flex flex-col gap-1 ${
                          isEven
                            ? "md:col-start-1 md:text-right md:items-end"
                            : "md:col-start-3 md:text-left md:items-start"
                        }`}
                      >
                        <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>

                      <div className="relative md:col-start-2 flex flex-col items-center justify-center my-4 md:my-0">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm shadow-xl ring-4 ring-white">
                          {step.num}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-10 sm:py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
              Trusted by <span className="gradient-text">Professionals</span>
            </h2>
            <p className="text-sm text-center text-gray-500 mb-8 max-w-xl mx-auto">
              What our garage partners say about us
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { quote: "Saves me 2 hours daily. No market trips needed. Thousands saved on parts.", name: "Rajesh Kumar", role: "Workshop Owner, Gurugram" },
                { quote: "Quality inspection is excellent. I know what I'm getting. Parts cost 60% less!", name: "Mohammed Shaikh", role: "Garage Owner, Kolkata" },
                { quote: "Digital tracking eliminates kickbacks. 30-min delivery with documentation. Total transparency.", name: "Amit Patel", role: "Fleet Manager, Delhi" }
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-200 card-hover">
                  <div className="flex items-start mb-3">
                    <div className="text-3xl text-emerald-500 leading-none mr-2">"</div>
                    <p className="text-gray-700 text-xs leading-relaxed italic pt-1">
                      {testimonial.quote}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section id="metrics" className="py-8 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "1000+", label: "Workshops" },
                { value: "10k+", label: "Parts Delivered" },
                { value: "98%", label: "Satisfaction" },
                { value: "₹5L+", label: "Saved" }
              ].map((metric, idx) => (
                <div key={idx} className="p-2">
                  <div className="text-3xl sm:text-4xl font-extrabold mb-1">{metric.value}</div>
                  <div className="text-xs font-medium opacity-90">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section id="brands" className="py-10 sm:py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
              <span className="gradient-text">1000+</span> Brands Available
            </h2>
            <p className="text-sm text-center text-gray-500 mb-8 max-w-xl mx-auto">
              Quality used parts from trusted manufacturers
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 items-center justify-items-center">
              {['Maruti Suzuki', 'Hyundai', 'Honda', 'Tata', 'Mahindra', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Audi', 'Volvo', 'Jaguar'].map((brand) => (
                <div key={brand} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition duration-300 w-full text-center">
                  <p className="text-xs font-semibold text-gray-700">{brand}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Ready to Find Your Part?</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-lg mx-auto">
              Start saving time and money today. Get instant quote via WhatsApp.
            </p>
            <a href="https://wa.me/918777765887" className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold rounded-xl shadow-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-2xl transition duration-150">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Get Started Now
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs text-gray-400">
            &copy; 2025 ReSpare. All rights reserved.
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Serving Delhi NCR & Kolkata
          </div>
        </div>
      </footer>
    </div>
  );
}