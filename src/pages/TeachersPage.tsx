/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { 
  useGetTeachersQuery 
} from '../store/api/academicApi';
import { GraduationCap, Phone, Hash, Eye, Mail, MapPin, CheckCircle2, Search } from 'lucide-react';

const TeachersPage = () => {
  // State for View Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const { data: teachersData, isLoading: isLoadingTeachers } = useGetTeachersQuery();

  const teachers = teachersData?.data || [];

  const handleOpenDetailsModal = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="w-8 h-8 text-green-500 mr-2" />
            Danh sách Giáo viên
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý hồ sơ giáo viên trong hệ thống</p>
        </div>
        

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center text-sm font-medium text-gray-700">
            Tổng số: <span className="ml-1.5 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full">{teachers.length} giáo viên</span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline-none w-64"
            />
          </div>
        </div>

        {isLoadingTeachers ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải danh sách giáo viên...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center text-gray-400">
            <GraduationCap className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-lg font-medium text-gray-600">Không tìm thấy giáo viên nào</p>
            <p className="text-sm mt-1">Chưa có giáo viên nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">STT</th>
                  <th className="px-6 py-4">Giáo viên</th>
                  <th className="px-6 py-4">Mã GV</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachers.map((teacher: any, index: number) => (
                  <tr key={teacher.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {teacher.avatarUrl ? (
                          <img src={teacher.avatarUrl} alt={teacher.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold mr-3 border border-green-200">
                            {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : 'T'}
                          </div>
                        )}
                        <div className="font-bold text-gray-900">{teacher.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600 font-medium">
                        <Hash className="w-4 h-4 mr-1.5 text-gray-400" />
                        {teacher.rollNumber || <span className="text-gray-300 italic">Chưa cập nhật</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-1.5 text-gray-400" />
                        {teacher.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenDetailsModal(teacher)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal View Details */}
      {isDetailsModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative h-32 bg-gradient-to-r from-green-400 to-green-600">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-4 flex justify-center">
                {selectedTeacher.avatarUrl ? (
                  <img src={selectedTeacher.avatarUrl} alt={selectedTeacher.fullName} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-200 border-4 border-white shadow-md flex items-center justify-center text-green-700 font-bold text-5xl">
                    {selectedTeacher.fullName ? selectedTeacher.fullName.charAt(0).toUpperCase() : 'T'}
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedTeacher.fullName}</h3>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Giáo viên
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Đang hoạt động
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <Hash className="w-3 h-3 mr-1" /> Mã GV
                  </div>
                  <div className="font-semibold text-gray-900">{selectedTeacher.rollNumber || 'Chưa cập nhật'}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <Phone className="w-3 h-3 mr-1" /> Số điện thoại
                  </div>
                  <div className="font-semibold text-gray-900">{selectedTeacher.phoneNumber}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <Mail className="w-3 h-3 mr-1" /> Email
                  </div>
                  <div className="font-semibold text-gray-900 truncate" title={selectedTeacher.email}>{selectedTeacher.email || 'Chưa cập nhật'}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <MapPin className="w-3 h-3 mr-1" /> Cơ sở (Campus)
                  </div>
                  <div className="font-semibold text-gray-900">{selectedTeacher.campus || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;
