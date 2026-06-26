/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  useGetClassesQuery, 
  useGetAllLeavesQuery,
  useReviewLeaveMutation
} from '../store/api/academicApi';
import { FileText, CheckCircle, XCircle, Clock, Calendar, MessageSquare, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const LeavesPage = () => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, PENDING, APPROVED, REJECTED

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({ page: 0, size: 100 });
  const { data: leavesData, isLoading: isLoadingLeaves, refetch } = useGetAllLeavesQuery(selectedClassFilter);
  const [reviewLeave, { isLoading: isReviewing }] = useReviewLeaveMutation();

  const leaves = leavesData?.data || [];
  const classes = classesData?.data?.content || [];

  // Lọc theo trạng thái
  const filteredLeaves = leaves.filter((leave: any) => {
    if (statusFilter === 'ALL') return true;
    return leave.status === statusFilter;
  });

  const handleReview = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await reviewLeave({ id, status }).unwrap();
      toast.success(`Đã ${status === 'APPROVED' ? 'Duyệt' : 'Từ chối'} đơn thành công!`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi duyệt đơn');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1" /> Từ chối</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Không rõ</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 text-orange-500 mr-2" />
            Quản lý Đơn từ
          </h1>
          <p className="text-sm text-gray-500 mt-1">Xem xét và phê duyệt đơn xin nghỉ phép của học sinh</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Lọc theo Trạng thái */}
          <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <Filter className="w-4 h-4 text-gray-400 ml-2 mr-1" />
            <span className="text-sm font-medium text-gray-600 mr-2">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 cursor-pointer font-medium px-3 py-1.5 outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          {/* Lọc theo Lớp */}
          <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-600 pl-2 mr-2">Lớp:</span>
            {isLoadingClasses ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedClassFilter === null ? 'ALL' : selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value === 'ALL' ? null : Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 cursor-pointer font-medium px-4 py-1.5 outline-none"
              >
                <option value="ALL">Tất cả lớp</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center text-sm font-medium text-gray-700">
            Tổng số: <span className="ml-1.5 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">{filteredLeaves.length} đơn</span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm học sinh..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 outline-none w-64"
            />
          </div>
        </div>

        {isLoadingLeaves ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải danh sách đơn từ...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center text-gray-400">
            <FileText className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-lg font-medium text-gray-600">Không có đơn từ nào</p>
            <p className="text-sm mt-1">Hệ thống chưa ghi nhận đơn xin phép nào theo bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">STT</th>
                  <th className="px-6 py-4">Học sinh</th>
                  <th className="px-6 py-4">Lý do nghỉ</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center w-40">Phê duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeaves.map((leave: any, index: number) => (
                  <tr key={leave.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{leave.studentName}</div>
                      <div className="text-xs text-gray-500 mt-1">Đã nộp: {new Date(leave.createdAt).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-medium text-gray-800 mb-1">{leave.title}</div>
                      <div className="text-gray-500 text-xs flex items-start truncate" title={leave.reason}>
                        <MessageSquare className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{leave.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-max">
                        <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                        {new Date(leave.startDate).toLocaleDateString('vi-VN')} 
                        <span className="mx-2 text-gray-400">→</span> 
                        {new Date(leave.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === 'PENDING' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleReview(leave.id, 'APPROVED')}
                            disabled={isReviewing}
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                            title="Duyệt đơn"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReview(leave.id, 'REJECTED')}
                            disabled={isReviewing}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                            title="Từ chối"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-400 italic">Đã xử lý</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeavesPage;
