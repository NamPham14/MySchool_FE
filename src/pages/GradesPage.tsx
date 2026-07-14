import React, { useState, useEffect, useRef } from 'react';
import { 
  useGetClassesQuery, 
  useGetSubjectsQuery,
  useGetSemestersQuery,
  useGetStudentGradesByClassAndSubjectQuery,
  useInputGradeMutation,
  useImportGradesExcelMutation
} from '../store/api/academicApi';
import { GraduationCap, Save, CheckCircle2, User, BookOpen, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const GradesPage = () => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(1);
  
  // Local state for editing grades
  const [editingGrades, setEditingGrades] = useState<Record<number, { midtermScore?: number, finalScore?: number }>>({});

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({ page: 0, size: 100 });
  const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery({ page: 0, size: 100 });
  
  const { data: semestersData, isLoading: isLoadingSemesters } = useGetSemestersQuery({ page: 0, size: 100 });

  const { 
    data: gradesData, 
    isLoading: isLoadingGrades,
    refetch
  } = useGetStudentGradesByClassAndSubjectQuery(
    { classId: selectedClassId!, subjectId: selectedSubjectId!, semesterId: selectedSemesterId },
    { skip: !selectedClassId || !selectedSubjectId }
  );

  const [inputGrade, { isLoading: isSaving }] = useInputGradeMutation();
  const [importGradesExcel, { isLoading: isImporting }] = useImportGradesExcelMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const students = gradesData?.data || [];

  const handleExportTemplate = () => {
    if (!selectedClassId || !selectedSubjectId) return;
    const url = `http://localhost:8080/api/grades/class/${selectedClassId}/export-template?subjectId=${selectedSubjectId}&semesterId=${selectedSemesterId}`;
    window.open(url, '_blank');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedSubjectId) {
      toast.error('Vui lòng chọn Môn Học trước khi Import!');
      return;
    }
    
    const toastId = toast.loading('Đang Import điểm vào hệ thống...');
    try {
      await importGradesExcel({ 
        file, 
        subjectId: selectedSubjectId, 
        semesterId: selectedSemesterId 
      }).unwrap();
      
      toast.success('Import điểm thành công!', { id: toastId });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi import điểm', { id: toastId });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Set default selections
  useEffect(() => {
    if (classesData?.data?.content?.length && !selectedClassId) {
      setTimeout(() => setSelectedClassId(classesData.data.content[0].id), 0);
    }
    if (subjectsData?.data?.content?.length && !selectedSubjectId) {
      setTimeout(() => setSelectedSubjectId(subjectsData.data.content[0].id), 0);
    }
  }, [classesData, subjectsData, semestersData, selectedClassId, selectedSubjectId]);

  // Sync loaded grades to local editing state
  useEffect(() => {
    if (students.length > 0) {
      const initialGrades: Record<number, any> = {};
      students.forEach((student: any) => {
        initialGrades[student.studentId] = {
          midtermScore: student.midtermScore !== undefined && student.midtermScore !== null ? student.midtermScore : '',
          finalScore: student.finalScore !== undefined && student.finalScore !== null ? student.finalScore : ''
        };
      });
      setEditingGrades(initialGrades);
    } else {
      setEditingGrades({});
    }
  }, [students]);

  const handleGradeChange = (studentId: number, field: 'midtermScore' | 'finalScore', value: string) => {
    // Allows empty string or valid numbers between 0 and 10
    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 10)) {
      return;
    }
    
    setEditingGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value === '' ? '' : Number(value)
      }
    }));
  };

  const handleSaveStudentGrade = async (studentId: number) => {
    const grades = editingGrades[studentId];
    if (!grades) return;

    if (!selectedSubjectId) {
      toast.error('Vui lòng chọn môn học');
      return;
    }

    const payload = {
      studentId,
      subjectId: selectedSubjectId,
      semesterId: selectedSemesterId,
      midtermScore: grades.midtermScore === '' ? null : Number(grades.midtermScore),
      finalScore: grades.finalScore === '' ? null : Number(grades.finalScore),
    };

    try {
      await inputGrade(payload).unwrap();
      toast.success('Lưu điểm thành công!');
      refetch(); // Reload to get updated average score
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi lưu điểm');
    }
  };

  const handleSaveAll = async () => {
    if (!selectedSubjectId) return;
    
    let successCount = 0;
    let errorCount = 0;
    
    const toastId = toast.loading('Đang lưu tất cả điểm...');

    for (const student of students) {
      const grades = editingGrades[student.studentId];
      if (!grades) continue;
      
      const payload = {
        studentId: student.studentId,
        subjectId: selectedSubjectId,
        semesterId: selectedSemesterId,
        midtermScore: grades.midtermScore === '' ? null : Number(grades.midtermScore),
        finalScore: grades.finalScore === '' ? null : Number(grades.finalScore),
      };

      try {
        await inputGrade(payload).unwrap();
        successCount++;
      } catch (e) {
        errorCount++;
      }
    }

    if (errorCount === 0 && successCount > 0) {
      toast.success(`Đã lưu điểm cho ${successCount} học sinh!`, { id: toastId });
    } else if (successCount > 0) {
      toast.error(`Lưu thành công ${successCount}, thất bại ${errorCount}.`, { id: toastId });
    } else {
      toast.error('Không có điểm nào được lưu.', { id: toastId });
    }
    
    refetch();
  };

  // Check if student has unsaved changes
  const hasChanges = (student: any) => {
    const local = editingGrades[student.studentId];
    if (!local) return false;
    
    const currentMid = student.midtermScore !== undefined && student.midtermScore !== null ? student.midtermScore : '';
    const currentFin = student.finalScore !== undefined && student.finalScore !== null ? student.finalScore : '';
    
    return local.midtermScore !== currentMid || local.finalScore !== currentFin;
  };

  const anyChanges = students.some(hasChanges);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="w-8 h-8 text-orange-500 mr-2" />
            Quản lý Điểm số
          </h1>
          <p className="text-sm text-gray-500 mt-1">Nhập và cập nhật điểm số cho học sinh</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Lớp */}
          <div className="flex items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-500 pl-3 mr-2">Lớp:</span>
            {isLoadingClasses ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedClassId || ''}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                className="bg-gray-50 border-none text-gray-900 text-sm rounded-lg focus:ring-0 cursor-pointer font-medium py-1.5"
              >
                {classesData?.data?.content?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Môn học */}
          <div className="flex items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-500 pl-3 mr-2">Môn:</span>
            {isLoadingSubjects ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedSubjectId || ''}
                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                className="bg-gray-50 border-none text-gray-900 text-sm rounded-lg focus:ring-0 cursor-pointer font-medium py-1.5"
              >
                {subjectsData?.data?.content?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Học kỳ */}
          <div className="flex items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-500 pl-3 mr-2">Kỳ:</span>
            {isLoadingSemesters ? (
              <span className="text-sm text-gray-400 px-4">Đang tải...</span>
            ) : (
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                className="bg-gray-50 border-none text-gray-900 text-sm rounded-lg focus:ring-0 cursor-pointer font-medium py-1.5"
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
                    <option value={1}>Học kỳ 1 (2026-2027)</option>
                    <option value={2}>Học kỳ 2 (2026-2027)</option>
                  </>
                )}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Actions */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1.5 text-gray-400" />
            Sĩ số: <strong className="ml-1 text-gray-900">{students.length}</strong>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
            />
            
            <button 
              onClick={handleExportTemplate}
              disabled={!selectedClassId}
              className="flex items-center px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" /> Tải file mẫu
            </button>
            
            <button 
              onClick={handleImportClick}
              disabled={!selectedSubjectId || isImporting}
              className="flex items-center px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" /> {isImporting ? 'Đang xử lý...' : 'Nhập từ Excel'}
            </button>

            <button 
              onClick={handleSaveAll}
              disabled={!anyChanges || isSaving}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                anyChanges && !isSaving
                  ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Đang lưu...</span>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Lưu tất cả thay đổi</>
              )}
            </button>
          </div>
        </div>

        {isLoadingGrades ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải danh sách điểm số...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center text-gray-400">
            <BookOpen className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-lg font-medium text-gray-600">Không có học sinh nào trong lớp này</p>
            <p className="text-sm mt-1">Vui lòng kiểm tra lại dữ liệu lớp học.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">STT</th>
                  <th className="px-6 py-4">Học sinh</th>
                  <th className="px-6 py-4 w-32 text-center">Điểm Giữa Kỳ<br/><span className="text-xs font-normal text-gray-400">(Trọng số: 40%)</span></th>
                  <th className="px-6 py-4 w-32 text-center">Điểm Cuối Kỳ<br/><span className="text-xs font-normal text-gray-400">(Trọng số: 60%)</span></th>
                  <th className="px-6 py-4 w-32 text-center">Trung Bình<br/><span className="text-xs font-normal text-orange-500 font-medium">Hệ thống tính</span></th>
                  <th className="px-6 py-4 w-24 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, index) => {
                  const localState = editingGrades[student.studentId] || {};
                  const isChanged = hasChanges(student);
                  
                  return (
                    <tr key={student.studentId} className={`hover:bg-orange-50/30 transition-colors ${isChanged ? 'bg-orange-50/10' : ''}`}>
                      <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.studentName} className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold mr-3 border border-orange-200">
                              {student.studentName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{student.studentName}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                              <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 mr-1.5">{student.rollNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Midterm Input */}
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={localState.midtermScore !== undefined ? localState.midtermScore : ''}
                          onChange={(e) => handleGradeChange(student.studentId, 'midtermScore', e.target.value)}
                          className={`w-20 mx-auto block text-center border rounded-lg py-2 focus:ring-2 focus:outline-none font-medium transition-colors ${
                            localState.midtermScore !== (student.midtermScore ?? '') 
                              ? 'border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-500' 
                              : 'border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                          }`}
                          placeholder="-"
                        />
                      </td>
                      
                      {/* Final Input */}
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={localState.finalScore !== undefined ? localState.finalScore : ''}
                          onChange={(e) => handleGradeChange(student.studentId, 'finalScore', e.target.value)}
                          className={`w-20 mx-auto block text-center border rounded-lg py-2 focus:ring-2 focus:outline-none font-medium transition-colors ${
                            localState.finalScore !== (student.finalScore ?? '') 
                              ? 'border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-500' 
                              : 'border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                          }`}
                          placeholder="-"
                        />
                      </td>
                      
                      {/* Average Score (Readonly) */}
                      <td className="px-6 py-4 text-center">
                        {student.averageScore !== undefined && student.averageScore !== null ? (
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                            student.averageScore >= 8.0 ? 'bg-green-100 text-green-700' :
                            student.averageScore >= 6.5 ? 'bg-blue-100 text-blue-700' :
                            student.averageScore >= 5.0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {student.averageScore.toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">Chưa có</span>
                        )}
                      </td>
                      
                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        {isChanged ? (
                          <button
                            onClick={() => handleSaveStudentGrade(student.studentId)}
                            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Lưu điểm học sinh này"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button disabled className="p-2 text-green-500 rounded-lg opacity-50" title="Đã lưu">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesPage;
