import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DisclaimerPage() {
  const { t } = useTranslation();

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
              {t('disclaimer.title')} <span className="text-primary">{t('disclaimer.titleHighlight')}</span>
            </h1>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
            <p className="text-amber-200 font-medium">
              {t('disclaimer.warning')}
            </p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg mb-8">
              {t('disclaimer.lastUpdated')}
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s1Title')}</h2>
              <p className="text-slate-300 mb-4">{t('disclaimer.s1Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('disclaimer.s1Li1')}</li>
                <li>{t('disclaimer.s1Li2')}</li>
                <li>{t('disclaimer.s1Li3')}</li>
                <li>{t('disclaimer.s1Li4')}</li>
                <li>{t('disclaimer.s1Li5')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s2Title')}</h2>
              <p className="text-slate-300 mb-4">{t('disclaimer.s2Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('disclaimer.s2Li1')}</li>
                <li>{t('disclaimer.s2Li2')}</li>
                <li>{t('disclaimer.s2Li3')}</li>
                <li>{t('disclaimer.s2Li4')}</li>
                <li>{t('disclaimer.s2Li5')}</li>
                <li>{t('disclaimer.s2Li6')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s3Title')}</h2>
              <p className="text-slate-300 mb-4">{t('disclaimer.s3Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('disclaimer.s3Li1')}</li>
                <li>{t('disclaimer.s3Li2')}</li>
                <li>{t('disclaimer.s3Li3')}</li>
                <li>{t('disclaimer.s3Li4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s4Title')}</h2>
              <p className="text-slate-300 mb-4">{t('disclaimer.s4Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('disclaimer.s4Li1')}</li>
                <li>{t('disclaimer.s4Li2')}</li>
                <li>{t('disclaimer.s4Li3')}</li>
                <li>{t('disclaimer.s4Li4')}</li>
                <li>{t('disclaimer.s4Li5')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s5Title')}</h2>
              <p className="text-slate-300 mb-4">{t('disclaimer.s5Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('disclaimer.s5Li1')}</li>
                <li>{t('disclaimer.s5Li2')}</li>
                <li>{t('disclaimer.s5Li3')}</li>
                <li>{t('disclaimer.s5Li4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s6Title')}</h2>
              <p className="text-slate-300 mb-4">{t('disclaimer.s6Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('disclaimer.s6Li1')}</li>
                <li>{t('disclaimer.s6Li2')}</li>
                <li>{t('disclaimer.s6Li3')}</li>
                <li>{t('disclaimer.s6Li4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s7Title')}</h2>
              <p className="text-slate-300 mb-4">{t('disclaimer.s7Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('disclaimer.s7Li1')}</li>
                <li>{t('disclaimer.s7Li2')}</li>
                <li>{t('disclaimer.s7Li3')}</li>
                <li>{t('disclaimer.s7Li4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('disclaimer.s8Title')}</h2>
              <p className="text-slate-300 mb-4">
                {t('disclaimer.s8Body')}{' '}
                <Link to="/contact" className="text-primary hover:underline">{t('disclaimer.contactUs')}</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
