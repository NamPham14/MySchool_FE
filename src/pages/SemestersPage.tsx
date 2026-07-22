import React, { useState } from 'react';
import { 
  useGetSemestersQuery,
  useCreateSemesterMutation,
  useUpdateSemesterMutation,
  useDeleteSemesterMutation
} from '../store/api/academicApi';
import { Layers, Plus, Edit2, Trash2, Calendar, XCircle, Search, ToggleLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const SemestersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  const { data, isLoading } = useGetSemestersQuery({ search: searchTerm, page, size: 10 });
  const [createSemester, { isLoading: isCreating }] = useCreateSemesterMutation();
  const [updateSemester, { isLoading: isUpdating }] = useUpdateSemesterMutation();
  const [deleteSemester] = useDeleteSemesterMutation();

  const semesters = data?.data?.content || [];

  const handleOpenModal = (semester?: any) => {
    if (semester) {
      setEditingId(semester.id);
      setFormData({
        name: semester.name,
        startDate: semester.startDate || '',
        endDate: semester.endDate || '',
        isCurrent: semester.isCurrent || false
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', startDate: '', endDate: '', isCurrent: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSemester({ id: editingId, data: formData }).unwrap();
        toast.success("Cập nhật Học kỳ thành công!");
      } else {
        await createSemester(formData).unwrap();
        toast.success("Thêm Học kỳ thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa Học kỳ này?")) {
      try {
        await deleteSemester(id).unwrap();
        toast.success("Xóa Học kỳ thành công!");
      } catch (err: any) {
        toast.error(err?.data?.message || "Có lỗi khi xóa (Có thể Học kỳ đang có dữ liệu)");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Layers className="w-8 h-8 text-orange-500 mr-2" />
            Quản lý Học kỳ
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và cấu hình các học kỳ trong hệ thống</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm học kỳ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-orange-500 focus:border-orange-500 outline-none w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải danh sách học kỳ...</p>
          </div>
        ) : semesters.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Layers className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-lg font-medium text-gray-600">Chưa có Học kỳ nào</p>
            <p className="text-sm mt-1">Bấm "Thêm mới" để tạo Học kỳ đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">STT</th>
                  <th className="px-6 py-4">Tên Học Kỳ</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {semesters.map((sem: any, index: number) => (
                  <tr key={sem.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-base">{sem.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                        {sem.startDate && sem.endDate 
                          ? `${new Date(sem.startDate).toLocaleDateString('vi-VN')} - ${new Date(sem.endDate).toLocaleDateString('vi-VN')}`
                          : 'Chưa thiết lập'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sem.isCurrent ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Đang diễn ra
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Đã qua/Sắp tới
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(sem)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Sửa Học kỳ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sem.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa Học kỳ"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                {editingId ? <Edit2 className="w-5 h-5 mr-2 text-orange-500" /> : <Plus className="w-5 h-5 mr-2 text-orange-500" />}
                {editingId ? 'Cập nhật Học kỳ' : 'Thêm Học kỳ mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Tên Học Kỳ *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Học kỳ 1 năm 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-orange-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})}
                  className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900">Đặt làm Học kỳ Hiện tại</span>
              </label>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center"
                >
                  {(isCreating || isUpdating) ? "Đang lưu..." : "Lưu Học kỳ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemestersPage;
