import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users,
  UserCheck, 
  BookOpen, 
  CalendarDays, 
  ClipboardList, 
  GraduationCap, 
  FileText, 
  Bell, 
  CreditCard,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { path: '/classes', icon: Users, label: 'Lớp học' },
  { path: '/students', icon: UserCheck, label: 'Học sinh' },
  { path: '/teachers', icon: GraduationCap, label: 'Giáo viên' },
  { path: '/subjects', icon: BookOpen, label: 'Môn học' },
  { path: '/timetables', icon: CalendarDays, label: 'Thời khóa biểu' },
  { path: '/assignments', icon: ClipboardList, label: 'Bài tập' },
  { path: '/grades', icon: GraduationCap, label: 'Điểm số' },
  { path: '/leaves', icon: FileText, label: 'Đơn từ' },
  { path: '/fees', icon: CreditCard, label: 'Học phí' },
  { path: '/chat', icon: MessageSquare, label: 'Tin nhắn' },
  { path: '/events', icon: Calendar, label: 'Sự kiện' },
  { path: '/notifications', icon: Bell, label: 'Thông báo' },
];

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-white border-r border-gray-100 w-64 shadow-sm z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <img src="/logo_fschool.png" alt="Logo" className="h-10 w-auto" />
          <span className="ml-3 text-lg font-bold text-gray-900 tracking-tight">MyFSchool</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm
                ${isActive 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={`h-5 w-5 mr-3 transition-colors duration-200
                    ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} 
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="bg-orange-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-orange-800">Cần trợ giúp?</h4>
            <p className="text-xs text-orange-600 mt-1">Liên hệ với ban quản trị hệ thống.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
