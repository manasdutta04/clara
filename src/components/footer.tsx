import React from "react";
import { Github, Heart } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 border-t border-gray-800/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-left">
          {/* Copyright */}
          <div className="mb-6 md:mb-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Clara. All rights reserved.
            </p>
          </div>
          
          {/* Made with love */}
          <div className="flex items-right">
            <p className="text-sm text-gray-400 flex items-center mr-4">
              Made with <Heart size={12} className="mx-1 text-red-500" /> in India
            </p>
            <a 
              href="https://github.com/manasdutta04/clara" 
              className="text-gray-400 hover:text-blue-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 