import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8">
            {t('terms.title')} <span className="text-primary">{t('terms.titleHighlight')}</span>
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg mb-8">
              {t('terms.lastUpdated')}
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s1Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s1Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s2Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s2Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s3Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s3Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('terms.s3Li1')}</li>
                <li>{t('terms.s3Li2')}</li>
                <li>{t('terms.s3Li3')}</li>
                <li>{t('terms.s3Li4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s4Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s4Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s5Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s5Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s6Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s6Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s7Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s7Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s8Title')}</h2>
              <p className="text-slate-300 mb-4">{t('terms.s8Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('terms.s9Title')}</h2>
              <p className="text-slate-300 mb-4">
                {t('terms.s9Body')}{' '}
                <Link to="/contact" className="text-primary hover:underline">{t('terms.contactPage')}</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
