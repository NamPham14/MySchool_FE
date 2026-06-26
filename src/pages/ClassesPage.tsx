/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useGetClassesQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation } from '../store/api/academicApi';
import { Plus, Search, Edit2, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';


const ClassesPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(10);
  const [academicYear, setAcademicYear] = useState('2024-2025');

  const { data, isLoading, error } = useGetClassesQuery({ page, size: 10 });
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setGrade(10);
    setAcademicYear('2024-2025');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setGrade(item.grade);
    setAcademicYear(item.academicYear);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClass({ id: editingId, data: { name, grade, academicYear } }).unwrap();
        toast.success('Cập nhật lớp học thành công!');
      } else {
        await createClass({ name, grade, academicYear }).unwrap();
        toast.success('Thêm lớp học thành công!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Lớp học</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh sách, sĩ số và thông tin các lớp học</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center px-4 py-2.5 bg-orange-600 text-white font-medium text-sm rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm lớp mới
        </button>
      </div>

      {/* Filter / Search Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            placeholder="Tìm kiếm tên lớp, niên khóa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="hidden sm:flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">Tổng số:</span> 
          <span className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-bold">
            {data?.data?.totalElements || 0} lớp
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải dữ liệu lớp học...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Đã xảy ra lỗi khi tải dữ liệu!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-900">
              <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tên lớp</th>
                  <th className="px-6 py-4">Khối</th>
                  <th className="px-6 py-4">Niên khóa</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data?.content?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Chưa có dữ liệu lớp học.
                    </td>
                  </tr>
                ) : (
                  data?.data?.content?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">#{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Khối {item.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.academicYear}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip" title="Sửa">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data?.data?.totalPages && data.data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Trang {page + 1} / {data.data.totalPages}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Trước
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.data.totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa Lớp */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Cập nhật thông tin lớp' : 'Thêm lớp học mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Tên lớp</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900" placeholder="VD: 10A1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Khối</label>
                <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900">
                  <option value={10}>Khối 10</option>
                  <option value={11}>Khối 11</option>
                  <option value={12}>Khối 12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Niên khóa</label>
                <input required type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900" placeholder="VD: 2024-2027" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl font-medium transition-colors">Hủy</button>
                <button type="submit" disabled={isCreating || isUpdating} className="px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50">
                  {isCreating || isUpdating ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Lưu lớp học')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
