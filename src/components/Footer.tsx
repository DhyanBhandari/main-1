import logo from "@/assets/logo-new.png";
import { Mail, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigateToSection = (sectionId: string) => {
        // Check if we're on the home page
        if (location.pathname === "/" || location.pathname === "/single") {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            // Navigate to home page with hash
            navigate(`/#${sectionId}`);
        }
    };

    const goHome = () => {
        if (location.pathname === "/" || location.pathname === "/single") {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate("/");
        }
    };

    return (
        <footer className="relative z-50 bg-[#0D2821] pt-16 pb-8">
            <div className="container px-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <button onClick={goHome} className="block">
                            <img src={logo} alt="ErthaLoka Logo" className="h-10 w-auto brightness-0 invert" />
                        </button>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The Operating System for the Natural Economy. Where Preservation is More Profitable Than Destruction.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { name: "Technology", id: "technology" },
                                { name: "Solutions", id: "solutions" },
                                { name: "EPA Collectives", id: "epa-collectives" },
                                { name: "About", id: "about" },
                            ].map((item) => (
                                <li key={item.name}>
                                    <button
                                        onClick={() => navigateToSection(item.id)}
                                        className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm"
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solutions */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Solutions</h3>
                        <ul className="space-y-3">
                            {["Corporates", "Banks & Financial Institutions", "Investors"].map((item) => (
                                <li key={item}>
                                    <button
                                        onClick={() => navigateToSection("solutions")}
                                        className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm"
                                    >
                                        {item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Contact</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:connect@erthaloka.com"
                                    className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    connect@erthaloka.com
                                </a>
                            </li>
                            <li className="text-gray-400 text-sm flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Bangalore, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} ErthaLoka. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-gray-500 hover:text-green-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-sm text-gray-500 hover:text-green-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
