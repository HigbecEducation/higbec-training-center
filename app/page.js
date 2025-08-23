"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  BookOpen,
  Award,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Star,
  Play,
  CheckCircle,
} from "lucide-react";

// Navigation Component
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Projects", href: "#projects" },
    { name: "Gallery", href: "#gallery" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-wider text-[#28D4DB]"
          >
            HIGBEC
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-[#28D4DB] font-medium transition-colors duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#28D4DB] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <Link
              href="/admin"
              className="btn-secondary text-sm py-2 px-6 text-[#28D4DB] border border-[#28D4DB]"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div
              className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-gray-700 mt-1 transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-gray-700 mt-1 transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-[#28D4DB] font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <Link href="/admin" className="block mt-4 ">
              <button className="btn-secondary text-sm py-2 px-6 w-full text-[#28D4DB] border border-[#28D4DB]">
                Admin Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  const heroSlides = [
    {
      id: 1,
      image: "/images/image1.jpg",
      title: "Advanced Hardware & Software Training",
      subtitle: "Master cutting-edge technologies with hands-on experience",
      cta: "Start Your Journey",
    },
    {
      id: 2,
      image: "/images/image1.jpg",
      title: "Professional Project Development",
      subtitle: "Build industry-ready projects with expert guidance",
      cta: "Register Now",
    },
    {
      id: 3,
      image: "/images/image3.jpg",
      title: "Career-Focused Learning",
      subtitle: "Gain skills that employers are looking for",
      cta: "Get Started",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    pauseOnHover: false,
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      <Slider arrows={false} {...settings} className="h-full">
        {heroSlides.map((slide) => (
          <div key={slide.id} className="relative h-screen">
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>

            {/* Background Image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={slide.id === 1}
            />

            {/* Content Centered */}
            <div className="relative z-20 h-full flex items-center justify-center text-center">
              <div className="px-4 max-w-6xl text-white">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="text-7xl md:text-8xl font-extrabold mb-6 leading-tight tracking-tight">
                    {slide.title}
                  </h1>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <ChevronDown className="w-8 h-8 text-white animate-bounce" />
      </div>
    </section>
  );
};

// About Section Component
const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="/about/about.jpg"
              alt="About HIGBEC"
              width={600}
              height={500}
              className="rounded-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              About <span className="text-[#28D4DB]">HIGBEC</span>
            </h2>
            <div className="w-20 h-1 bg-[#28D4DB] mb-6"></div>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              HIGBEC is a premier technology training institute dedicated to
              bridging the gap between academic learning and industry
              requirements. We specialize in providing comprehensive hardware
              and software training programs that prepare students for
              successful careers in technology.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              With state-of-the-art facilities and experienced instructors, we
              offer hands-on experience in cutting-edge technologies, ensuring
              our students are industry-ready upon completion of their programs.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { icon: Users, title: "500+", desc: "Students Trained" },
                { icon: BookOpen, title: "50+", desc: "Courses Offered" },
                { icon: Award, title: "95%", desc: "Success Rate" },
                { icon: Star, title: "4.9/5", desc: "Student Rating" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 text-[#28D4DB] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#28D4DB]">
                    {stat.title}
                  </div>
                  <div className="text-sm text-[#28D4DB]">{stat.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Services Section Component
const ServicesSection = () => {
  const services = [
    {
      id: 1,
      title: "Project Assistance",
      description:
        "Supporting innovation with expert guidance for successful projects.",
      fullDescription:
        "Our project assistance program provides comprehensive support from initial concept to final implementation. We offer expert guidance in circuit design, PCB development, microcontroller programming, and IoT projects. Our experienced mentors work closely with you to ensure your project meets industry standards and achieves your learning objectives.",
      image: "/services/project.jpg",
      features: [
        "Circuit Design",
        "PCB Development",
        "Microcontroller Programming",
        "IoT Projects",
      ],
      hasRegister: true,
    },
    {
      id: 2,
      title: "Internships and Workshops",
      description:
        "Building expertise through practical internships and interactive workshops.",
      fullDescription:
        "Gain hands-on experience through our structured internship programs and interactive workshops. We cover web development, mobile app creation, database design, and cloud computing. Our industry partnerships ensure you get real-world exposure and networking opportunities that can kickstart your career.",
      image: "/services/internship1.jpg",
      features: [
        "Web Development",
        "Mobile Apps",
        "Database Design",
        "Cloud Computing",
      ],
      hasRegister: false,
    },
    {
      id: 3,
      title: "3D Printing",
      description: "Transforming ideas into reality with advanced 3D printing.",
      fullDescription:
        "Our state-of-the-art 3D printing facilities help you bring your innovative ideas to life. From rapid prototyping to final product development, we provide comprehensive training on various 3D printing technologies, design software, and post-processing techniques.",
      image: "/services/print3d.jpg",
      features: [
        "Rapid Prototyping",
        "Design Software Training",
        "Material Selection",
        "Post-processing Techniques",
      ],
      hasRegister: false,
    },
    {
      id: 4,
      title: "STEM Kits",
      description: "Empowering learning with hands-on STEM educational kits.",
      fullDescription:
        "Our STEM kits are designed to make learning interactive and engaging. These educational tools cover various topics from basic electronics to advanced robotics, helping students understand complex concepts through hands-on experimentation and practical application.",
      image: "/services/stem4.jpg",
      features: [
        "Educational Electronics",
        "Robotics Kits",
        "Programming Modules",
        "Interactive Learning",
      ],
      hasRegister: false,
    },
    {
      id: 5,
      title: "IoT Labs",
      description:
        "Innovating connectivity with smart IoT solutions and technologies.",
      fullDescription:
        "Explore the world of Internet of Things through our specialized IoT labs. Learn to create connected devices, implement sensor networks, develop mobile applications for IoT control, and understand cloud integration for data analytics and device management.",
      image: "/services/iot.jpg",
      features: [
        "Sensor Networks",
        "Device Connectivity",
        "Mobile Integration",
        "Cloud Analytics",
      ],
      hasRegister: false,
    },
    {
      id: 6,
      title: "Certification Courses",
      description:
        "Enhancing skills with industry-recognized professional certification courses.",
      fullDescription:
        "Advance your career with our industry-recognized certification courses. We offer comprehensive training programs that align with current industry demands, providing you with the credentials and knowledge needed to excel in your chosen field.",
      image: "/services/course.jpg",
      features: [
        "Industry Recognition",
        "Comprehensive Training",
        "Career Advancement",
        "Skill Validation",
      ],
      hasRegister: false,
    },
  ];

  const [flippedCards, setFlippedCards] = useState({});

  const toggleCard = (serviceId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Our <span className="text-[#28D4DB]">Services</span>
          </h2>
          <p className="section-subtitle">
            Comprehensive training programs designed to meet industry standards
            and prepare you for success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative h-96 card-hover"
              style={{ perspective: "1000px" }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                  flippedCards[service.id] ? "rotate-y-180" : ""
                }`}
              >
                {/* Front of Card */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>

                    <button
                      onClick={() => toggleCard(service.id)}
                      className="text-[#28D4DB] font-semibold hover:text-blue-600 transition-colors duration-300"
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gray-900 rounded-2xl shadow-lg overflow-hidden text-white">
                  <div className="p-6 h-full flex flex-col">
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      {service.title}
                    </h3>

                    <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-grow">
                      {service.fullDescription}
                    </p>

                    {/* <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-blue-400">
                        Key Features:
                      </h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-gray-300"
                          >
                            <CheckCircle className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div> */}

                    <div className="flex flex-col space-y-2 mt-auto">
                      {service.hasRegister && (
                        <Link href="/register">
                          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
                            Register Now
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => toggleCard(service.id)}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
                      >
                        Learn Less
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
};

// Enhanced Projects Section Component
const ProjectsSection = () => {
  const projects = [
    {
      title: "Artificial Intelligence",
      category: "Hardware",
      description:
        "AI-powered systems for intelligent automation and decision-making",
      image: "/projects/artificial-intelligence.gif",
      featured: false,
    },
    {
      title: "Data Science",
      category: "Data Science",
      description:
        "Advanced analytics and machine learning for data-driven insights",
      image: "/projects/statistics.gif",
      featured: true,
    },
    {
      title: "Electrical and Electronics",
      category: "Hardware",
      description: "Circuit design and electronic system development projects",
      image: "/projects/circuit-board.gif",
      featured: false,
    },
    {
      title: "IoT Solutions",
      category: "Hardware",
      description: "Connected devices and smart home automation systems",
      image: "/projects/light-control.gif",
      featured: true,
    },
    {
      title: "Robotics",
      category: "Hardware",
      description: "Autonomous robots and intelligent mechanical systems",
      image: "/projects/chatbot.gif",
      featured: false,
    },
    {
      title: "Web App Development",
      category: "Software",
      description:
        "Modern web applications with responsive design and functionality",
      image: "/projects/responsive.gif",
      featured: false,
    },
    {
      title: "Machine Learning",
      category: "A.I.",
      description:
        "Predictive models and intelligent algorithms for various applications",
      image: "/projects/neural-network.gif",
      featured: true,
    },
    {
      title: "Computer Vision",
      category: "Image Processing",
      description: "Visual recognition and image processing applications",
      image: "/projects/vision.gif",
      featured: false,
    },
  ];

  const categoryColors = {
    Hardware: "bg-blue-100 text-blue-700 border-blue-200",
    "Data Science": "bg-purple-100 text-purple-700 border-purple-200",
    Software: "bg-green-100 text-green-700 border-green-200",
    "A.I.": "bg-orange-100 text-orange-700 border-orange-200",
    "Image Processing": "bg-pink-100 text-pink-700 border-pink-200",
  };

  return (
    <section
      id="projects"
      className="section-padding bg-blue-50 from-blue-50 via-white to-indigo-50"
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Our <span className="text-[#28D4DB]">Projects</span>
          </h2>
          <p className="section-subtitle">
            Explore the innovative projects developed by our students and
            mentors
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                project.featured
                  ? "ring-2 ring-blue-200 shadow-blue-100/50"
                  : ""
              }`}
            >
              {/* Featured Badge */}
              {/* {project.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Popular
                  </div>
                </div>
              )} */}

              {/* Image Section */}
              <div className="relative h-40 overflow-hidden bg-white from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                <Image
                  src={project.image}
                  alt={project.title}
                  width={100}
                  height={100}
                  className="object-contain transition-all duration-500 group-hover:scale-110"
                />

                {/* Overlay on hover */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Category Badge */}
                {/* <div className="mb-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                      categoryColors[project.category] ||
                      "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {project.category}
                  </span>
                </div> */}

                {/* Title */}
                <h3 className="font-bold text-[#28D4DB] mb-3 text-lg leading-tight group-hover:text-[#28D4DB] transition-colors duration-300">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Interaction Hint */}
                {/* <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-500 transform translate-x-0 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
                </div> */}
              </div>

              {/* Hover Effect Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Call-to-Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="text-center md:text-left">
                {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div> */}

                <h3 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                  Ready to Start Your
                  <span className="text-[#28D4DB]">Dream Project?</span>
                </h3>

                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Skip the wait and register for your project directly. Join
                  thousands of students who have transformed their ideas into
                  reality with our expert guidance.
                </p>

                {/* Features List */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {[
                    "Expert Mentorship",
                    "Industry Tools",
                    "Certificate",
                    "Portfolio Ready",
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-gray-50 rounded-full px-4 py-2"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Action */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-inner border border-gray-100">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      500+
                    </div>
                    <div className="text-gray-600">Projects Completed</div>
                  </div>

                  <Link href="/register">
                    <button className="group relative w-full bg-[#28D4DB] hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                      <span className="relative z-10 flex items-center justify-center">
                        Register Your Project
                        <ArrowRight className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </Link>

                  <p className="text-sm text-gray-500 mt-4">
                    No hidden fees • Free consultation • 24/7 support
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full opacity-20"></div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: "500+", label: "Projects Completed" },
            { number: "95%", label: "Success Rate" },
            { number: "50+", label: "Technologies" },
            { number: "24/7", label: "Support" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#28D4DB] mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section Component
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Athira S",
      role: "Software Engineer, TCS",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=center",
      content:
        "HIGBEC provided me with the practical skills and knowledge that helped me land my dream job. The hands-on training was exceptional.",
      rating: 5,
    },
    {
      name: "Pranav K",
      role: "Hardware Engineer, Intel",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=center",
      content:
        "The hardware training program at HIGBEC is comprehensive and industry-focused. I gained valuable experience working on real projects.",
      rating: 5,
    },
    {
      name: "Arjun Krishnan",
      role: "Full Stack Developer, Infosys",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=center",
      content:
        "The mentorship and project guidance I received at HIGBEC was outstanding. It prepared me well for my professional career.",
      rating: 5,
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            What Our <span className="text-[#28D4DB]">Students Say</span>
          </h2>
          <p className="section-subtitle">
            Hear from our successful alumni who are now working in top companies
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-lg text-gray-600 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-6">
                        {testimonial.name}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

// Gallery Section Component
const GallerySection = () => {
  const galleryImages = [
    "/gallery/image2.jpg",
    "/gallery/circuit.jpg",
    "/gallery/image1.jpg",
    "/gallery/image3.jpg",
    "/gallery/print3d.jpg",
    "/gallery/image4.jpg",
    "/gallery/image5.jpg",
    "/gallery/image9.jpg",
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Our <span className="text-[#28D4DB]">Gallery</span>
          </h2>
          <p className="section-subtitle">
            Take a look at our state-of-the-art facilities and learning
            environment
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative h-60 rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image}
                alt={`Gallery ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">View Image</p>
                </div>
              </div> */}
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={selectedImage}
                alt="Gallery Image"
                width={800}
                height={600}
                className="rounded-lg"
              />
              <button
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Contact Section Component
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Get In <span className="text-[#28D4DB]">Touch</span>
          </h2>
          <p className="section-subtitle">
            Ready to start your journey? Contact us today for more information
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-[#28D4DB] mr-4 mt-1" />
                <div>
                  <h4 className="font-semibold">Address</h4>
                  <p className="text-gray-600">
                    HIGBEC Training Center
                    <br />
                    Technopark, Thiruvananthapuram
                    <br />
                    Kerala, India - 695581
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-6 h-6 text-[#28D4DB] mr-4 mt-1" />
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-gray-600">+91 9876543210</p>
                  <p className="text-gray-600">+91 9876543211</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="w-6 h-6 text-[#28D4DB] mr-4 mt-1" />
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-600">info@higbec.com</p>
                  <p className="text-gray-600">support@higbec.com</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>

              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input h-32 resize-none"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-primary w-full text-[#28D4DB]"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-[#28D4DB]">HIGBEC</h3>
            <p className="text-gray-400 mb-4">
              Empowering students with cutting-edge technology training and
              professional project development.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About", "Services", "Projects", "Gallery"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              {[
                "Hardware Training",
                "Software Development",
                "Project Guidance",
                "Certification",
                "Internships",
              ].map((service) => (
                <li key={service}>
                  <span className="text-gray-400">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>Technopark, Thiruvananthapuram</p>
              <p>Kerala, India - 695581</p>
              <p>Phone: +91 9876543210</p>
              <p>Email: info@higbec.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 HIGBEC. All rights reserved. | Privacy Policy | Terms of
            Service
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </div>
  );
}
