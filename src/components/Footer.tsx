import { Link } from "react-router-dom";
import logo from "@/assets/logo-new.png";
import { Facebook, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-#0D2821 border-t border-gray-100 pt-16 pb-8 ">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="block">
                            <img src={logo} alt="ErthaLoka Logo" className="h-10 w-auto" />
                        </Link>
                        <p className="text-gray-500 leading-relaxed max-w-sm">
                            We turn the planet's health into its most valuable asset. Join us in building the first economy that grows by healing.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Platform</h3>
                            <ul className="space-y-4">
                                {[{ name: "Measure", path: "/measure" }, { name: "Verify", path: "/verify" }, { name: "Proprietary", path: "/abcde-framework" }, { name: "Marketplace", path: "/current-projects" }].map((item) => (
                                    <li key={item.name}>
                                        <Link to={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Use Cases</h3>
                            <ul className="space-y-4">
                                {[{ name: "Investors", path: "/investors" }, { name: "Corporates", path: "/corporates" }, { name: "Communities", path: "#" }, { name: "Governments", path: "#" }].map((item) => (
                                    <li key={item.name}>
                                        <Link to={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Company</h3>
                            <ul className="space-y-4">
                                {[{ name: "About Us", path: "/about" }, { name: "Technology", path: "/technology" }, { name: "Careers", path: "#" }, { name: "Blog", path: "#" }].map((item) => (
                                    <li key={item.name}>
                                        <Link to={item.path} className="text-gray-500 hover:text-green-600 transition-colors duration-200 block">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Stay Updated</h3>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">Subscribe to our newsletter for the latest updates.</p>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} ErthaLoka. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link to="#" className="text-sm text-gray-400 hover:text-green-600 transition-colors">Privacy Policy</Link>
                        <Link to="#" className="text-sm text-gray-400 hover:text-green-600 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
