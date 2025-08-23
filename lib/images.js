// Centralized image URLs for the application
export const IMAGES = {
  // Hero Section Images (put these in public/images/hero/)
  hero: {
    slide1: "/images/hero/slide1.jpg",
    slide2: "/images/hero/slide2.jpg",
    slide3: "/images/hero/slide3.jpg",
  },

  // About Section (put this in public/images/)
  about: "/images/about.jpg",

  // Services Section (put these in public/images/services/)
  services: {
    hardware: "/images/services/hardware.jpg",
    software: "/images/services/software.jpg",
    guidance: "/images/services/guidance.jpg",
    certification: "/images/services/certification.jpg",
    internship: "/images/services/internship.jpg",
    research: "/images/services/research.jpg",
  },

  // Projects Section (put these in public/images/projects/)
  projects: {
    iot: "/images/projects/iot.jpg",
    ecommerce: "/images/projects/ecommerce.jpg",
    mobile: "/images/projects/mobile.jpg",
    ai: "/images/projects/ai.jpg",
    blockchain: "/images/projects/blockchain.jpg",
    embedded: "/images/projects/embedded.jpg",
    cloud: "/images/projects/cloud.jpg",
    analytics: "/images/projects/analytics.jpg",
  },

  // Testimonials (put these in public/images/testimonials/)
  testimonials: {
    person1: "/images/testimonials/person1.jpg",
    person2: "/images/testimonials/person2.jpg",
    person3: "/images/testimonials/person3.jpg",
  },

  // Gallery (put these in public/images/gallery/)
  gallery: [
    "/images/gallery/image1.jpg",
    "/images/gallery/image2.jpg",
    "/images/gallery/image3.jpg",
    "/images/gallery/image4.jpg",
    "/images/gallery/image5.jpg",
    "/images/gallery/image6.jpg",
    "/images/gallery/image7.jpg",
    "/images/gallery/image8.jpg",
  ],

  // Fallback image with online backup
  fallback: "/images/fallback.jpg",

  // Online fallbacks (if local images don't exist)
  onlineFallbacks: {
    hero: "https://picsum.photos/1920/800?random=",
    service: "https://picsum.photos/400/250?random=",
    project: "https://picsum.photos/300/200?random=",
    testimonial: "https://picsum.photos/80/80?random=",
    gallery: "https://picsum.photos/400/300?random=",
  },
};

// Helper function to get image with online fallback
export const getImage = (localPath, fallbackType = "gallery", randomId = 1) => {
  // Always try local first, with online fallback
  return localPath || `${IMAGES.onlineFallbacks[fallbackType]}${randomId}`;
};

// Helper to check if image exists (client-side)
export const imageExists = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageSrc;
  });
};
