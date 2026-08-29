"use client";

import { useState } from "react";

export function AboutHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
        title="Help"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700 p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              FGO JP Banner Tracker
            </h2>

            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">How to Use</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Toggle Servants:</strong> Click any servant chip to
                    cycle through: None → Owned → Planning → None
                  </li>
                  <li>
                    <strong>Filter Banners:</strong> Use the filter buttons to
                    show banners with owned or planned servants
                  </li>
                  <li>
                    <strong>Search:</strong> Type servant names to find specific
                    banners
                  </li>
                  <li>
                    <strong>Sort:</strong> Sort by date, name, or servant count
                  </li>
                  <li>
                    <strong>Import/Export:</strong> Save your collection as JSON
                    or import from another device
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Keyboard</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Escape:</strong> Close modal or panel
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Data</h3>
                <p>
                  Banner data is sourced from GamePress FGO Wiki. Your collection
                  is stored locally in your browser and never sent to any server.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Keyboard</h3>
                <p>
                  Built with Next.js, TypeScript, and Tailwind CSS. Data from
                  GamePress FGO Wiki.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
