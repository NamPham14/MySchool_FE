/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  useGetClassesQuery, 
  useGetSchedulesByClassQuery, 
  useGetSubjectsQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetTeachersQuery,
  useImportTimetableMutation
} from '../store/api/academicApi';
import { Calendar, Clock, MapPin, User, BookOpen, Plus, X, Edit2, Trash2, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const DAYS = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
];

const PERIODS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const TimetablesPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const roles = user?.roles ? (Array.isArray(user.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.name) : []) : [];
  const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState<number>(0);
  const [teacherId, setTeacherId] = useState<number>(0);
  const [dayOfWeek, setDayOfWeek] = useState<number>(2);
  const [period, setPeriod] = useState<string>('1');
  const [startTime, setStartTime] = useState<string>('07:30');
  const [endTime, setEndTime] = useState<string>('08:15');
  const [room, setRoom] = useState<string>('');
  const [isExam, setIsExam] = useState<boolean>(false);

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({ page: 0, size: 100 });
  const { data: subjectsData } = useGetSubjectsQuery({ page: 0, size: 100 });
  const { data: teachersData } = useGetTeachersQuery();
  
  const { data: scheduleData, isLoading: isLoadingSchedule } = useGetSchedulesByClassQuery(selectedClassId!, {
    skip: !selectedClassId,
  });

  const [createSchedule, { isLoading: isCreating }] = useCreateScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteScheduleMutation();
  const [importTimetable, { isLoading: isImporting }] = useImportTimetableMutation();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const schedules = scheduleData?.data || [];

  // Set default class when classes are loaded
  React.useEffect(() => {
    if (classesData?.data?.content?.length && !selectedClassId) {
      setTimeout(() => setSelectedClassId(classesData.data.content[0].id), 0);
    }
  }, [classesData, selectedClassId]);

  const handleOpenCreate = () => {
    setEditingId(null);
    if (subjectsData?.data?.content?.length) {
      setSubjectId(subjectsData.data.content[0].id);
    }
    if (teachersData?.data?.length) {
      setTeacherId(teachersData.data[0].id);
    } else {
      setTeacherId(0);
    }
    setDayOfWeek(2);
    setPeriod('1');
    setStartTime('07:30');
    setEndTime('08:15');
    setRoom('');
    setIsExam(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    // Find subject ID by name
    const subject = subjectsData?.data?.content?.find((s: any) => s.name === item.subjectName);
    setSubjectId(subject ? subject.id : 0);
    // Find teacher ID by name
    const teacher = teachersData?.data?.find((t: any) => t.fullName === item.teacherName);
    setTeacherId(teacher ? teacher.id : 0);
    
    setDayOfWeek(item.dayOfWeek);
    setPeriod(item.period || '1');
    setStartTime(item.startTime?.slice(0, 5) || '07:30');
    setEndTime(item.endTime?.slice(0, 5) || '08:15');
    setRoom(item.room || '');
    setIsExam(item.isExam || false);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSchedule(deleteId).unwrap();
      toast.success('Đã xóa tiết học thành công!');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi xóa tiết học');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    if (!teacherId || teacherId === 0) {
      toast.error('Vui lòng chọn giáo viên phụ trách!');
      return;
    }

    const requestData = {
      classId: selectedClassId,
      subjectId,
      teacherId,
      dayOfWeek,
      period,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      room,
      note: '',
      isExam
    };

    try {
      if (editingId) {
        await updateSchedule({ id: editingId, data: requestData }).unwrap();
        toast.success('Cập nhật tiết học thành công!');
      } else {
        await createSchedule(requestData).unwrap();
        toast.success('Thêm tiết học thành công!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  const getSchedulesForDay = (dayValue: number) => {
    return schedules.filter(s => s.dayOfWeek === dayValue).sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const handleExportTemplate = () => {
    window.location.href = 'http://localhost:8080/api/schedules/export/template';
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const overwrite = window.confirm('Lưu ý: Bạn có muốn XÓA SẠCH lịch cũ của các lớp có trong file để GHI ĐÈ bằng lịch mới không? (Bấm OK để Xóa lịch cũ, Bấm Cancel để Gộp chung)');
    
    const loadingToast = toast.loading('Đang xử lý file Excel...');
    try {
      const res = await importTimetable({ file, overwrite }).unwrap();
      toast.success(res.message || 'Nhập thời khóa biểu thành công!', { id: loadingToast });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi đọc file Excel', { id: loadingToast });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thời khóa biểu</h1>
          <p className="text-sm text-gray-500 mt-1">Xem và quản lý lịch học theo từng lớp</p>
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

          {isAdmin && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleExportTemplate}
                className="flex items-center px-4 py-2.5 bg-green-600 text-white font-medium text-sm rounded-xl hover:bg-green-700 transition-colors shadow-sm"
              >
                <Download className="h-5 w-5 mr-2" />
                Tải Template
              </button>
              
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                ref={fileInputRef} 
                onChange={handleImport} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Upload className="h-5 w-5 mr-2" />
                {isImporting ? 'Đang Import...' : 'Import Excel'}
              </button>

              <button 
                onClick={handleOpenCreate}
                disabled={!selectedClassId}
                className="flex items-center px-4 py-2.5 bg-orange-600 text-white font-medium text-sm rounded-xl hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Plus className="h-5 w-5 mr-2" />
                Xếp lịch mới
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {isLoadingSchedule && selectedClassId ? (
          <div className="py-20 text-center text-gray-500 animate-pulse flex flex-col items-center">
            <Calendar className="h-10 w-10 text-orange-200 mb-4" />
            Đang tải thời khóa biểu...
          </div>
        ) : !selectedClassId ? (
          <div className="py-20 text-center text-gray-400">
            Vui lòng chọn một lớp để xem thời khóa biểu
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center">
            <Calendar className="h-12 w-12 text-gray-200 mb-4" />
            Lớp này chưa có thời khóa biểu
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {DAYS.map(day => {
              const daySchedules = getSchedulesForDay(day.value);
              
              return (
                <div key={day.value} className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center justify-between">
                    <h3 className="font-bold text-orange-800">{day.label}</h3>
                    <span className="text-xs font-semibold bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                      {daySchedules.length} tiết
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {daySchedules.length === 0 ? (
                      <div className="text-center text-sm text-gray-400 py-4 italic">Trống</div>
                    ) : (
                      daySchedules.map((schedule) => (
                        <div key={schedule.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors group relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                                Tiết {schedule.period || '-'}
                              </span>
                              {schedule.isExam && (
                                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded">
                                  THI
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-xs font-medium text-gray-500 group-hover:opacity-0 transition-opacity">
                              <Clock className="w-3 h-3 mr-1" />
                              {schedule.startTime?.slice(0, 5)} - {schedule.endTime?.slice(0, 5)}
                            </div>
                            
                            {isAdmin && (
                              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenEdit(schedule)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeleteId(schedule.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center">
                            <BookOpen className="w-4 h-4 mr-1.5 text-orange-500" />
                            {schedule.subjectName}
                          </h4>
                          
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-3.5 h-3.5 mr-2 text-gray-400" />
                              <span className="truncate">{schedule.teacherName || 'Chưa xếp GV'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />
                              <span>{schedule.room || 'Chưa xếp phòng'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Modal Thêm/Sửa Lịch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Cập nhật lịch học' : 'Xếp lịch học mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">Thứ</label>
                  <select 
                    value={dayOfWeek} 
                    onChange={(e) => setDayOfWeek(Number(e.target.value))} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  >
                    {DAYS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Giáo viên phụ trách</label>
                  <select 
                    value={teacherId} 
                    onChange={(e) => setTeacherId(Number(e.target.value))} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    required
                  >
                    <option value="" disabled>-- Chọn giáo viên --</option>
                    {teachersData?.data?.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Tiết học</label>
                  <select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  >
                    {PERIODS.map(p => (
                      <option key={p} value={p}>Tiết {p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Phòng học</label>
                  <input 
                    type="text" 
                    value={room} 
                    onChange={(e) => setRoom(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900" 
                    placeholder="VD: Phòng 101" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Giờ bắt đầu</label>
                  <input 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Giờ kết thúc</label>
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900" 
                    required 
                  />
                </div>
              </div>
              
              <div className="mt-6 flex items-center">
                <input 
                  type="checkbox" 
                  id="isExam" 
                  checked={isExam} 
                  onChange={(e) => setIsExam(e.target.checked)} 
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isExam" className="ml-2 text-sm font-medium text-gray-900">
                  Đánh dấu đây là giờ thi / kiểm tra
                </label>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl font-medium transition-colors">Hủy</button>
                <button type="submit" disabled={isCreating || isUpdating} className="px-4 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50">
                  {isCreating || isUpdating ? 'Đang lưu...' : (editingId ? 'Cập nhật lịch' : 'Lưu lịch học')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa Lịch */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Xóa tiết học"
        message="Bạn có chắc chắn muốn xóa tiết học này khỏi thời khóa biểu không?"
        confirmLabel="Xóa tiết học"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default TimetablesPage;
