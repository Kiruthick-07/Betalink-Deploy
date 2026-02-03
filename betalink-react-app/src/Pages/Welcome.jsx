import { useState, useEffect } from "react";
import logo2 from "../assets/logo2.png";
import bgimg1 from "../assets/bgimg1.jpg";
import { HiBeaker, HiBugAnt, HiLightBulb, HiCheckCircle, HiUsers, HiShieldCheck, HiRocketLaunch } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import axios from "axios";

const Welcome = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll animation effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const styles = {
    /* ================= NAVBAR ================= */
    navbar: {
      position: "sticky",
      top: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "12px 16px" : "12px 20px",
      borderBottom: "1px solid #e5e5e5",
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: "#fff",
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },

    leftGroup: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      flex: isMobile ? 1 : "0 0 auto",
    },

    logoImage: {
      height: "44px",
      width: "auto",
      objectFit: "contain",
    },

    centerSection: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      display: isMobile ? "none" : "flex",
      gap: "80px",
      fontSize: "14px",
      fontWeight: "500",
      pointerEvents: "auto",
    },

    link: {
      cursor: "pointer",
      whiteSpace: "nowrap",
      paddingBottom: "4px",
      borderBottom: "2px solid transparent",
      transition: "border-bottom 0.3s ease",
    },

    rightGroup: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "12px" : "24px",
      justifyContent: "flex-end",
    },

    login: {
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      border: "2px solid #000",
      padding: "8px 18px",
      borderRadius: "8px",
      color: "black",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
    },

    signup: {
      backgroundColor: "#000",
      color: "#fff",
      padding: "10px 22px",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
    },

    hamburger: {
      fontSize: "24px",
      cursor: "pointer",
      display: isMobile ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px",
      borderRadius: "6px",
      transition: "background-color 0.2s ease",
    },

    mobileMenu: {
      display: menuOpen ? "flex" : "none",
      flexDirection: "column",
      gap: "12px",
      padding: "20px",
      backgroundColor: "#fff",
      borderBottom: "1px solid #e5e5e5",
      fontSize: "14px",
      fontFamily: "'Poppins', sans-serif",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      position: "sticky",
      top: "70px",
      zIndex: 999,
    },

    /* ================= HERO ================= */
    heroSection: {
      position: "relative",
      width: "100%",
    },

    heroImage: {
      height: "700px",
      width: "100%",
      objectFit: "cover",
      display: "block",
    },

    heroOverlay: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
    },

    heroContent: {
      position: "absolute",
      top: "50%",
      left: isMobile ? "20px" : "60px",
      transform: "translateY(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: isMobile ? "16px" : "20px",
      maxWidth: isMobile ? "90%" : "720px",
      color: "#fff",
      zIndex: 2,
      fontFamily: "'Poppins', sans-serif",
    },

    heroTitle: {
      fontSize: isMobile ? "26px" : "54px",
      fontWeight: "700",
      lineHeight: "1.25",
      textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
    },

    heroSubtext: {
      fontSize: isMobile ? "15px" : "18px",
      fontWeight: "400",
      lineHeight: "1.6",
      color: "#e5e7eb",
      maxWidth: "640px",
    },

    heroButton: {
      marginTop: "20px",
      backgroundColor: "#000",
      color: "#fff",
      padding: isMobile ? "12px 28px" : "16px 32px",
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "600",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },

    /* ================= ANIMATIONS ================= */
    animateSection: {
      opacity: 0,
      transform: "translateY(50px)",
      transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
    },

    animateSectionVisible: {
      opacity: 1,
      transform: "translateY(0)",
    },

    /* ================= ABOUT ================= */
    aboutSection: {
      padding: isMobile ? "60px 20px" : "100px 60px",
      backgroundColor: "#fff",
      fontFamily: "'Poppins', sans-serif",
    },

    aboutContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
    },

    aboutHeader: {
      textAlign: "center",
      marginBottom: isMobile ? "40px" : "60px",
    },

    aboutTitle: {
      fontSize: isMobile ? "32px" : "48px",
      fontWeight: "700",
      color: "#000",
      marginBottom: "16px",
    },

    aboutDescription: {
      fontSize: isMobile ? "16px" : "18px",
      color: "#6b7280",
      lineHeight: "1.6",
      maxWidth: "800px",
      margin: "0 auto",
    },

    featuresGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: isMobile ? "24px" : "32px",
      marginTop: isMobile ? "40px" : "60px",
    },

    featureCard: {
      padding: isMobile ? "28px" : "36px",
      backgroundColor: "#f9fafb",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      border: "1px solid #e5e7eb",
    },

    featureIcon: {
      fontSize: "40px",
      marginBottom: "20px",
    },

    featureTitle: {
      fontSize: isMobile ? "20px" : "22px",
      fontWeight: "600",
      color: "#000",
      marginBottom: "12px",
    },

    featureText: {
      fontSize: "15px",
      color: "#6b7280",
      lineHeight: "1.6",
    },

    /* ================= ADDITIONAL ABOUT ================= */
    additionalAboutSection: {
      padding: isMobile ? "60px 20px" : "100px 60px",
      backgroundColor: "#f9fafb",
      fontFamily: "'Poppins', sans-serif",
    },

    additionalAboutContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
    },

    aboutGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? "40px" : "60px",
      alignItems: "center",
    },

    aboutContentLeft: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },

    aboutSectionTitle: {
      fontSize: isMobile ? "36px" : "52px",
      fontWeight: "700",
      color: "#000",
      lineHeight: "1.2",
      marginBottom: "16px",
    },

    aboutSectionText: {
      fontSize: isMobile ? "16px" : "18px",
      color: "#4b5563",
      lineHeight: "1.8",
      marginBottom: "12px",
    },

    statsContainer: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, 1fr)",
      gap: "20px",
      marginTop: "32px",
    },

    statCard: {
      padding: "24px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      textAlign: "center",
      transition: "all 0.3s ease",
    },

    statNumber: {
      fontSize: isMobile ? "32px" : "40px",
      fontWeight: "700",
      color: "#000",
      marginBottom: "8px",
    },

    statLabel: {
      fontSize: "14px",
      color: "#6b7280",
      fontWeight: "500",
    },

    aboutContentRight: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },

    benefitItem: {
      display: "flex",
      gap: "16px",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      transition: "all 0.3s ease",
    },

    benefitIcon: {
      fontSize: "24px",
      color: "#000",
      flexShrink: 0,
    },

    benefitContent: {
      flex: 1,
    },

    benefitTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#000",
      marginBottom: "8px",
    },

    benefitDescription: {
      fontSize: "14px",
      color: "#6b7280",
      lineHeight: "1.6",
    },

    /* ================= CONTACT ================= */
    contactSection: {
      padding: isMobile ? "40px 20px" : "60px 40px",
      backgroundColor: "#333333ff",
      fontFamily: "'Poppins', sans-serif",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0 auto",
      borderRadius: "20px",
      maxWidth: "85%",
    },

    contactContainer: {
      maxWidth: "800px",
      margin: "0 auto",
      width: "100%",
    },

    contactHeader: {
      textAlign: "center",
      marginBottom: isMobile ? "40px" : "50px",
    },

    contactTitle: {
      fontSize: isMobile ? "32px" : "48px",
      fontWeight: "700",
      color: "#fff",
      marginBottom: "16px",
    },

    contactDescription: {
      fontSize: isMobile ? "16px" : "18px",
      color: "#e5e7eb",
      lineHeight: "1.6",
    },

    contactForm: {
      backgroundColor: "#fff",
      padding: isMobile ? "32px 24px" : "48px 40px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
    },

    formGroup: {
      marginBottom: "24px",
    },

    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      color: "#000",
      marginBottom: "8px",
    },

    input: {
      width: "100%",
      padding: "12px 16px",
      fontSize: "15px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontFamily: "'Poppins', sans-serif",
      transition: "border-color 0.3s ease",
      outline: "none",
    },

    textarea: {
      width: "100%",
      padding: "12px 16px",
      fontSize: "15px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontFamily: "'Poppins', sans-serif",
      transition: "border-color 0.3s ease",
      outline: "none",
      resize: "vertical",
      minHeight: "120px",
    },

    submitButton: {
      width: "100%",
      backgroundColor: "#000",
      color: "#fff",
      padding: "14px 32px",
      fontSize: "16px",
      fontWeight: "600",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontFamily: "'Poppins', sans-serif",
      transition: "all 0.3s ease",
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:5000/api/contact', formData);
      
      if (response.data.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: response.data.message 
        });
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send message. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnimationStyle = (sectionId) => {
    const baseStyle = styles.animateSection;
    const visibleStyle = styles.animateSectionVisible;
    return visibleSections.has(sectionId)
      ? { ...baseStyle, ...visibleStyle }
      : baseStyle;
  };

  const handleNavClick = (item) => {
    if (item === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item === 'Find Tester') {
      navigate('/signup');
    } else if (item === 'Find Developer') {
      navigate('/signup');
    } else if (item === 'About') {
      const aboutSection = document.getElementById('about-section');
      aboutSection?.scrollIntoView({ behavior: 'smooth' });
    } else if (item === 'Contact') {
      const contactSection = document.getElementById('contact-section');
      contactSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const NavLinks = () =>
    ["Home",  "About", "Contact"].map(
      (item) => (
        <div
          key={item}
          style={styles.link}
          onClick={() => handleNavClick(item)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderBottom = "2px solid #000")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderBottom = "2px solid transparent")
          }
        >
          {item}
        </div>
      )
    );

  return (
    <>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.leftGroup}>
          <img src={logo2} alt="BetaLink Logo" style={styles.logoImage} />
        </div>

        <div style={styles.centerSection}>
          <NavLinks />
        </div>

        <div style={styles.rightGroup}>
          {!isMobile && (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <div style={styles.login}>Log in</div>
              </Link>
              <Link to="/signup" style={{ textDecoration: "none" }}>
                <div style={styles.signup}>Sign up</div>
              </Link>
            </>
          )}
          <div
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div style={styles.mobileMenu}>
        <NavLinks />
        <Link to="/login" style={{ textDecoration: "none" }}>
          <div style={styles.login}>Log in</div>
        </Link>
        <Link to="/signup" style={{ textDecoration: "none" }}>
          <div style={styles.signup}>Sign up</div>
        </Link>
      </div>

      {/* HERO */}
      <div style={styles.heroSection}>
        <img src={bgimg1} alt="Hero" style={styles.heroImage} />
        <div style={styles.heroOverlay}></div>

        <div style={styles.heroContent}>
          <div style={styles.heroTitle}>
            Build. Test. Launch — With Confidence.
          </div>

          <div style={styles.heroSubtext}>
            Launch better products by connecting with real users who test,
            report bugs, and give actionable feedback before you go live.
          </div>

          <button
            style={styles.heroButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#333";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div
        id="about-section"
        data-animate
        style={{ ...styles.aboutSection, ...getAnimationStyle("about-section") }}
      >
        <div style={styles.aboutContainer}>
          <div style={styles.aboutHeader}>
            <h2 style={styles.aboutTitle}>Why Choose BetaLink?</h2>
            <p style={styles.aboutDescription}>
              Connect with real users who provide valuable insights before your product launch.
              Get comprehensive testing, detailed bug reports, and actionable feedback to ensure
              your product is market-ready.
            </p>
          </div>

          <div style={styles.featuresGrid}>
            <div
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.featureIcon}>
                <HiBeaker />
              </div>
              <h3 style={styles.featureTitle}>Real User Testing</h3>
              <p style={styles.featureText}>
                Get your product tested by actual users in real-world scenarios.
                Discover usability issues before they impact your launch.
              </p>
            </div>

            <div
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.featureIcon}>
                <HiBugAnt />
              </div>
              <h3 style={styles.featureTitle}>Detailed Bug Reports</h3>
              <p style={styles.featureText}>
                Receive comprehensive bug reports with screenshots, steps to reproduce,
                and severity ratings to prioritize fixes.
              </p>
            </div>

            <div
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.featureIcon}>
                <HiLightBulb />
              </div>
              <h3 style={styles.featureTitle}>Actionable Feedback</h3>
              <p style={styles.featureText}>
                Gain valuable insights and suggestions from testers to improve
                user experience and product functionality.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* CONTACT SECTION */}
      <div
        id="contact-section"
        data-animate
        style={{ ...styles.contactSection, ...getAnimationStyle("contact-section") }}
      >
        <div style={styles.contactContainer}>
          <div style={styles.contactHeader}>
            <h2 style={styles.contactTitle}>Customer Support</h2>
            <p style={styles.contactDescription}>
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          {submitStatus.message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: submitStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: submitStatus.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {submitStatus.message}
            </div>
          )}

          <form style={styles.contactForm} onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                required
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                required
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="message" style={styles.label}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                style={styles.textarea}
                required
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#333";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isSubmitting ? "#666" : "#000";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      {/* ADDITIONAL ABOUT SECTION */}
      <div
        id="additional-about-section"
        data-animate
        style={{ ...styles.additionalAboutSection, ...getAnimationStyle("additional-about-section") }}
      >
        <div style={styles.additionalAboutContainer}>
          <div style={styles.aboutGrid}>
            {/* Left Column - Story & Stats */}
            <div style={styles.aboutContentLeft}>
              <h2 style={styles.aboutSectionTitle}>
                Empowering Innovation Through Collaboration
              </h2>
              <p style={styles.aboutSectionText}>
                BetaLink bridges the gap between developers and real-world users, creating a seamless ecosystem where products are refined through genuine feedback and rigorous testing.
              </p>
              <p style={styles.aboutSectionText}>
                Our platform has helped hundreds of teams launch better products by connecting them with passionate testers who provide invaluable insights before market release.
              </p>

              {/* Statistics */}
              <div style={styles.statsContainer}>
                <div
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.statNumber}>500+</div>
                  <div style={styles.statLabel}>Active Testers</div>
                </div>
                <div
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.statNumber}>1000+</div>
                  <div style={styles.statLabel}>Projects Tested</div>
                </div>
                <div
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.statNumber}>98%</div>
                  <div style={styles.statLabel}>Success Rate</div>
                </div>
                <div
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.statNumber}>24/7</div>
                  <div style={styles.statLabel}>Support</div>
                </div>
              </div>
            </div>

            {/* Right Column - Benefits */}
            <div style={styles.aboutContentRight}>
              <div
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(8px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={styles.benefitIcon}>
                  <HiCheckCircle />
                </div>
                <div style={styles.benefitContent}>
                  <h4 style={styles.benefitTitle}>Quality Assurance</h4>
                  <p style={styles.benefitDescription}>
                    Ensure your product meets the highest standards with thorough testing from experienced professionals.
                  </p>
                </div>
              </div>

              <div
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(8px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={styles.benefitIcon}>
                  <HiUsers />
                </div>
                <div style={styles.benefitContent}>
                  <h4 style={styles.benefitTitle}>Community Driven</h4>
                  <p style={styles.benefitDescription}>
                    Join a vibrant community of developers and testers working together to build better products.
                  </p>
                </div>
              </div>

              <div
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(8px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={styles.benefitIcon}>
                  <HiShieldCheck />
                </div>
                <div style={styles.benefitContent}>
                  <h4 style={styles.benefitTitle}>Secure & Reliable</h4>
                  <p style={styles.benefitDescription}>
                    Your projects are protected with enterprise-grade security and confidentiality agreements.
                  </p>
                </div>
              </div>

              <div
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(8px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={styles.benefitIcon}>
                  <HiRocketLaunch />
                </div>
                <div style={styles.benefitContent}>
                  <h4 style={styles.benefitTitle}>Fast Turnaround</h4>
                  <p style={styles.benefitDescription}>
                    Get comprehensive testing results quickly so you can iterate and launch faster than ever.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
};

export default Welcome;
