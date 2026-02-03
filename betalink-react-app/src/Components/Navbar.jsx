import { useState, useEffect } from "react";
import logo2 from "../assets/logo2.png";

const Navbar = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const styles = {
        navbar: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid #e5e5e5",
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: "#fff",
            zIndex: 10,
        },

        leftGroup: {
            display: "flex",
            alignItems: "center",
            gap: "14px",
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
            gap: "40px",
            fontSize: "14px",
            fontWeight: "500",
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
            gap: "24px",
        },

        login: {
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            border: "2px solid #000",
            padding: "8px 18px",
            borderRadius: "8px",
        },

        signup: {
            backgroundColor: "#000",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
        },

        hamburger: {
            fontSize: "24px",
            cursor: "pointer",
            display: isMobile ? "block" : "none",
        },

        mobileMenu: {
            display: menuOpen ? "flex" : "none",
            flexDirection: "column",
            gap: "16px",
            padding: "20px",
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e5e5",
            fontSize: "14px",
            fontFamily: "'Poppins', sans-serif",
        },
    };

    const NavLinks = () =>
        ["Home", "Find Tester", "Find Developer", "About", "Contact"].map(
            (item) => (
                <div
                    key={item}
                    style={styles.link}
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
                            <div style={styles.login}>Log in</div>
                            <div style={styles.signup}>Sign up</div>
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
                <div style={styles.login}>Log in</div>
                <div style={styles.signup}>Sign up</div>
            </div>
        </>
    );
};

export default Navbar;