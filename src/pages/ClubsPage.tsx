import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { 
  useGetClubsQuery, 
  useCreateClubMutation, 
  useUpdateClubMutation, 
  useDeleteClubMutation,
  useGetClubMembersQuery,
  useApproveClubMemberMutation,
  useRejectClubMemberMutation,
  useGetTeachersQuery
} from '../store/api/academicApi';
import type { ClubResponse } from '../store/api/academicApi';
import { Plus, Users, Tent, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const ClubsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const roles = user?.roles ? (Array.isArray(user.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.name) : []) : [];
  const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

  const { data: clubsRes, isLoading } = useGetClubsQuery();
  const clubs = clubsRes?.data || [];

  const [createClub] = useCreateClubMutation();
  const [updateClub] = useUpdateClubMutation();
  const [deleteClub] = useDeleteClubMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubResponse | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [leaderId, setLeaderId] = useState<number | ''>('');
  const [maxMembers, setMaxMembers] = useState<number>(30);
  const [status, setStatus] = useState('ACTIVE');

  const { data: teachersRes } = useGetTeachersQuery();
  const teachers = teachersRes?.data || [];

  const handleOpenCreate = () => {
    setEditingClub(null);
    setName('');
    setDescription('');
    setLogoUrl('');
    setLeaderId('');
    setMaxMembers(30);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (club: ClubResponse) => {
    setEditingClub(club);
    setName(club.name);
    setDescription(club.description || '');
    setLogoUrl(club.logoUrl || '');
    setLeaderId(club.leaderId || '');
    setMaxMembers(club.maxMembers || 30);
    setStatus(club.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      logoUrl,
      leaderId: leaderId === '' ? null : Number(leaderId),
      maxMembers: Number(maxMembers),
      status
    };

    try {
      if (editingClub) {
        await updateClub({ id: editingClub.id, data }).unwrap();
        toast.success('Cập nhật CLB thành công');
      } else {
        await createClub(data).unwrap();
        toast.success('Tạo CLB thành công');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClub(deleteId).unwrap();
      toast.success('Xóa CLB thành công');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tent className="w-8 h-8 mr-3 text-orange-600" />
            Quản lý Câu lạc bộ
          </h1>
          <p className="text-gray-500 mt-1">Danh sách các câu lạc bộ ngoại khóa</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleOpenCreate}
            className="flex items-center px-4 py-2.5 bg-orange-600 text-white font-medium text-sm rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Thêm CLB Mới
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
              <div className="flex items-start justify-between mb-4 pl-4">
                <div className="flex items-center space-x-4">
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt={club.name} className="w-16 h-16 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                      <Tent className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{club.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Users className="w-4 h-4 mr-1" />
                      {club.currentMembers || 0} / {club.maxMembers} thành viên
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pl-4 space-y-2 mb-4">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">{club.description || 'Chưa có mô tả'}</p>
                <div className="text-sm">
                  <span className="text-gray-500">Chủ nhiệm: </span>
                  <span className="font-medium text-gray-900">{club.leaderName || 'Chưa phân công'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Trạng thái: </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${club.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {club.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
              </div>

              <div className="pl-4 flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedClubId(club.id);
                    setIsMembersModalOpen(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Thành viên
                </button>
                {isAdmin && (
                  <>
                    <button 
                      onClick={() => handleOpenEdit(club)}
                      className="px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => setDeleteId(club.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {clubs.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
              Chưa có câu lạc bộ nào
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900/50" onClick={() => setIsModalOpen(false)} />

            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingClub ? 'Cập nhật Câu lạc bộ' : 'Thêm Câu lạc bộ'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên CLB *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    placeholder="VD: CLB Bóng Rổ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    placeholder="Mô tả về câu lạc bộ..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Logo (Tùy chọn)</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên chủ nhiệm</label>
                  <select
                    value={leaderId}
                    onChange={(e) => setLeaderId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  >
                    <option value="">-- Chọn giáo viên --</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thành viên tối đa</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Tạm dừng</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    {editingClub ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {isMembersModalOpen && selectedClubId && (
        <MembersModal 
          clubId={selectedClubId} 
          onClose={() => {
            setIsMembersModalOpen(false);
            setSelectedClubId(null);
          }} 
          isAdmin={isAdmin}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa Câu lạc bộ"
        message="Bạn có chắc chắn muốn xóa Câu lạc bộ này? Hành động này sẽ xóa tất cả thành viên trong CLB và không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        isDestructive={true}
      />
    </div>
  );
};

// Component con để quản lý thành viên (Tách ra để fetch query riêng)
const MembersModal = ({ clubId, onClose, isAdmin }: { clubId: number, onClose: () => void, isAdmin: boolean }) => {
  const { data, isLoading } = useGetClubMembersQuery(clubId);
  const members = data?.data || [];
  
  const [approveMember] = useApproveClubMemberMutation();
  const [rejectMember] = useRejectClubMemberMutation();

  const handleApprove = async (id: number) => {
    try {
      await approveMember(id).unwrap();
      toast.success('Đã duyệt thành viên');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi duyệt');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMember(id).unwrap();
      toast.success('Đã từ chối');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi từ chối');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900/50" onClick={onClose} />
        <div className="relative inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h3 className="text-xl font-bold text-gray-900">Danh sách Thành viên</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">Đang tải...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-gray-500 border border-dashed rounded-xl">Chưa có ai tham gia</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Học sinh</th>
                    <th className="px-4 py-3">Ngày tham gia</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    {isAdmin && <th className="px-4 py-3 rounded-tr-lg">Hành động</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {m.studentName}
                        <div className="text-xs text-gray-500 font-normal">{m.studentEmail}</div>
                      </td>
                      <td className="px-4 py-3">{new Date(m.joinDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${m.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            m.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}
                        >
                          {m.status === 'APPROVED' ? 'Thành viên' : m.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          {m.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <button onClick={() => handleApprove(m.id)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Duyệt">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleReject(m.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Từ chối">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubsPage;
