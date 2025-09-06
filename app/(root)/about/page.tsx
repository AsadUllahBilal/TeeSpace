"use client";

import React from 'react';
import Image from 'next/image';
import PageBanner from '@/components/PageBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  Globe,
  Award,
  Truck,
  Shield,
  Recycle,
  Star,
  CheckCircle,
  Target,
  Lightbulb,
  Handshake,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  User
} from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Quality First",
      description: "We believe in delivering only the highest quality products that stand the test of time."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Customer Focus",
      description: "Our customers are at the heart of everything we do. Your satisfaction is our priority."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-500" />,
      title: "Sustainability",
      description: "We're committed to sustainable practices and eco-friendly materials in our products."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      title: "Innovation",
      description: "Constantly evolving and innovating to bring you the latest in fashion and design."
    }
  ];

  const features = [
    {
      icon: <Truck className="h-6 w-6 text-blue-600" />,
      title: "Free Shipping",
      description: "Free shipping on orders over $50"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Secure Payment",
      description: "Your payment information is always safe"
    },
    {
      icon: <Award className="h-6 w-6 text-purple-600" />,
      title: "Premium Quality",
      description: "High-quality materials and craftsmanship"
    },
    {
      icon: <Recycle className="h-6 w-6 text-orange-600" />,
      title: "Eco-Friendly",
      description: "Sustainable and environmentally conscious"
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "/team/sarah.jpg",
      description: "Passionate about fashion and sustainable business practices."
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      image: "/team/michael.jpg",
      description: "Bringing creative vision to life through innovative designs."
    },
    {
      name: "Emily Davis",
      role: "Head of Operations",
      image: "/team/emily.jpg",
      description: "Ensuring smooth operations and excellent customer service."
    },
    {
      name: "David Wilson",
      role: "Technology Lead",
      image: "/team/david.jpg",
      description: "Building the digital experience that connects us with you."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "Started with a vision to revolutionize online fashion retail"
    },
    {
      year: "2021",
      title: "10K+ Customers",
      description: "Reached our first major milestone of satisfied customers"
    },
    {
      year: "2022",
      title: "Sustainable Line Launch",
      description: "Introduced our eco-friendly product collection"
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "Expanded shipping to over 50 countries worldwide"
    },
    {
      year: "2024",
      title: "100K+ Orders",
      description: "Celebrated processing over 100,000 orders"
    }
  ];

  const stats = [
    { number: "100K+", label: "Happy Customers" },
    { number: "50+", label: "Countries Served" },
    { number: "1M+", label: "Products Sold" },
    { number: "99%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageBanner bannerName="About Us" />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-primary-green">TeeSpace</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              We're more than just a clothing brand. We're a community of individuals who believe in 
              expressing themselves through quality, comfortable, and sustainable fashion. Since our 
              founding, we've been committed to bringing you the best in contemporary apparel while 
              maintaining our core values of quality, sustainability, and customer satisfaction.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Star className="h-4 w-4 mr-2" />
                Premium Quality
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Globe className="h-4 w-4 mr-2" />
                Worldwide Shipping
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Recycle className="h-4 w-4 mr-2" />
                Eco-Friendly
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-green mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    TeeSpace was born from a simple idea: everyone deserves access to high-quality, 
                    comfortable, and stylish clothing that doesn't compromise on values. Founded in 2020 
                    by a team of fashion enthusiasts and sustainability advocates, we set out to create 
                    a brand that would challenge the fast fashion industry.
                  </p>
                  <p>
                    What started as a small online store has grown into a global community of conscious 
                    consumers who appreciate both style and substance. Every product we create is designed 
                    with care, manufactured ethically, and delivered with pride.
                  </p>
                  <p>
                    Today, we're proud to serve customers in over 50 countries, but our mission remains 
                    the same: to provide exceptional products while making a positive impact on our 
                    planet and communities.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-primary-green rounded-2xl p-8 text-white">
                  <div className="flex items-center mb-4">
                    <Target className="h-8 w-8 mr-3" />
                    <h3 className="text-xl font-bold">Our Mission</h3>
                  </div>
                  <p className="text-green-100 leading-relaxed">
                    To create sustainable, high-quality apparel that empowers individuals to express 
                    their unique style while contributing to a more ethical and environmentally 
                    conscious fashion industry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These principles guide everything we do, from product development to customer service.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600">
                Key milestones that shaped TeeSpace into what it is today.
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-500 opacity-20"></div>
            
            {/* Mobile timeline line - visible on mobile only */}
            <div className="md:hidden absolute left-4 top-0 w-1 h-full bg-green-500 opacity-20"></div>
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center md:${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-full pl-12 md:w-5/12 md:pl-0 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'} md:${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className={`
                        flex items-center gap-2 mb-2
                        md:${index % 2 === 0 ? 'justify-end' : 'justify-start'}
                      `}>
                          <Calendar className="h-4 w-4 text-primary-green" />
                          <span className="text-primary-green font-bold">{milestone.year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    {/* Timeline dot container */}
                  <div className="absolute left-[0.1rem] md:relative md:left-auto w-8 md:w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg z-10 relative">
                    </div>
                  </div>
                  
                  {/* Empty space for desktop layout */}
                  <div className="hidden md:block w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The passionate individuals behind TeeSpace who work tirelessly to bring you the best.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary-green font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose TeeSpace?
              </h2>
              <p className="text-xl text-gray-600">
                We go above and beyond to ensure your shopping experience is exceptional.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-3">
                    {feature.icon}
                    <h3 className="ml-3 text-lg font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-green text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the TeeSpace Community?
            </h2>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Discover our collection of premium, sustainable apparel and become part of a 
              movement that values quality, style, and responsibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/shop" 
                className="bg-white text-primary-green px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Shop Now
              </a>
              <a 
                href="/contact-us" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary-green transition-colors inline-flex items-center justify-center"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Mail className="h-8 w-8 text-primary-green mb-3" />
                <h3 className="text-lg font-bold mb-2">Email Us</h3>
                <p className="text-gray-300">info@teespace.com</p>
                <p className="text-gray-300">support@teespace.com</p>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="h-8 w-8 text-primary-green mb-3" />
                <h3 className="text-lg font-bold mb-2">Call Us</h3>
                <p className="text-gray-300">+1 (555) 123-4567</p>
                <p className="text-gray-300">Mon-Fri: 9AM-6PM EST</p>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="h-8 w-8 text-primary-green mb-3" />
                <h3 className="text-lg font-bold mb-2">Visit Us</h3>
                <p className="text-gray-300">123 Fashion Street</p>
                <p className="text-gray-300">New York, NY 10001</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
