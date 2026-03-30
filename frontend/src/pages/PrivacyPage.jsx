import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8">
            {t('privacy.title')} <span className="text-primary">{t('privacy.titleHighlight')}</span>
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg mb-8">
              {t('privacy.lastUpdated')}
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s1Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s1Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('privacy.s1Li1')}</li>
                <li>{t('privacy.s1Li2')}</li>
                <li>{t('privacy.s1Li3')}</li>
                <li>{t('privacy.s1Li4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s2Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s2Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('privacy.s2Li1')}</li>
                <li>{t('privacy.s2Li2')}</li>
                <li>{t('privacy.s2Li3')}</li>
                <li>{t('privacy.s2Li4')}</li>
                <li>{t('privacy.s2Li5')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s3Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s3Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('privacy.s3Li1')}</li>
                <li>{t('privacy.s3Li2')}</li>
                <li>{t('privacy.s3Li3')}</li>
                <li>{t('privacy.s3Li4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s4Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s4Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('privacy.s4Li1')}</li>
                <li>{t('privacy.s4Li2')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s5Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s5Body')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>{t('privacy.s5Li1')}</li>
                <li>{t('privacy.s5Li2')}</li>
                <li>{t('privacy.s5Li3')}</li>
                <li>{t('privacy.s5Li4')}</li>
                <li>{t('privacy.s5Li5')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s6Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s6Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s7Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s7Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s8Title')}</h2>
              <p className="text-slate-300 mb-4">{t('privacy.s8Body')}</p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-4">{t('privacy.s9Title')}</h2>
              <p className="text-slate-300 mb-4">
                {t('privacy.s9Body')}{' '}
                <Link to="/contact" className="text-primary hover:underline">{t('privacy.contactPage')}</Link>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
