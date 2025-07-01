import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Stack Inventory. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}