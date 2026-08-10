import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiShield, FiTruck, FiRefreshCw, FiX } from 'react-icons/fi';
import '../styles/Home.css';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80',
    title: 'Elegant Living Room Collections',
    subtitle: 'Transform your space with our premium furniture',
  },
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    title: 'Modern Bedroom Designs',
    subtitle: 'Create your perfect sanctuary',
  },
  {
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de29719f?w=1600&q=80',
    title: 'Stylish Dining Sets',
    subtitle: 'Where every meal becomes a celebration',
  },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [welcomeName, setWelcomeName] = useState(null);
  const observerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const { fullName } = JSON.parse(userData);
        if (fullName && !sessionStorage.getItem('welcomeShown')) {
          setWelcomeName(fullName);
          sessionStorage.setItem('welcomeShown', 'true');
        }
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const SLIDE_DURATION = 6000;
    const TICK_INTERVAL = 30;
    let startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= SLIDE_DURATION) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        startTime = Date.now();
        setProgress(0);
      }
    }, TICK_INTERVAL);

    return () => clearInterval(timerRef.current);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const features = [
    { icon: FiTruck, title: 'Free Delivery', desc: 'Free shipping on orders over ₹40,000' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% secure payment processing' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day hassle-free return policy' },
    { icon: FiStar, title: 'Premium Quality', desc: 'Handpicked furniture for you' },
  ];

  const dismissWelcome = () => setWelcomeName(null);

  return (
    <div className="home">
      {/* Welcome Banner */}
      {welcomeName && (
        <div className="welcome-banner">
          <div className="welcome-content">
            <span className="welcome-icon">&#128075;</span>
            <span>Welcome back, <strong>{welcomeName}</strong>!</span>
          </div>
          <button className="welcome-close" onClick={dismissWelcome} aria-label="Dismiss">
            <FiX />
          </button>
        </div>
      )}

      {/* Hero Slider */}
      <section className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay" />
            <div className="slide-content">
              <span className="slide-badge">New Collection</span>
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-subtitle">{slide.subtitle}</p>
               <div className="slide-actions">
                 <Link to="/categories" className="btn btn-primary">
                   Shop Now <FiArrowRight />
                 </Link>
               </div>
            </div>
          </div>
        ))}

        {/* Progress Bar */}
        <div className="slider-progress">
          <div className="slider-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Navigation Arrows */}
        <button
          className="slider-arrow slider-arrow-prev"
          onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          className="slider-arrow slider-arrow-next"
          onClick={() => goToSlide((currentSlide + 1) % slides.length)}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Slide Counter */}
        <div className="slider-counter">
          <span className="slider-counter-current">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="slider-counter-separator">/</span>
          <span className="slider-counter-total">{String(slides.length).padStart(2, '0')}</span>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" data-animate="features">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner with Room Gallery */}
      <section className="cta-banner" data-animate="cta">
        <div className="cta-content">
          <h2>Create Your Dream Home Today</h2>
          <p>Join FurniHub and discover exclusive collections tailored for your style</p>
        </div>
        <div className="room-gallery">
          <div className="room-card">
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80" alt="Living Room" />
            <span>Living Room</span>
          </div>
          <div className="room-card">
            <img src="https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80" alt="Bedroom" />
            <span>Bedroom</span>
          </div>
          <div className="room-card">
            <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" alt="Dining Room" />
            <span>Dining Room</span>
          </div>
          <div className="room-card">
            <img src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80" alt="Office" />
            <span>Office</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
