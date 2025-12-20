import { Link } from "react-router-dom";
import logo from "@/assets/logo-new.png";

const Footer = () => {
    return (
        <footer className="relative z-50 bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-16 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="block">
                            <img src={logo} alt="ErthaLoka Logo" className="h-10 w-auto" />
                        </Link>
                        <p className="text-[#0D2821] leading-relaxed max-w-sm">
                            The Operating System for the Natural Economy. Where Preservation is More Profitable Than Destruction.
                        </p>
                        {/* <div className="flex items-center gap-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div> */}
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-[#0D2821] uppercase">For You</h3>
                            <ul className="space-y-4">
                                {[{ name: "Landowners", path: "/landowners" }, { name: "Corporates & Investors", path: "/corporates-investors" }, { name: "Financial Institutions", path: "/financial-institutions" }].map((item) => (
                                    <li key={item.name}>
                                        <Link to={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block cursor-pointer">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Technology</h3>
                            <ul className="space-y-4">
                                {[{ name: "Trust Center", path: "/technology" }, { name: "PHI Framework", path: "/abcde-framework" }, { name: "EPA Registry", path: "/projects/current" }].map((item) => (
                                    <li key={item.name}>
                                        <Link to={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block cursor-pointer">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Process</h3>
                            <ul className="space-y-4">
                                {[{ name: "DMRV", path: "/measure" }, { name: "NCA", path: "/verify" }, { name: "Blockchain", path: "/blockchain" }].map((item) => (
                                    <li key={item.name}>
                                        <Link to={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block cursor-pointer">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Company</h3>
                            <ul className="space-y-4">
                                {[{ name: "About Us", path: "/about" }, { name: "Contact", path: "mailto:connect@erthaloka.com" }].map((item) => (
                                    <li key={item.name}>
                                        {item.path.startsWith("mailto:") ? (
                                            <a href={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block cursor-pointer">
                                                {item.name}
                                            </a>
                                        ) : (
                                            <Link to={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block cursor-pointer">
                                                {item.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} ErthaLoka. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-green-600 transition-colors cursor-pointer">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="text-sm text-gray-400 hover:text-green-600 transition-colors cursor-pointer">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
