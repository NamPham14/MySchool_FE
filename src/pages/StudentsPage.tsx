import React, { useState } from 'react';
import { 
  useGetClassesQuery, 
  useGetStudentsByClassQuery,
  useAssignStudentToClassMutation
} from '../store/api/academicApi';
import { Users, Phone, Hash, Shield, Search, UserPlus, Eye, Mail, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  // null = Tất cả học sinh
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | null>(null);
  
  // State for Assign Class Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState<number | null>(null);
  const [targetClassId, setTargetClassId] = useState<number | null>(null);

  // State for View Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({ page: 0, size: 100 });
  const { data: studentsData, isLoading: isLoadingStudents, refetch } = useGetStudentsByClassQuery(selectedClassFilter);

  const [assignStudent, { isLoading: isAssigning }] = useAssignStudentToClassMutation();

  const students = studentsData?.data || [];
  const classes = classesData?.data?.content || [];

  const handleOpenAssignModal = (studentId: number) => {
    setAssigningStudentId(studentId);
    setTargetClassId(classes.length > 0 ? classes[0].id : null);
    setIsAssignModalOpen(true);
  };

  const handleOpenDetailsModal = (student: any) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudentId || !targetClassId) return;

    try {
      await assignStudent({
        studentId: assigningStudentId,
        classId: targetClassId
      }).unwrap();
      
      toast.success('Gán học sinh vào lớp thành công!');
      setIsAssignModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi gán lớp');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 text-orange-500 mr-2" />
            Danh sách Học sinh
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và gán lớp cho học sinh trong hệ thống</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Lọc theo Lớp */}
          <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-600 pl-2 mr-2">Bộ lọc:</span>
            {isLoadingClasses ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedClassFilter === null ? 'ALL' : selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value === 'ALL' ? null : Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 cursor-pointer font-medium px-4 py-2"
              >
                <option value="ALL">Tất cả học sinh</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>Lớp {c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center text-sm font-medium text-gray-700">
            Tổng số: <span className="ml-1.5 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">{students.length} học sinh</span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none w-64"
            />
          </div>
        </div>

        {isLoadingStudents ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải danh sách học sinh...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center text-gray-400">
            <Users className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-lg font-medium text-gray-600">Không tìm thấy học sinh nào</p>
            <p className="text-sm mt-1">Học sinh tự đăng ký sẽ hiển thị ở đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">STT</th>
                  <th className="px-6 py-4">Học sinh</th>
                  <th className="px-6 py-4">Mã HS (Roll Number)</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student: any, index: number) => (
                  <tr key={student.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold mr-3 border border-orange-200">
                            {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="font-bold text-gray-900">{student.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600 font-medium">
                        <Hash className="w-4 h-4 mr-1.5 text-gray-400" />
                        {student.rollNumber || <span className="text-gray-300 italic">Chưa cập nhật</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-1.5 text-gray-400" />
                        {student.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenDetailsModal(student)}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenAssignModal(student.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors"
                        >
                          <UserPlus className="w-4 h-4 mr-1.5" />
                          Gán vào lớp
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
      {isDetailsModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative h-32 bg-gradient-to-r from-orange-400 to-orange-600">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-4 flex justify-center">
                {selectedStudent.avatarUrl ? (
                  <img src={selectedStudent.avatarUrl} alt={selectedStudent.fullName} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-white shadow-md flex items-center justify-center text-orange-700 font-bold text-5xl">
                    {selectedStudent.fullName ? selectedStudent.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.fullName}</h3>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Học sinh
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
                    <Hash className="w-3 h-3 mr-1" /> Mã học sinh
                  </div>
                  <div className="font-semibold text-gray-900">{selectedStudent.rollNumber || 'Chưa cập nhật'}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <Phone className="w-3 h-3 mr-1" /> Số điện thoại
                  </div>
                  <div className="font-semibold text-gray-900">{selectedStudent.phoneNumber}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <Mail className="w-3 h-3 mr-1" /> Email
                  </div>
                  <div className="font-semibold text-gray-900 truncate" title={selectedStudent.email}>{selectedStudent.email || 'Chưa cập nhật'}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                    <MapPin className="w-3 h-3 mr-1" /> Cơ sở (Campus)
                  </div>
                  <div className="font-semibold text-gray-900">{selectedStudent.campus || 'Chưa cập nhật'}</div>
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

      {/* Modal Assign Class */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Gán học sinh vào lớp</h3>
              <p className="text-sm text-gray-500 mt-1">Chọn lớp học mà bạn muốn học sinh này tham gia</p>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Chọn lớp học</label>
                <select
                  value={targetClassId || ''}
                  onChange={(e) => setTargetClassId(Number(e.target.value))}
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                >
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isAssigning}
                  className="px-6 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isAssigning ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
