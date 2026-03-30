import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-[150px] font-bold text-gray-800 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🔍</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          {t('notFound.title')}
        </h1>

        <p className="text-gray-400 mb-8">
          {t('notFound.message')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              {t('notFound.goHome')}
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('notFound.goBack')}
          </Button>
        </div>

        {/* Fun crypto fact */}
        <div className="mt-12 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-sm text-gray-500">
            💡 <span className="text-gray-400">{t('notFound.funFact')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
