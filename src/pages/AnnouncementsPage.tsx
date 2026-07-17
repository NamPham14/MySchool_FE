import React, { useState } from 'react';
import { 
  Megaphone,
  Send,
  Loader2,
  Trash2,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { 
  useGetClassesQuery,
  useGetAnnouncementsByClassQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation
} from '../store/api/academicApi';
import toast from 'react-hot-toast';

const AnnouncementsPage = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({ page: 0, size: 100 });
  const { data: announcementsData, isLoading: isLoadingAnnouncements } = useGetAnnouncementsByClassQuery(selectedClassId ?? 0, {
    skip: !selectedClassId
  });

  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error('Vui lòng chọn lớp học');
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      await createAnnouncement({
        classId: selectedClassId,
        title,
        content
      }).unwrap();
      
      toast.success('Đăng thông báo thành công');
      setTitle('');
      setContent('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi đăng thông báo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedClassId) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await deleteAnnouncement({ id, classId: selectedClassId }).unwrap();
        toast.success('Đã xóa thông báo');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Lỗi khi xóa thông báo');
      }
    }
  };

  const classes = classesData?.data?.content || [];
  const announcements = announcementsData?.data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-orange-500" />
            Bảng tin Lớp học
          </h1>
          <p className="text-gray-500 mt-1">Đăng tải và quản lý thông báo gửi đến học sinh</p>
        </div>

        {/* Class Selector */}
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn lớp
          </label>
          <select
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
            disabled={isLoadingClasses}
          >
            <option value="">-- Chọn lớp học --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Khóa {cls.academicYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedClassId ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa chọn lớp học</h3>
          <p className="text-gray-500">Vui lòng chọn một lớp học ở góc trên để xem và đăng thông báo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Announcement Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Đăng thông báo mới</h2>
              <form onSubmit={handlePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Nghỉ học do bão, Lịch thi..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung thông báo
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung chi tiết..."
                    rows={6}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi thông báo
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl flex gap-3 text-orange-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                Thông báo sẽ được gửi ngay lập tức tới toàn bộ học sinh trong lớp dưới dạng Bảng tin.
              </p>
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Lịch sử Bảng tin</h2>
              
              {isLoadingAnnouncements ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Megaphone className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium">Chưa có thông báo nào</h3>
                  <p className="text-gray-500 mt-1">Hãy là người đầu tiên đăng thông báo cho lớp này.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden">
                            {ann.teacherAvatar ? (
                              <img src={ann.teacherAvatar} alt={ann.teacherName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{ann.teacherName}</h4>
                            <div className="flex items-center text-xs text-gray-500 gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(ann.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{ann.title}</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
