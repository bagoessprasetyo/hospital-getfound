'use client'

import { Heart, Shield, Clock, Users } from 'lucide-react'
import { ChatSearch } from './chat-search'

export function HeroSection() {
  const features = [
    {
      icon: Heart,
      title: 'Expert Care',
      description: 'Board-certified doctors with years of experience'
    },
    {
      icon: Shield,
      title: 'Trusted Network',
      description: 'Verified hospitals and healthcare providers'
    },
    {
      icon: Clock,
      title: 'Quick Booking',
      description: 'Schedule appointments in just a few clicks'
    },
    {
      icon: Users,
      title: 'Patient First',
      description: 'Personalized care tailored to your needs'
    }
  ]

  return (
    <section className="relative bg-[#F6F4F2] min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Find the Right
              <span className="text-black block">Healthcare for You</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with trusted hospitals and experienced doctors. 
              Get the medical care you deserve with our comprehensive healthcare network.
            </p>
          </div>

          {/* Chat Search Interface */}
          <div className="mb-16">
            <ChatSearch />
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-300 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-black mb-2">50+</div>
                <div className="text-gray-600">Partner Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-black mb-2">200+</div>
                <div className="text-gray-600">Qualified Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-black mb-2">24/7</div>
                <div className="text-gray-600">Emergency Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}