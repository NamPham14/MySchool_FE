/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { 
  useGetClassesQuery, 
  useGetSubjectsQuery,
  useGetAssignmentsByClassQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation
} from '../store/api/academicApi';
import { useUploadImageMutation } from '../store/api/baseApi';
import { BookOpen, Calendar, Clock, FileText, Link as LinkIcon, Plus, X, Edit2, Trash2, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const AssignmentsPage = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({ page: 0, size: 100 });
  const { data: subjectsData } = useGetSubjectsQuery({ page: 0, size: 100 });
  
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useGetAssignmentsByClassQuery(selectedClassId!, {
    skip: !selectedClassId,
  });

  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] = useDeleteAssignmentMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const assignments = assignmentsData?.data || [];

  // Set default class when classes are loaded
  React.useEffect(() => {
    if (classesData?.data?.content?.length && !selectedClassId) {
      setSelectedClassId(classesData.data.content[0].id);
    }
  }, [classesData, selectedClassId]);

  const handleOpenCreate = () => {
    setEditingId(null);
    if (subjectsData?.data?.content?.length) {
      setSubjectId(subjectsData.data.content[0].id);
    }
    setTitle('');
    setDescription('');
    setImageUrl('');
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
    
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    // Find subject ID by name
    const subject = subjectsData?.data?.content?.find(s => s.name === item.subjectName);
    setSubjectId(subject ? subject.id : 0);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setDueDate(item.dueDate || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh!');
      return;
    }

    // Check file size (limit 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadImage(formData).unwrap();
      setImageUrl(response.data);
      toast.success('Tải ảnh lên thành công!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi tải ảnh lên');
      // Xóa file đã chọn nếu lỗi
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAssignment(deleteId).unwrap();
      toast.success('Đã xóa bài tập thành công!');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi xóa bài tập');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    
    // In a real app we'd get this from a teacher selection, hardcoding to 1 for now
    const teacherId = 1; 

    const requestData = {
      classId: selectedClassId,
      subjectId,
      teacherId,
      title,
      description,
      imageUrl,
      dueDate
    };

    try {
      if (editingId) {
        await updateAssignment({ id: editingId, data: requestData }).unwrap();
        toast.success('Cập nhật bài tập thành công!');
      } else {
        await createAssignment(requestData).unwrap();
        toast.success('Giao bài tập thành công!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Check if assignment is overdue
  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    return due < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài tập</h1>
          <p className="text-sm text-gray-500 mt-1">Giao bài tập và theo dõi tiến độ của học sinh</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-700 pl-2">Chọn lớp:</span>
            {isLoadingClasses ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedClassId || ''}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block px-4 py-2 font-medium"
              >
                {classesData?.data?.content?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <button 
            onClick={handleOpenCreate}
            disabled={!selectedClassId}
            className="flex items-center px-4 py-2.5 bg-orange-600 text-white font-medium text-sm rounded-xl hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            Giao bài tập mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoadingAssignments && selectedClassId ? (
          <div className="py-20 text-center text-gray-500 animate-pulse flex flex-col items-center">
            <FileText className="h-10 w-10 text-orange-200 mb-4" />
            Đang tải danh sách bài tập...
          </div>
        ) : !selectedClassId ? (
          <div className="py-20 text-center text-gray-400">
            Vui lòng chọn một lớp để xem bài tập
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center">
            <FileText className="h-12 w-12 text-gray-200 mb-4" />
            Lớp này hiện chưa có bài tập nào
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const overdue = isOverdue(assignment.dueDate);
              
              return (
                <div 
                  key={assignment.id} 
                  onClick={() => setDetailItem(assignment)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative flex flex-col h-full cursor-pointer"
                >
                  {/* Subject Tag */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center">
                      <BookOpen className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                      {assignment.subjectName}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(assignment); }} 
                      className="p-1.5 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                      title="Sửa bài tập"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteId(assignment.id); }} 
                      className="p-1.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                      title="Xóa bài tập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Image Cover */}
                  <div className="h-40 bg-gray-100 relative overflow-hidden flex-shrink-0">
                    {assignment.imageUrl ? (
                      <img src={assignment.imageUrl} alt={assignment.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                        <FileText className="w-12 h-12 text-orange-200" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{assignment.title}</h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {assignment.description || 'Không có mô tả chi tiết.'}
                    </p>
                    
                    <div className="pt-4 border-t border-gray-100 space-y-2 mt-auto">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          Hạn nộp:
                        </span>
                        <span className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(assignment.dueDate)}
                        </span>
                      </div>
                      
                      {overdue && (
                        <div className="text-xs text-red-500 flex items-center justify-end">
                          <Clock className="w-3 h-3 mr-1" />
                          Đã quá hạn
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa Bài Tập */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Cập nhật bài tập' : 'Giao bài tập mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Môn học</label>
                <select 
                  value={subjectId} 
                  onChange={(e) => setSubjectId(Number(e.target.value))} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  required
                >
                  <option value="" disabled>-- Chọn môn học --</option>
                  {subjectsData?.data?.content?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Tiêu đề bài tập</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900" 
                  placeholder="VD: Làm bài tập 1, 2, 3 trang 45 SGK" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Mô tả chi tiết / Hướng dẫn làm bài</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 h-28 resize-none" 
                  placeholder="Ghi chú thêm về yêu cầu, cách làm..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Ngày đến hạn</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Ảnh đính kèm (Tuỳ chọn)</label>
                  <div className="mt-1 flex flex-col items-center">
                    {imageUrl ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => {
                              setImageUrl('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full h-32 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <Loader2 className="mx-auto h-8 w-8 text-orange-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="flex text-sm text-gray-600 mt-2">
                              <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                Tải ảnh lên
                              </span>
                              <p className="pl-1">hoặc kéo thả</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF lên tới 5MB</p>
                          </>
                        )}
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl font-medium transition-colors">Hủy</button>
                <button type="submit" disabled={isCreating || isUpdating} className="px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50">
                  {isCreating || isUpdating ? 'Đang lưu...' : (editingId ? 'Cập nhật bài tập' : 'Giao bài tập')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa Bài Tập */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Xóa bài tập"
        message="Bạn có chắc chắn muốn xóa bài tập này không? Học sinh sẽ không còn nhìn thấy bài tập này nữa."
        confirmLabel="Xóa bài tập"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Modal Xem Chi Tiết Bài Tập */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-orange-500" />
                Chi tiết bài tập
              </h3>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-6">
              {detailItem.imageUrl && (
                <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6 border border-gray-200">
                  <img src={detailItem.imageUrl} alt={detailItem.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 mb-3">
                  {detailItem.subjectName}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{detailItem.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                    Đến hạn: <strong className={`ml-1 ${isOverdue(detailItem.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>{formatDate(detailItem.dueDate)}</strong>
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    Ngày giao: <span className="ml-1 text-gray-900">{detailItem.createdAt ? new Date(detailItem.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}</span>
                  </span>
                </div>
              </div>
              
              <hr className="my-6 border-gray-100" />
              
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-3">Hướng dẫn làm bài:</h4>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {detailItem.description || <span className="italic text-gray-400">Không có hướng dẫn chi tiết</span>}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button 
                onClick={() => setDetailItem(null)} 
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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

export default AssignmentsPage;
