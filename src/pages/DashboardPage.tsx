import { useGetDashboardOverviewQuery } from '../store/api/dashboardApi';
import { Users, GraduationCap, School, BookOpen, Bell, DollarSign, ArrowUpRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const DashboardPage = () => {
  const { data: dashboardData, isLoading, error } = useGetDashboardOverviewQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !dashboardData?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
        <Activity className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-xl font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</p>
        <p>Không thể kết nối đến máy chủ hoặc chưa có dữ liệu.</p>
      </div>
    );
  }

  const { 
    totalStudents, 
    totalTeachers, 
    totalClasses, 
    pendingLeaveRequests, 
    totalRevenue,
    studentChartData,
    revenueChartData 
  } = dashboardData.data;

  const statCards = [
    {
      title: 'Học sinh',
      value: totalStudents,
      icon: <Users className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      trend: '+12%',
      trendUp: true,
      path: '/students'
    },
    {
      title: 'Giáo viên',
      value: totalTeachers,
      icon: <GraduationCap className="w-6 h-6 text-green-500" />,
      bg: 'bg-green-50',
      border: 'border-green-100',
      trend: '+2%',
      trendUp: true,
      path: '/teachers' // Or another page
    },
    {
      title: 'Lớp học',
      value: totalClasses,
      icon: <School className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      trend: 'Ổn định',
      trendUp: true,
      path: '/classes'
    },
    {
      title: 'Đơn xin nghỉ chờ duyệt',
      value: pendingLeaveRequests,
      icon: <Bell className="w-6 h-6 text-orange-500" />,
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      trend: '-5%',
      trendUp: true,
      path: '/leaves'
    },
  ];

  // Removed mock data, using real data from backend


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-500 mt-1">Tổng quan các hoạt động của trường MyFSchool</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => stat.path && navigate(stat.path)}
            className={`p-6 rounded-2xl border ${stat.border} bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
            
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Section */}
      <div 
        onClick={() => navigate('/fees')}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Tổng Doanh Thu Học Phí</h2>
            </div>
            <p className="text-gray-500 text-sm">Tổng thu từ tất cả các hóa đơn đã được thanh toán hoàn tất (PAID).</p>
          </div>
          <div className="text-right">
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 tracking-tight">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Biểu đồ sĩ số học sinh theo khối
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentChartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} name="Học sinh" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-500" />
            Xu hướng doanh thu (Triệu VNĐ)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000000}M`} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316'}} activeDot={{r: 6}} name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
