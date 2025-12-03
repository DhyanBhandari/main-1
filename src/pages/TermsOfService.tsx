import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-32 pb-20">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <p className="text-gray-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using ErthaLoka's website and services, you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
                <p>
                  ErthaLoka provides a platform for planetary health assessment, natural capital valuation, and ecosystem preservation services. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Planetary Health Index (PHI) reports and analysis</li>
                  <li>Digital Natural Capital Asset (Di-NCA) tracking</li>
                  <li>Blockchain Proof of Preservation (B-POP) verification</li>
                  <li>Ecosystem measurement and monitoring tools</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
                <p>As a user of our services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Use the services only for lawful purposes</li>
                  <li>Not attempt to interfere with or disrupt our services</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
                <p>
                  All content, features, and functionality of our services, including but not limited to text, graphics, logos, and software, are the exclusive property of ErthaLoka and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data and Privacy</h2>
                <p>
                  Your use of our services is also governed by our Privacy Policy. By using our services, you consent to the collection and use of information as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                <p>
                  ErthaLoka shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services. Our total liability shall not exceed the amount paid by you, if any, for accessing our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of our services after any modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
                <p>
                  We may terminate or suspend your access to our services immediately, without prior notice, for any reason, including breach of these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
                <p>
                  These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> <a href="mailto:connect@erthaloka.com" className="text-green-600 hover:text-green-700">connect@erthaloka.com</a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
