
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Scale className="h-6 w-6" />
          <span className="text-xl font-serif font-bold">LARA</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <NavLink 
            to="/" 
            className={({isActive}) => cn(
              "hover:text-accent transition-colors",
              isActive ? "text-accent font-medium" : ""
            )}
            end
          >
            Home
          </NavLink>
          <NavLink 
            to="/assistant" 
            className={({isActive}) => cn(
              "hover:text-accent transition-colors",
              isActive ? "text-accent font-medium" : ""
            )}
          >
            Chat with LARA
          </NavLink>
          <NavLink 
            to="/upload" 
            className={({isActive}) => cn(
              "hover:text-accent transition-colors",
              isActive ? "text-accent font-medium" : ""
            )}
          >
            Upload Document
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden mt-4 animate-fade-in">
          <div className="flex flex-col space-y-4 px-4 pb-4 pt-2">
            <NavLink 
              to="/" 
              onClick={() => setIsOpen(false)}
              className={({isActive}) => cn(
                "px-3 py-2 rounded-md hover:bg-primary/80 transition-colors",
                isActive ? "bg-primary/60 font-medium" : ""
              )}
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/assistant" 
              onClick={() => setIsOpen(false)}
              className={({isActive}) => cn(
                "px-3 py-2 rounded-md hover:bg-primary/80 transition-colors",
                isActive ? "bg-primary/60 font-medium" : ""
              )}
            >
              Chat with LARA
            </NavLink>
            <NavLink 
              to="/upload" 
              onClick={() => setIsOpen(false)}
              className={({isActive}) => cn(
                "px-3 py-2 rounded-md hover:bg-primary/80 transition-colors",
                isActive ? "bg-primary/60 font-medium" : ""
              )}
            >
              Upload Document
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
