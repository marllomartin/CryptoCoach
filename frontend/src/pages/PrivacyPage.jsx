import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8">
            Privacy <span className="text-primary">Policy</span>
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg mb-8">
              Last updated: January 2025
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-slate-300 mb-4">
                We collect information you provide directly:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Account information (name, email, password)</li>
                <li>Learning progress and quiz/exam results</li>
                <li>Contact form submissions</li>
                <li>Trading simulator activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">2. How We Use Information</h2>
              <p className="text-slate-300 mb-4">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Provide and improve our educational services</li>
                <li>Track your learning progress</li>
                <li>Issue certificates for completed courses</li>
                <li>Respond to your inquiries</li>
                <li>Send educational updates (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">3. Data Security</h2>
              <p className="text-slate-300 mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Secure password hashing</li>
                <li>Regular security audits</li>
                <li>Limited employee access to personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">4. Data Sharing</h2>
              <p className="text-slate-300 mb-4">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Service providers who assist in operating our Platform</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">5. Your Rights</h2>
              <p className="text-slate-300 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">6. Cookies</h2>
              <p className="text-slate-300 mb-4">
                We use essential cookies for Platform functionality and optional analytics cookies to improve our services. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">7. Children's Privacy</h2>
              <p className="text-slate-300 mb-4">
                TheCryptoCoach.io is not intended for users under 18 years of age. We do not knowingly collect information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">8. Changes to This Policy</h2>
              <p className="text-slate-300 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or Platform notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">9. Contact Us</h2>
              <p className="text-slate-300 mb-4">
                For privacy-related questions or to exercise your rights, please contact us at{' '}
                <Link to="/contact" className="text-primary hover:underline">our contact page</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
