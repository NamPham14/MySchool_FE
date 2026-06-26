import React, { useState } from 'react';
import { 
  useGetClassesQuery, 
  useGetAllInvoicesQuery,
  useGenerateInvoicesMutation,
  useGetSemestersQuery
} from '../store/api/academicApi';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Search, Filter, Calendar, Hash, User, DollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const FeesPage = () => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    classId: '',
    semesterId: 1,
    title: '',
    amount: '',
    dueDate: ''
  });

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({ page: 0, size: 100 });
  const { data: semestersData, isLoading: isLoadingSemesters } = useGetSemestersQuery({ page: 0, size: 100 });
  const [generateInvoices, { isLoading: isGenerating }] = useGenerateInvoicesMutation();
  
  const { data: invoicesData, isLoading: isLoadingInvoices } = useGetAllInvoicesQuery({
    semesterId: selectedSemester,
    classId: selectedClass
  });

  const classes = classesData?.data?.content || [];
  const invoices = invoicesData?.data || [];

  // Lọc theo trạng thái
  const filteredInvoices = invoices.filter((invoice: any) => {
    if (statusFilter === 'ALL') return true;
    return invoice.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1" /> Chưa đóng</span>;
      case 'PARTIAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" /> Đóng một phần</span>;
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Đã đóng đủ</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Không rõ</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.classId || !generateForm.title || !generateForm.amount || !generateForm.dueDate) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await generateInvoices({
        classId: Number(generateForm.classId),
        semesterId: generateForm.semesterId,
        title: generateForm.title,
        amount: Number(generateForm.amount),
        dueDate: generateForm.dueDate
      }).unwrap();
      toast.success("Phát sinh hóa đơn thành công!");
      setIsModalOpen(false);
      // Optional: refetch invoices if we had a refetch function, but RTK query invalidates tags automatically
    } catch (err: any) {
      toast.error(err?.data?.message || "Có lỗi xảy ra khi tạo hóa đơn");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 text-orange-500 mr-2" />
            Theo dõi Học phí
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý và theo dõi tình trạng đóng học phí của học sinh</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo hóa đơn
          </button>
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
              <option value="UNPAID">Chưa đóng</option>
              <option value="PARTIAL">Đóng một phần</option>
              <option value="PAID">Đã đóng đủ</option>
            </select>
          </div>

          {/* Lọc theo Học kỳ */}
          <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-600 pl-2 mr-2">Học kỳ:</span>
            {isLoadingSemesters ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 cursor-pointer font-medium px-4 py-1.5 outline-none"
              >
                {semestersData?.data?.content?.map((sem: any) => {
                  const startYear = sem.startDate ? new Date(sem.startDate).getFullYear() : '';
                  const endYear = sem.endDate ? new Date(sem.endDate).getFullYear() : '';
                  const displayYear = startYear && endYear && startYear !== endYear ? ` - Năm học ${startYear}-${endYear}` : (startYear ? ` - Năm học ${startYear}` : '');
                  const displayName = `${sem.name}${displayYear}`;
                  return <option key={sem.id} value={sem.id}>{displayName}</option>;
                })}
                {(!semestersData?.data?.content || semestersData.data.content.length === 0) && (
                  <>
                    <option value={1}>Học kỳ 1</option>
                    <option value={2}>Học kỳ 2</option>
                  </>
                )}
              </select>
            )}
          </div>

          {/* Lọc theo Lớp */}
          <div className="flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-600 pl-2 mr-2">Lớp:</span>
            {isLoadingClasses ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedClass === null ? 'ALL' : selectedClass}
                onChange={(e) => setSelectedClass(e.target.value === 'ALL' ? null : Number(e.target.value))}
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
            Tổng số: <span className="ml-1.5 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">{filteredInvoices.length} hóa đơn</span>
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

        {isLoadingInvoices ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải danh sách học phí...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center text-gray-400">
            <DollarSign className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-lg font-medium text-gray-600">Chưa có dữ liệu học phí</p>
            <p className="text-sm mt-1">Không tìm thấy hóa đơn học phí nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">STT</th>
                  <th className="px-6 py-4">Học sinh</th>
                  <th className="px-6 py-4">Nội dung</th>
                  <th className="px-6 py-4">Học phí / Đã đóng</th>
                  <th className="px-6 py-4">Hạn nộp</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice: any, index: number) => (
                  <tr key={invoice.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{invoice.studentName}</div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Hash className="w-3 h-3 mr-1" />
                        {invoice.studentRollNumber || 'Chưa có mã'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{invoice.title}</div>
                      <div className="text-gray-500 text-xs mt-1 bg-gray-100 px-2 py-0.5 rounded w-max">
                        {invoice.semesterName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</div>
                      <div className="text-xs mt-1 flex items-center">
                        <span className="text-gray-500 mr-1">Đã đóng:</span>
                        <span className={invoice.paidAmount >= invoice.amount ? 'text-green-600 font-medium' : invoice.paidAmount > 0 ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
                          {formatCurrency(invoice.paidAmount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1.5 text-orange-400" />
                        <span className={new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' ? 'text-red-600 font-medium' : ''}>
                          {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(invoice.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Generate Invoices Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-orange-500" />
                Tạo hóa đơn học phí
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleGenerateInvoices} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Chọn lớp học *</label>
                <select
                  required
                  value={generateForm.classId}
                  onChange={(e) => setGenerateForm({...generateForm, classId: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Học kỳ *</label>
                <select
                  required
                  value={generateForm.semesterId}
                  onChange={(e) => setGenerateForm({...generateForm, semesterId: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {semestersData?.data?.content?.map((sem: any) => {
                    const startYear = sem.startDate ? new Date(sem.startDate).getFullYear() : '';
                    const endYear = sem.endDate ? new Date(sem.endDate).getFullYear() : '';
                    const displayYear = startYear && endYear && startYear !== endYear ? ` - Năm học ${startYear}-${endYear}` : (startYear ? ` - Năm học ${startYear}` : '');
                    const displayName = `${sem.name}${displayYear}`;
                    return <option key={sem.id} value={sem.id}>{displayName}</option>;
                  })}
                  {(!semestersData?.data?.content || semestersData.data.content.length === 0) && (
                    <>
                      <option value={1}>Học kỳ 1</option>
                      <option value={2}>Học kỳ 2</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Nội dung / Tiêu đề hóa đơn *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Học phí kỳ 1 năm 2026"
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({...generateForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Số tiền (VNĐ) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="VD: 15000000"
                  value={generateForm.amount}
                  onChange={(e) => setGenerateForm({...generateForm, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Hạn nộp tiền *</label>
                <input
                  required
                  type="date"
                  value={generateForm.dueDate}
                  onChange={(e) => setGenerateForm({...generateForm, dueDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                />
              </div>

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
                  disabled={isGenerating}
                  className="px-6 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center"
                >
                  {isGenerating ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Đang tạo...</>
                  ) : (
                    "Tạo ngay"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;
