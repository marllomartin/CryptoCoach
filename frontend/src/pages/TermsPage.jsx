import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8">
            Terms of <span className="text-primary">Service</span>
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg mb-8">
              Last updated: January 2025
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="text-slate-300 mb-4">
                By accessing or using TheCryptoCoach.io ("the Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">2. Educational Purpose</h2>
              <p className="text-slate-300 mb-4">
                The content provided on TheCryptoCoach.io is for educational purposes only. We do not provide financial, investment, legal, or tax advice. All information is general in nature and should not be relied upon for making investment decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-slate-300 mb-4">
                When you create an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>One account per person</li>
                <li>Account sharing is prohibited</li>
                <li>You must notify us of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">4. Intellectual Property</h2>
              <p className="text-slate-300 mb-4">
                All content on TheCryptoCoach.io, including courses, lessons, quizzes, and materials, is owned by TheCryptoCoach.io or its licensors. You may not reproduce, distribute, or create derivative works without explicit permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">5. Certificates</h2>
              <p className="text-slate-300 mb-4">
                Certificates earned on TheCryptoCoach.io represent completion of educational coursework. They do not constitute professional certifications, licenses, or qualifications recognized by regulatory bodies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">6. Trading Simulator</h2>
              <p className="text-slate-300 mb-4">
                The trading simulator uses virtual funds and simulated market data. Results achieved in the simulator are not indicative of actual trading results. No real cryptocurrency or money is involved.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">7. Limitation of Liability</h2>
              <p className="text-slate-300 mb-4">
                TheCryptoCoach.io shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform or any content therein.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">8. Changes to Terms</h2>
              <p className="text-slate-300 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or Platform notification. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">9. Contact</h2>
              <p className="text-slate-300 mb-4">
                For questions about these Terms, please contact us at{' '}
                <Link to="/contact" className="text-primary hover:underline">our contact page</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
