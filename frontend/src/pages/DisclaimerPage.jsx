import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Risk <span className="text-primary">Disclaimer</span>
            </h1>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
            <p className="text-amber-200 font-medium">
              Important: Cryptocurrency investments carry significant risk. Please read this disclaimer carefully before using our educational content or making any investment decisions.
            </p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg mb-8">
              Last updated: January 2025
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Educational Purpose Only</h2>
              <p className="text-slate-300 mb-4">
                All content provided on TheCryptoCoach.io, including courses, lessons, articles, and AI mentor responses, is strictly for educational purposes. Nothing on this Platform constitutes:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Financial advice</li>
                <li>Investment advice</li>
                <li>Trading recommendations</li>
                <li>Legal advice</li>
                <li>Tax advice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Cryptocurrency Risks</h2>
              <p className="text-slate-300 mb-4">
                Cryptocurrency investments involve substantial risk of loss. You should be aware that:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Cryptocurrency prices are highly volatile and can fluctuate significantly</li>
                <li>You may lose some or all of your invested capital</li>
                <li>Past performance is not indicative of future results</li>
                <li>Regulatory changes may impact cryptocurrency value and legality</li>
                <li>Exchanges and wallets may be subject to hacks or technical failures</li>
                <li>There is no guarantee of liquidity in cryptocurrency markets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Not Professional Advice</h2>
              <p className="text-slate-300 mb-4">
                The information provided on TheCryptoCoach.io should not be considered a substitute for professional financial advice. Before making any investment decisions:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Consult with a qualified financial advisor</li>
                <li>Conduct your own research (DYOR)</li>
                <li>Consider your financial situation and risk tolerance</li>
                <li>Only invest what you can afford to lose</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Trading Simulator Disclaimer</h2>
              <p className="text-slate-300 mb-4">
                The trading simulator on TheCryptoCoach.io:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Uses simulated prices that may differ from actual market prices</li>
                <li>Does not involve real money or cryptocurrency</li>
                <li>Results do not represent actual trading performance</li>
                <li>Should not be used to predict real trading outcomes</li>
                <li>Is designed purely for educational practice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">AI Mentor Disclaimer</h2>
              <p className="text-slate-300 mb-4">
                The CryptoCoach AI mentor:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Provides educational information only</li>
                <li>May not always provide accurate or current information</li>
                <li>Should not be relied upon for investment decisions</li>
                <li>Is not a substitute for human professional advice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">No Guarantees</h2>
              <p className="text-slate-300 mb-4">
                TheCryptoCoach.io makes no guarantees about:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>The accuracy, completeness, or timeliness of content</li>
                <li>Any particular outcome from applying our educational content</li>
                <li>The suitability of content for your specific situation</li>
                <li>Future cryptocurrency market conditions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Your Responsibility</h2>
              <p className="text-slate-300 mb-4">
                By using TheCryptoCoach.io, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>You are solely responsible for your investment decisions</li>
                <li>You will seek professional advice when appropriate</li>
                <li>You understand the risks of cryptocurrency investments</li>
                <li>TheCryptoCoach.io is not liable for any losses you may incur</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Questions</h2>
              <p className="text-slate-300 mb-4">
                If you have questions about this disclaimer, please{' '}
                <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
