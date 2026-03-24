import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFoundPage = () => {
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
          Page Not Found
        </h1>
        
        <p className="text-gray-400 mb-8">
          Oops! The page you're looking for seems to have vanished into the blockchain. 
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Fun crypto fact */}
        <div className="mt-12 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
          <p className="text-sm text-gray-500">
            💡 <span className="text-gray-400">Did you know?</span> The first Bitcoin transaction was for 10,000 BTC 
            used to buy two pizzas in 2010!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
