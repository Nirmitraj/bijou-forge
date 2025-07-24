import { Menu, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';

export default function Header({ user, onLogin, toggleMobileMenu, darkMode, toggleDarkMode }) {
  return (
    <header className={`${darkMode ? 'bg-gray-800' : 'bg-jewel-gold'} text-white p-4 shadow-md`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            className="lg:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Generative Jewelry Design</h1>
            <div className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs uppercase tracking-wide">3D</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-jewel-emerald flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="font-medium">{user.email}</span>
              </div>
              <button className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-jewel-emerald hover:bg-emerald-600'} flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors`}>
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-jewel-emerald hover:bg-emerald-600'} flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors`}
            >
              <LogIn size={16} />
              <span className="hidden md:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}