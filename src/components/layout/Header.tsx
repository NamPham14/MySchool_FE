import { Menu, Bell, Search, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetMyInfoQuery } from '../../store/api/baseApi';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { handleLogout } = useAuth();
  const { data: userInfoResponse } = useGetMyInfoQuery();
  const user = userInfoResponse?.data;

  return (
    <header className="h-20 bg-white border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Left side */}
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 mr-4 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Global Search Bar (Optional but looks premium) */}
        <div className="hidden sm:flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all w-80">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm học sinh, lớp học..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        <button className="relative p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        {/* User Profile Menu (Simplified for now) */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <img 
            src={user?.avatarUrl || "https://ui-avatars.com/api/?name=" + (user?.fullName || "User") + "&background=ea580c&color=fff"} 
            alt="Avatar" 
            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-orange-100 transition-colors"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.fullName || 'Đang tải...'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.roles?.[0]?.name || 'Giáo viên'}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block group-hover:text-gray-600" />
        </div>

        <button 
          onClick={handleLogout}
          className="ml-2 p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors tooltip"
          title="Đăng xuất"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
