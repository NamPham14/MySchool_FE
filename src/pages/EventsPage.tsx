/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  useGetAllEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventCategoriesQuery,
  useUploadFileMutation
} from '../store/api/academicApi';
import { Calendar, Plus, Edit2, Trash2, X, MapPin, Clock, Eye, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const EventsPage = () => {
  const { data: eventsData, isLoading } = useGetAllEventsQuery();
  const { data: categoriesData } = useGetEventCategoriesQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const events = eventsData?.data || [];
  const categories = categoriesData?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [viewingEvent, setViewingEvent] = useState<any>(null);

  const [form, setForm] = useState({
    title: '',
    location: '',
    startDatetime: '',
    endDatetime: '',
    status: 'UPCOMING',
    imageUrl: '',
    description: '',
    categoryId: '' as string | number
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      location: '',
      startDatetime: '',
      endDatetime: '',
      status: 'UPCOMING',
      imageUrl: '',
      description: '',
      categoryId: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: any) => {
    setEditingId(event.id);
    setForm({
      title: event.title || '',
      location: event.location || '',
      startDatetime: event.startDatetime ? new Date(event.startDatetime).toISOString().slice(0, 16) : '',
      endDatetime: event.endDatetime ? new Date(event.endDatetime).toISOString().slice(0, 16) : '',
      status: event.status || 'UPCOMING',
      imageUrl: event.imageUrl || '',
      description: event.description || '',
      categoryId: event.categoryId || '' // assuming the API might return categoryId or we can handle it
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDatetime || !form.endDatetime || !form.location) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }

    try {
      const payload = {
        title: form.title,
        location: form.location,
        startDatetime: new Date(form.startDatetime).toISOString(),
        endDatetime: new Date(form.endDatetime).toISOString(),
        status: form.status,
        imageUrl: form.imageUrl,
        description: form.description,
        categoryId: form.categoryId ? Number(form.categoryId) : null
      };

      if (editingId) {
        await updateEvent({ id: editingId, data: payload }).unwrap();
        toast.success('Cập nhật sự kiện thành công');
      } else {
        await createEvent(payload).unwrap();
        toast.success('Tạo sự kiện thành công');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvent(deleteId).unwrap();
      toast.success('Xóa sự kiện thành công');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadFile(formData).unwrap();
      setForm(prev => ({ ...prev, imageUrl: res.data }));
      toast.success('Tải ảnh lên thành công!');
    } catch (err: any) {
      toast.error('Lỗi khi tải ảnh lên',err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Sắp diễn ra</span>;
      case 'ONGOING':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Đang diễn ra</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">Đã kết thúc</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-8 h-8 text-orange-500 mr-2" />
            Quản lý Sự kiện
          </h1>
          <p className="text-sm text-gray-500 mt-1">Lên lịch và theo dõi các sự kiện của trường</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center px-4 py-2 bg-orange-600 text-white font-medium text-sm rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1.5" /> Thêm sự kiện
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center animate-pulse">
            <Calendar className="h-10 w-10 text-orange-200 mb-4" />
            Đang tải sự kiện...
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center">
            <Calendar className="h-12 w-12 text-gray-200 mb-4" />
            Chưa có sự kiện nào
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
                {event.imageUrl && (
                  <div className="h-40 w-full overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    {getStatusBadge(event.status)}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-0.5 shadow-sm">
                      <button onClick={() => setViewingEvent(event)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenEdit(event)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(event.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2" title={event.title}>{event.title}</h3>
                  {event.categoryName && (
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md mb-2">
                      {event.categoryName}
                    </span>
                  )}
                  <div className="space-y-2 mt-2 text-sm text-gray-600">
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>Bắt đầu: {new Date(event.startDatetime).toLocaleString('vi-VN')}</div>
                        <div>Kết thúc: {new Date(event.endDatetime).toLocaleString('vi-VN')}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate" title={event.location}>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-orange-500"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Cập nhật sự kiện' : 'Thêm sự kiện mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Tên sự kiện *</label>
                <input 
                  required
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none" 
                  placeholder="VD: Lễ khai giảng" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Địa điểm *</label>
                <input 
                  required
                  type="text" 
                  value={form.location} 
                  onChange={(e) => setForm({...form, location: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none" 
                  placeholder="VD: Sân trường" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Thể loại</label>
                <select 
                  value={form.categoryId} 
                  onChange={(e) => setForm({...form, categoryId: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none"
                >
                  <option value="">-- Chọn thể loại --</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Ảnh mô tả (Có thể tải lên hoặc dán URL)</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={form.imageUrl} 
                    onChange={(e) => setForm({...form, imageUrl: e.target.value})} 
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none" 
                    placeholder="Nhập link ảnh hoặc tải lên..." 
                  />
                  <label className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200">
                    {isUploading ? <span className="animate-spin mr-1">↻</span> : <UploadCloud className="w-5 h-5 mr-1" />}
                    Tải lên
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
                  {form.imageUrl && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Mô tả sự kiện</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none h-24 resize-none" 
                  placeholder="Nhập nội dung/mô tả chi tiết sự kiện..." 
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Thời gian bắt đầu *</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={form.startDatetime} 
                    onChange={(e) => setForm({...form, startDatetime: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Thời gian kết thúc *</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={form.endDatetime} 
                    onChange={(e) => setForm({...form, endDatetime: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Trạng thái</label>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({...form, status: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 outline-none"
                >
                  <option value="UPCOMING">Sắp diễn ra</option>
                  <option value="ONGOING">Đang diễn ra</option>
                  <option value="COMPLETED">Đã kết thúc</option>
                </select>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl font-medium transition-colors">Hủy</button>
                <button type="submit" disabled={isCreating || isUpdating} className="px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50">
                  {isCreating || isUpdating ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Chi tiết Sự kiện</h3>
              <button onClick={() => setViewingEvent(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-0">
              {viewingEvent.imageUrl && (
                <div className="w-full h-48 bg-gray-100">
                  <img src={viewingEvent.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  {getStatusBadge(viewingEvent.status)}
                  {viewingEvent.categoryName && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                      {viewingEvent.categoryName}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{viewingEvent.title}</h2>
                
                <div className="space-y-4 bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-start">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thời gian diễn ra</p>
                      <p className="font-medium text-gray-900">
                        Từ: {new Date(viewingEvent.startDatetime).toLocaleString('vi-VN')}
                      </p>
                      <p className="font-medium text-gray-900">
                        Đến: {new Date(viewingEvent.endDatetime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm tổ chức</p>
                      <p className="font-medium text-gray-900">{viewingEvent.location}</p>
                    </div>
                  </div>
                  
                  {viewingEvent.description && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-2">Nội dung sự kiện</h4>
                      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                        {viewingEvent.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setViewingEvent(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Xóa sự kiện"
        message="Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa sự kiện"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default EventsPage;
