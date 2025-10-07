import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import { FloatingChatButton } from '@/components/chat/floating-chat-button'

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4F2' }}>
      <PublicHeaderServer />
      
      <main className="pt-16">
        {/* Hero Section - Light Theme */}
        <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#F6F4F2' }}>
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-opacity-20" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)', borderColor: '#ADE3FF' }}>
                <span className="text-sm font-medium" style={{ color: '#1e40af' }}>About Our Mission</span>
              </div>
              
              {/* Main heading */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                  Overcoming Barriers to
                  <span className="block" style={{ color: '#1e40af' }}>Better Healthcare</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  Every year, millions struggle to access the quality healthcare they need. 
                  We're changing that by connecting patients with trusted providers nationwide.
                </p>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: '#1e40af' }}>10,000+</div>
                  <div className="text-gray-600 text-sm">Patients Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: '#1e40af' }}>500+</div>
                  <div className="text-gray-600 text-sm">Healthcare Providers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: '#1e40af' }}>24/7</div>
                  <div className="text-gray-600 text-sm">Platform Access</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Challenges Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Key Challenges We Address
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We understand the barriers patients face and have built solutions to overcome them.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Limited Local Options</h3>
                <p className="text-gray-600 text-sm">
                  Long waits and few local specialists available. Our platform connects you with providers beyond your immediate area.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fragmented Information</h3>
                <p className="text-gray-600 text-sm">
                  Finding, comparing, and choosing care can feel overwhelming. We centralize all the information you need in one place.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Transparency</h3>
                <p className="text-gray-600 text-sm">
                  Unexpected medical costs can be overwhelming. We provide clear pricing information upfront.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600 text-sm">
                  All healthcare providers are thoroughly vetted and verified to ensure you receive quality care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20" style={{ backgroundColor: '#F6F4F2' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Mission: Better Health Decisions Shouldn't Depend on Where You Live
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  We believe everyone deserves access to quality healthcare, regardless of their location. 
                  Our platform breaks down geographical barriers and connects patients with the best 
                  healthcare providers nationwide.
                </p>
                <p className="text-lg text-gray-700 mb-8">
                  By leveraging technology and building trusted partnerships with healthcare providers, 
                  we're creating a more accessible, transparent, and patient-centered healthcare experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="/hospitals" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#1e40af' }}
                  >
                    Find Hospitals
                  </a>
                  <a 
                    href="/doctors" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold border-2 transition-colors"
                    style={{ borderColor: '#1e40af', color: '#1e40af' }}
                  >
                    Browse Doctors
                  </a>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                      <svg className="w-8 h-8" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Patient-Centered Care</h3>
                    <p className="text-gray-600">
                      We put patients first, providing tools and information to make informed healthcare decisions 
                      that fit your needs and circumstances.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These principles guide everything we do as we work to improve healthcare access for everyone.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                  <svg className="w-8 h-8" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We leverage cutting-edge technology to solve complex healthcare challenges and improve patient outcomes.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                  <svg className="w-8 h-8" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility</h3>
                <p className="text-gray-600">
                  Healthcare should be accessible to everyone, regardless of location, background, or circumstances.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)' }}>
                  <svg className="w-8 h-8" style={{ color: '#1e40af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust</h3>
                <p className="text-gray-600">
                  We build trust through transparency, security, and by ensuring all providers meet the highest standards.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - consistent with other pages */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">HealthCare Connect</h3>
              <p className="text-gray-400 mb-4">
                Connecting patients with quality healthcare providers and facilities across the region.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/doctors" className="hover:text-white transition-colors">Find Doctors</a></li>
                <li><a href="/hospitals" className="hover:text-white transition-colors">Find Hospitals</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HealthCare Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}