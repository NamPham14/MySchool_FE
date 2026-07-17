import { Menu, Bell, Search, LogOut, ChevronDown, Award, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetMyInfoQuery } from '../../store/api/baseApi';
import { useGetUnreadCountQuery, useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../../store/api/notificationApi';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { handleLogout } = useAuth();
  const { data: userInfoResponse } = useGetMyInfoQuery();
  const user = userInfoResponse?.data;
  const navigate = useNavigate();
  
  const { data: unreadCountResponse } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const unreadCount = unreadCountResponse?.data || 0;
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { data: notificationsResponse } = useGetNotificationsQuery(undefined, { skip: !isNotifOpen });
  const notifications = notificationsResponse?.data || [];
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-white text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs text-gray-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Đánh dấu đã đọc
                </button>
              </div>
              
              <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Bell className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Bạn chưa có thông báo nào.</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    let NotifIcon = Bell;
                    let iconBg = 'bg-blue-100 text-blue-600';
                    if (notif.type === 'GRADE') { NotifIcon = Award; iconBg = 'bg-green-100 text-green-600'; }
                    else if (notif.type === 'LEAVE') { NotifIcon = Calendar; iconBg = 'bg-purple-100 text-purple-600'; }
                    else if (notif.type === 'ASSIGNMENT') { NotifIcon = FileText; iconBg = 'bg-orange-100 text-orange-600'; }

                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif.id);
                          setIsNotifOpen(false);
                          if (notif.type === 'GRADE') navigate('/grades');
                          else if (notif.type === 'LEAVE') navigate('/leaves');
                          else if (notif.type === 'ASSIGNMENT') navigate('/assignments');
                        }}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 relative ${!notif.isRead ? 'bg-orange-50/20' : ''}`}
                      >
                        {!notif.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                        )}
                        
                        <div className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.isRead ? 'bg-gray-100 text-gray-400' : iconBg}`}>
                          <NotifIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm mb-0.5 ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                            {notif.title}
                          </h4>
                          <p className={`text-xs line-clamp-2 ${!notif.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                            {notif.message || notif.content}
                          </p>
                          {notif.createdAt && (
                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString('vi-VN')} {new Date(notif.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                <button 
                  onClick={() => { setIsNotifOpen(false); navigate('/notifications'); }}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

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
