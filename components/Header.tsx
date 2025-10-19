
import React from 'react';
import { CupcakeIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-surface shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center space-x-3">
        <CupcakeIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Bake Sale Calculator
        </h1>
      </div>
    </header>
  );
};

export default Header;
