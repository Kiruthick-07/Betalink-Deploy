import { useState, useEffect } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaGithub } from "react-icons/fa";

const Footer = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const styles = {
        footer: {
            backgroundColor: "#1a1a1a",
            color: "#fff",
            padding: isMobile ? "40px 20px 20px" : "60px 60px 30px",
            fontFamily: "'Poppins', sans-serif",
        },

        footerContainer: {
            maxWidth: "1200px",
            margin: "0 auto",
        },

        footerGrid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr",
            gap: isMobile ? "32px" : "40px",
            marginBottom: "40px",
        },

        footerSection: {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
        },

        footerTitle: {
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#fff",
        },

        footerText: {
            fontSize: "14px",
            color: "#b0b0b0",
            lineHeight: "1.6",
        },

        footerLink: {
            fontSize: "14px",
            color: "#b0b0b0",
            cursor: "pointer",
            transition: "color 0.3s ease",
            textDecoration: "none",
        },

        socialIcons: {
            display: "flex",
            gap: "16px",
            marginTop: "8px",
        },

        socialIcon: {
            fontSize: "20px",
            color: "#b0b0b0",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },

        footerBottom: {
            borderTop: "1px solid #333",
            paddingTop: "24px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: isMobile ? "16px" : "0",
        },

        copyright: {
            fontSize: "14px",
            color: "#808080",
        },

        bottomLinks: {
            display: "flex",
            gap: "24px",
            fontSize: "14px",
        },

        bottomLink: {
            color: "#808080",
            cursor: "pointer",
            transition: "color 0.3s ease",
        },
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.footerContainer}>
                {/* Footer Grid */}
                <div style={styles.footerGrid}>
                    {/* About Section */}
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>BetaLink</h3>
                        <p style={styles.footerText}>
                            Connecting developers with real-world testers to build better products through genuine feedback and rigorous testing.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>Quick Links</h3>
                        <a
                            href="#home"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Home
                        </a>
                        <a
                            href="#about"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            About Us
                        </a>
                        <a
                            href="#services"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Services
                        </a>
                        <a
                            href="#contact"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Contact
                        </a>
                    </div>

                    {/* For Developers */}
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>For Developers</h3>
                        <a
                            href="#find-testers"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Find Testers
                        </a>
                        <a
                            href="#pricing"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Pricing
                        </a>
                        <a
                            href="#documentation"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Documentation
                        </a>
                        <a
                            href="#api"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            API
                        </a>
                    </div>

                    {/* For Testers */}
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerTitle}>For Testers</h3>
                        <a
                            href="#become-tester"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Become a Tester
                        </a>
                        <a
                            href="#how-it-works"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            How It Works
                        </a>
                        <a
                            href="#guidelines"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            Guidelines
                        </a>
                        <a
                            href="#faq"
                            style={styles.footerLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#b0b0b0")}
                        >
                            FAQ
                        </a>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div style={styles.footerBottom}>
                    <p style={styles.copyright}>
                        © {new Date().getFullYear()} BetaLink. All rights reserved.
                    </p>
                    <div style={styles.bottomLinks}>
                        <span
                            style={styles.bottomLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#808080")}
                        >
                            Privacy Policy
                        </span>
                        <span
                            style={styles.bottomLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#808080")}
                        >
                            Terms of Service
                        </span>
                        <span
                            style={styles.bottomLink}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#808080")}
                        >
                            Cookie Policy
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
