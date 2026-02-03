import { useState, useEffect, } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo2 from "../assets/logo2.png";
import { authAPI } from "../services/api";
import { setToken, setUser } from "../utils/auth";

const Signup = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation();
    const navigate = useNavigate();
    // Determine initial mode based on URL path
    const [isSignUpMode, setIsSignUpMode] = useState(location.pathname === "/signup");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        setIsSignUpMode(location.pathname === "/signup");
    }, [location.pathname]);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "client",
    });

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Validation functions
    const validateUsername = (name) => {
        if (!name) return true; // Allow empty for required validation
        const firstChar = name.charAt(0);
        return /[a-zA-Z]/.test(firstChar);
    };

    const validateEmail = (email) => {
        if (!email) return true; // Allow empty for required validation
        const firstChar = email.charAt(0);
        return /[a-zA-Z]/.test(firstChar);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Real-time validation for fullName
        if (name === "fullName" && value && !validateUsername(value)) {
            setError("Name must start with a letter, not a number");
        } else if (name === "email" && value && !validateEmail(value)) {
            setError("Email must start with a letter, not a number");
        } else if (error && (name === "fullName" || name === "email")) {
            setError(""); // Clear error if valid
        }
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        
        // Real-time validation for email in login
        if (name === "email" && value && !validateEmail(value)) {
            setError("Email must start with a letter, not a number");
        } else if (error && name === "email") {
            setError(""); // Clear error if valid
        }
        
        setLoginData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!agreedToTerms) {
            setError("Please agree to the Terms and Conditions");
            setLoading(false);
            return;
        }

        // Validate username starts with letter
        if (!validateUsername(formData.fullName)) {
            setError("Name must start with a letter, not a number");
            setLoading(false);
            return;
        }

        // Validate email starts with letter
        if (!validateEmail(formData.email)) {
            setError("Email must start with a letter, not a number");
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.signup(formData);

            if (response.success) {
                // Store token and user data
                setToken(response.token);
                setUser(response.user);

                setSuccess("Account created successfully! Redirecting...");

                // Clear form
                setFormData({ fullName: "", email: "", password: "", role: "client" });

                // Redirect based on role after 1.5 seconds
                setTimeout(() => {
                    if (response.user.role === 'developer') {
                        navigate("/dashboard");
                    } else {
                        navigate("/tester-dashboard");
                    }
                }, 1500);
            }
        } catch (err) {
            setError(err.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!agreedToTerms) {
            setError("Please agree to the Terms and Conditions");
            setLoading(false);
            return;
        }

        // Validate email starts with letter
        if (!validateEmail(loginData.email)) {
            setError("Email must start with a letter, not a number");
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.login(loginData);

            if (response.success) {
                // Store token and user data
                setToken(response.token);
                setUser(response.user);

                setSuccess("Login successful! Redirecting...");

                // Clear form
                setLoginData({ email: "", password: "" });

                // Redirect based on role after 1.5 seconds
                setTimeout(() => {
                    if (response.user.role === 'developer') {
                        navigate("/dashboard");
                    } else {
                        navigate("/tester-dashboard");
                    }
                }, 1500);
            }
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUpMode(!isSignUpMode);
    };

    const styles = {
        container: {
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: "#f0f2f5",
            overflow: "hidden",
            position: "relative",
        },
        // The main card that holds everything
        card: {
            backgroundColor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 14px 28px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.08)",
            position: "relative",
            overflow: "hidden",
            width: isMobile ? "100%" : "900px",
            maxWidth: "100%",
            minHeight: isMobile ? "100vh" : "600px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
        },
        // Forms container (Left/Right sliding area)
        formContainer: {
            position: "absolute",
            top: 0,
            height: "100%",
            transition: "all 0.6s ease-in-out",
            width: isMobile ? "100%" : "50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
            backgroundColor: "#fff",
            zIndex: 2,
        },
        signUpContainer: {
            left: 0,
            opacity: isSignUpMode ? 1 : 0,
            zIndex: isSignUpMode ? 5 : 1,
            // Mobile: Slide vertically. Desktop: Stay fixed on Left (Opacity handles visibility under overlay)
            transform: isMobile
                ? (isSignUpMode ? "translateY(0)" : "translateY(-100%)")
                : "translateX(0)",
            filter: isSignUpMode ? "blur(0)" : "blur(5px)",
        },
        loginContainer: {
            // Mobile: left 0. Desktop: left 50%
            left: isMobile ? 0 : "50%",
            opacity: !isSignUpMode ? 1 : 0,
            zIndex: !isSignUpMode ? 5 : 1,
            // Mobile: Slide vertically. Desktop: Stay fixed on Right
            transform: isMobile
                ? (!isSignUpMode ? "translateY(0)" : "translateY(100%)")
                : "translateX(0)",
            filter: !isSignUpMode ? "blur(0)" : "blur(5px)",
        },

        // Overlay Container (The Sliding Panel)
        overlayContainer: {
            position: "absolute",
            top: 0,
            left: "50%",
            width: "50%",
            height: "100%",
            overflow: "hidden",
            transition: "transform 0.6s ease-in-out",
            zIndex: 100,
            // Signup Mode: Overlay on Right (translateX(0)). Login Mode: Overlay on Left (translateX(-100%)).
            transform: isSignUpMode ? "translateX(0)" : "translateX(-100%)",
            display: isMobile ? "none" : "block",
        },
        overlay: {
            backgroundColor: "#000",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "0 0",
            color: "#ffffff",
            position: "relative",
            left: "-100%",
            height: "100%",
            width: "200%",
            transform: isSignUpMode ? "translateX(0)" : "translateX(50%)",
            transition: "transform 0.6s ease-in-out",
            display: "flex",
            flexDirection: "row",
        },
        overlayPanel: {
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "0 40px",
            textAlign: "center",
            top: 0,
            height: "100%",
            width: "50%",
            transform: "translateX(0)",
            transition: "transform 0.6s ease-in-out",
        },
        overlayLeft: {
            transform: isSignUpMode ? "translateX(-20%)" : "translateX(0)",
            left: 0,
            display: 'flex', flexDirection: 'column',
        },
        overlayRight: {
            right: 0,
            transform: isSignUpMode ? "translateX(0)" : "translateX(20%)",
            display: 'flex', flexDirection: 'column',
        },

        // Shared Elements
        form: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            gap: "12px",
        },
        header: {
            fontWeight: "bold",
            margin: "0 0 20px 0",
            color: "#000",
        },
        input: {
            backgroundColor: "#eee",
            border: "none",
            padding: "12px 15px",
            fontSize: "14px",
            margin: "8px 0",
            width: "100%",
            borderRadius: "4px",
            outline: "none",
        },
        button: {
            borderRadius: "20px",
            border: "1px solid #000",
            backgroundColor: "#000",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "bold",
            padding: "12px 45px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            transition: "transform 80ms ease-in",
            cursor: "pointer",
            marginTop: "10px",
            width: "fit-content",
            alignSelf: "center",
        },
        ghostButton: {
            backgroundColor: "transparent",
            borderColor: "#ffffff",
            borderWidth: "1px",
            borderStyle: "solid",
            color: "#fff",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
            padding: "12px 45px",
            cursor: "pointer",
            textTransform: "uppercase",
            marginTop: "20px",
        },
        select: {
            backgroundColor: "#eee",
            border: "none",
            padding: "12px 15px",
            margin: "8px 0",
            width: "100%",
            borderRadius: "4px",
        },
        mobileToggle: {
            marginTop: "20px",
            color: "#000",
            cursor: "pointer",
            textDecoration: "underline",
            display: isMobile ? "block" : "none",
        },
        logo: {
            height: "40px",
            width: "auto",
            marginBottom: "20px",
            objectFit: "contain",
            maxWidth: "150px", // Constrain width to prevent expansion
        },
        bottomLink: {
            marginTop: "16px",
            fontSize: "12px",
            color: "#666",
            textDecoration: "none",
            cursor: "pointer",
        },
        checkboxContainer: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "12px 0",
            fontSize: "13px",
            textAlign: "left",
        },
        termsLink: {
            color: "#000",
            textDecoration: "underline",
            cursor: "pointer",
            fontWeight: "600",
        },
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
            padding: "1rem",
        },
        modal: {
            backgroundColor: "#fff",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "700px",
            maxHeight: "85vh",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
        modalHeader: {
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        modalTitle: {
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#000",
        },
        modalBody: {
            padding: "2rem",
            maxHeight: "60vh",
            overflowY: "auto",
        },
        modalActions: {
            padding: "1rem 2rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
        },
        modalButton: {
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
        },
        ol: {
            paddingLeft: "20px",
            lineHeight: "1.8",
            fontSize: "14px",
            color: "#333",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* SIGN UP FORM (Visible by default - LEFT SIDE) */}
                <div style={{ ...styles.formContainer, ...styles.signUpContainer }}>
                    <form style={styles.form} onSubmit={handleSignupSubmit}>
                        <img src={logo2} alt="BetaLink Logo" style={styles.logo} />
                        <h1 style={styles.header}>Create Account</h1>

                        {/* Error Message - Moved to Top */}
                        {error && (
                            <div style={{
                                backgroundColor: "#fee",
                                color: "#c33",
                                padding: "10px",
                                borderRadius: "4px",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Success Message - Moved to Top */}
                        {success && (
                            <div style={{
                                backgroundColor: "#efe",
                                color: "#3c3",
                                padding: "10px",
                                borderRadius: "4px",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}>
                                {success}
                            </div>
                        )}

                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            style={styles.input}
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            style={styles.input}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            style={styles.input}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <select
                            name="role"
                            style={styles.select}
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="client">Tester</option>
                            <option value="developer">Developer</option>
                            
                        </select>

                        {/* Terms and Conditions Checkbox */}
                        <div style={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="termsCheckbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={{ cursor: "pointer" }}
                            />
                            <label htmlFor="termsCheckbox" style={{ cursor: "pointer", color: "#333" }}>
                                I agree to the{" "}
                                <span 
                                    style={styles.termsLink}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowTermsModal(true);
                                    }}
                                >
                                    Terms and Conditions
                                </span>
                            </label>
                        </div>

                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? "Signing up..." : "Sign Up"}
                        </button>

                        {/* Mobile Only Switch */}
                        <div style={styles.mobileToggle} onClick={toggleMode}>
                            Already have an account? Sign In
                        </div>

                        <Link to="/" style={styles.bottomLink}>
                            Return to home
                        </Link>
                    </form>
                </div>

                {/* LOGIN FORM (Hidden/Blurred/Slided - RIGHT SIDE) */}
                <div style={{ ...styles.formContainer, ...styles.loginContainer }}>
                    <form style={styles.form} onSubmit={handleLoginSubmit}>
                        <img src={logo2} alt="BetaLink Logo" style={styles.logo} />
                        <h1 style={styles.header}>Sign in</h1>

                        {/* Error Message - Moved to Top */}
                        {error && (
                            <div style={{
                                backgroundColor: "#fee",
                                color: "#c33",
                                padding: "10px",
                                borderRadius: "4px",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Success Message - Moved to Top */}
                        {success && (
                            <div style={{
                                backgroundColor: "#efe",
                                color: "#3c3",
                                padding: "10px",
                                borderRadius: "4px",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}>
                                {success}
                            </div>
                        )}

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            style={styles.input}
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            style={styles.input}
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                        />

                        {/* Terms and Conditions Checkbox */}
                        <div style={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="termsCheckboxLogin"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={{ cursor: "pointer" }}
                            />
                            <label htmlFor="termsCheckboxLogin" style={{ cursor: "pointer", color: "#333" }}>
                                I agree to the{" "}
                                <span 
                                    style={styles.termsLink}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowTermsModal(true);
                                    }}
                                >
                                    Terms and Conditions
                                </span>
                            </label>
                        </div>

                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        {/* Mobile Only Switch */}
                        <div style={styles.mobileToggle} onClick={toggleMode}>
                            New here? Sign Up
                        </div>

                        <Link to="/" style={styles.bottomLink}>
                            Return to home
                        </Link>
                    </form>
                </div>

                {/* OVERLAY CONTAINER (Desktop Animation) */}
                <div style={styles.overlayContainer}>
                    <div style={styles.overlay}>

                        {/* OVERLAY LEFT (Visible when Login Mode is active -> Covers Signup)
                Shows: "Hello, Friend!" -> "Sign Up" button.
            */}
                        <div style={{ ...styles.overlayPanel, ...styles.overlayLeft }}>
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start journey with us</p>
                            <button style={styles.ghostButton} onClick={toggleMode}>
                                Sign Up
                            </button>
                        </div>

                        {/* OVERLAY RIGHT (Visible when Signup Mode is active -> Covers Login)
                Shows: "Welcome Back!" -> "Sign In" button.
            */}
                        <div style={{ ...styles.overlayPanel, ...styles.overlayRight }}>
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button style={styles.ghostButton} onClick={toggleMode}>
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Terms and Conditions Modal */}
            {showTermsModal && (
                <div style={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Terms and Conditions</h2>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#666",
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{ maxHeight: '68vh', overflowY: 'auto', paddingRight: 8 }}>
                                <ol style={styles.ol}>
                                    <li><strong>Acceptance of Terms</strong>: By creating an account or using this platform, you confirm that you have read, understood, and agreed to these Terms and Conditions. If you do not agree, please do not use the application.</li>
                                    <li><strong>Purpose of the Platform</strong>: BetaLink is a bug testing and reporting platform where developers upload applications for testing, testers identify bugs and submit reports, and the platform is intended only for educational, testing, and evaluation purposes.</li>
                                    <li><strong>User Responsibilities</strong>: All users agree to provide accurate and truthful information, use the platform only for lawful and ethical purposes, not upload malicious software or harmful code, and not misuse or exploit the platform or its users.</li>
                                    <li><strong>Developer Responsibilities</strong>: Developers agree they have full rights to upload the application, uploaded applications are safe for testing, they will fairly review and evaluate bug reports, and will not intentionally ignore, reject, or misuse valid bug reports to avoid rewards.</li>
                                    <li><strong>Tester Responsibilities</strong>: Testers agree that bug reports must be genuine, reproducible, and clearly explained; no false, spam, or copied reports will be submitted; confidential data accessed during testing will not be shared.</li>
                                    <li><strong>Rewards &amp; Fair Usage Policy</strong>: If a tester submits a valid and verified bug report, the developer must not deny or withhold the promised reward without a valid reason. BetaLink may review disputes and may issue warnings, suspend accounts, or restrict posting for repeated unfair practices.</li>
                                    <li><strong>Intellectual Property</strong>: All applications and reports belong to their respective owners. BetaLink does not claim ownership of uploaded apps or bug reports. Users may not copy or redistribute content without permission.</li>
                                    <li><strong>Data &amp; Privacy</strong>: User data is collected only to support platform functionality. Personal data will not be sold or misused. Uploaded files and reports may be stored for platform improvement.</li>
                                    <li><strong>Limitation of Liability</strong>: BetaLink is provided "as is" without warranties. We are not responsible for data loss, application failures, security issues within uploaded apps, or any damages caused by platform usage.</li>
                                    <li><strong>Account Suspension &amp; Termination</strong>: Accounts may be suspended or terminated if users violate these Terms &amp; Conditions, engage in unethical behavior, or attempt to cheat, exploit, or harm other users.</li>
                                    <li><strong>Changes to Terms</strong>: BetaLink reserves the right to update these Terms at any time. Continued use implies acceptance of the revised terms.</li>
                                    <li><strong>Governing Law</strong>: These Terms are governed by the laws of India.</li>
                                </ol>
                            </div>
                        </div>
                        <div style={styles.modalActions}>
                            <button
                                style={styles.modalButton}
                                onClick={() => setShowTermsModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;