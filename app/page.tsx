import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import { HeroSection } from '@/components/homepage/hero-section'
import { FeaturedHospitals } from '@/components/homepage/featured-hospitals'
import { FloatingChatButton } from '@/components/chat/floating-chat-button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <PublicHeaderServer />
      
      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Featured Hospitals Section */}
        <FeaturedHospitals />
        
        {/* Key Challenges Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                KEY CHALLENGES
              </p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Overcoming Barriers to Better Healthcare
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Every year, millions across Asia struggle to access the care they need.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Challenge Cards */}
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-200 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Limited Local Options</h3>
                  <p className="text-gray-600 leading-relaxed">Long waits and few local specialists available.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-200 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Fragmented Information</h3>
                  <p className="text-gray-600 leading-relaxed">Finding, comparing, and choosing care can feel overwhelming.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-200 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Higher Local Costs for Specialized Treatments</h3>
                  <p className="text-gray-600 leading-relaxed">Specialized treatment costs in home are often prohibitive.</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-200 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Lack of Support for International Care</h3>
                  <p className="text-gray-600 leading-relaxed">Patients struggle to find reliable guidance.</p>
                </div>
              </div>
              
              {/* CTA Card */}
              <div className="bg-primary-200 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    Better health decisions shouldn't depend on where you live
                  </h3>
                </div>
                <div className="mt-8">
                  <button className="inline-flex items-center text-gray-900 font-semibold hover:text-blue-700 transition-colors">
                    Partner With Us
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-[#F6F4F2]">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-black mb-4">
              Ready to Find Your Healthcare Provider?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of patients who trust our platform for their healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-200 border-2 border-primary-200 text-gray-600 px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                Browse Hospitals
              </button>
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Find Doctors
              </button>
              
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">HealthCare</h3>
              <p className="text-gray-400">
                Connecting patients with quality healthcare providers nationwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Find Hospitals</li>
                <li>Book Appointments</li>
                <li>Emergency Care</li>
                <li>Telemedicine</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <p className="text-gray-400 mb-2">For medical emergencies:</p>
              <p className="text-red-400 font-semibold">Call 911</p>
              <p className="text-gray-400">or (555) 911-HELP</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HealthCare Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}
