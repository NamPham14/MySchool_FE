/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "./baseApi";
import type { 
  SchoolClassPageResponse, 
  SemesterPageResponse, 
  SubjectPageResponse,
  SchoolClassResponse,
  SubjectResponse,
  TimetableResponse,
  TimetableRequest,
  AssignmentResponse,
  AssignmentRequest,
  StudentGradeResponse,
  GradeRequest
} from "../../types/academic.type";
import type { APIResponse } from "../../types/common.type";

export interface ClubResponse {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  leaderId: number;
  leaderName: string;
  maxMembers: number;
  currentMembers: number;
  status: string;
}

export interface ClubMemberResponse {
  id: number;
  clubId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  status: string;
  joinDate: string;
}

export interface AnnouncementResponse {
  id: number;
  classId: number;
  title: string;
  content: string;
  createdAt: string;
  authorName?: string;
}

export interface AnnouncementRequest {
  classId: number;
  title: string;
  content: string;
}

export const academicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query<SchoolClassPageResponse, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/classes",
        params,
      }),
      providesTags: ["Classes"],
    }),
    getSemesters: builder.query<SemesterPageResponse, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/semesters",
        params,
      }),
      providesTags: ["Semesters"],
    }),
    getSubjects: builder.query<SubjectPageResponse, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/subjects",
        params,
      }),
      providesTags: ["Subjects"],
    }),
    createClass: builder.mutation<APIResponse<SchoolClassResponse>, { name: string; grade: number; academicYear: string }>({
      query: (body) => ({
        url: "/classes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    createSubject: builder.mutation<APIResponse<SubjectResponse>, { code: string; name: string }>({
      query: (body) => ({
        url: "/subjects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subjects"],
    }),
    updateClass: builder.mutation<APIResponse<SchoolClassResponse>, { id: number; data: { name: string; grade: number; academicYear: string } }>({
      query: ({ id, data }) => ({
        url: `/classes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Classes"],
    }),
    deleteClass: builder.mutation<APIResponse<string>, number>({
      query: (id) => ({
        url: `/classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Classes"],
    }),
    updateSubject: builder.mutation<APIResponse<SubjectResponse>, { id: number; data: { code: string; name: string } }>({
      query: ({ id, data }) => ({
        url: `/subjects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Subjects"],
    }),
    deleteSubject: builder.mutation<APIResponse<SubjectResponse>, number>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subjects"],
    }),
    
    // Timetables API
    getSchedulesByClass: builder.query<APIResponse<TimetableResponse[]>, number>({
      query: (classId) => `/schedules/class/${classId}`,
      providesTags: ["Timetables"],
    }),
    createSchedule: builder.mutation<APIResponse<TimetableResponse>, TimetableRequest>({
      query: (body) => ({
        url: `/schedules`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Timetables"],
    }),
    updateSchedule: builder.mutation<APIResponse<TimetableResponse>, { id: number; data: TimetableRequest }>({
      query: ({ id, data }) => ({
        url: `/schedules/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Timetables"],
    }),
    deleteSchedule: builder.mutation<APIResponse<string>, number>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Timetables"],
    }),
    importTimetable: builder.mutation<APIResponse<TimetableResponse[]>, { file: File, overwrite: boolean }>({
      query: ({ file, overwrite }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/schedules/import?overwrite=${overwrite}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Timetables"],
    }),
    
    // Assignments API
    getAssignmentsByClass: builder.query<APIResponse<AssignmentResponse[]>, number>({
      query: (classId) => `/assignments/class/${classId}`,
      providesTags: ["Assignments"],
    }),
    createAssignment: builder.mutation<APIResponse<AssignmentResponse>, AssignmentRequest>({
      query: (body) => ({
        url: `/assignments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assignments"],
    }),
    updateAssignment: builder.mutation<APIResponse<AssignmentResponse>, { id: number; data: AssignmentRequest }>({
      query: ({ id, data }) => ({
        url: `/assignments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Assignments"],
    }),
    deleteAssignment: builder.mutation<APIResponse<string>, number>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignments"],
    }),
    
    // Grades API
    getStudentGradesByClassAndSubject: builder.query<APIResponse<StudentGradeResponse[]>, { classId: number; subjectId: number; semesterId?: number }>({
      query: ({ classId, subjectId, semesterId = 1 }) => `/grades/class/${classId}/subject/${subjectId}?semesterId=${semesterId}`,
      providesTags: ["Grades"],
    }),
    inputGrade: builder.mutation<APIResponse<any>, GradeRequest>({
      query: (body) => ({
        url: `/grades/input`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grades"],
    }),
    importGradesExcel: builder.mutation<APIResponse<string>, { file: File, subjectId: number, semesterId: number }>({
      query: ({ file, subjectId, semesterId }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subjectId", subjectId.toString());
        formData.append("semesterId", semesterId.toString());
        return {
          url: `/grades/import`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Grades"],
    }),

    // Users API
    getTeachers: builder.query<APIResponse<any[]>, void>({
      query: () => `/users/teachers`,
      providesTags: ["Users"],
    }),
    getStudentsByClass: builder.query<APIResponse<any[]>, number | null>({
      query: (classId) => classId ? `/users/students?classId=${classId}` : `/users/students`,
      providesTags: ["Users"],
    }),
    createStudent: builder.mutation<APIResponse<any>, { classId: number; data: any }>({
      query: ({ classId, data }) => ({
        url: `/users/students?classId=${classId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    assignStudentToClass: builder.mutation<APIResponse<any>, { studentId: number; classId: number }>({
      query: ({ studentId, classId }) => ({
        url: `/users/students/${studentId}/assign?classId=${classId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Users"],
    }),

    // Leaves API
    getAllLeaves: builder.query<APIResponse<any[]>, number | null>({
      query: (classId) => classId ? `/leaves?classId=${classId}` : `/leaves`,
      providesTags: ["Leaves"],
    }),
    reviewLeave: builder.mutation<APIResponse<any>, { id: number; status: 'APPROVED' | 'REJECTED' }>({
      query: ({ id, status }) => ({
        url: `/leaves/${id}/review?status=${status}`,
        method: "PUT",
      }),
      invalidatesTags: ["Leaves"],
    }),

    // Fees API
    getAllInvoices: builder.query<APIResponse<any[]>, { semesterId?: number; classId?: number | null }>({
      query: ({ semesterId, classId }) => {
        const params = new URLSearchParams();
        if (semesterId) params.append("semesterId", semesterId.toString());
        if (classId) params.append("classId", classId.toString());
        return `/fees?${params.toString()}`;
      },
      providesTags: ["Fees"],
    }),
    generateInvoices: builder.mutation<APIResponse<any>, { classId: number, semesterId: number, title: string, amount: number, dueDate: string }>({
      query: (body) => ({
        url: `/fees/generate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Fees"],
    }),
    
    // Events API
    getEventCategories: builder.query<APIResponse<any[]>, void>({
      query: () => `/events/categories`,
      providesTags: ["Events"],
    }),
    getAllEvents: builder.query<APIResponse<any[]>, void>({
      query: () => `/events`,
      providesTags: ["Events"],
    }),
    createEvent: builder.mutation<APIResponse<any>, any>({
      query: (body) => ({
        url: `/events`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation<APIResponse<any>, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: builder.mutation<APIResponse<string>, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
    uploadFile: builder.mutation<APIResponse<string>, FormData>({
      query: (formData) => ({
        url: `/upload`,
        method: "POST",
        body: formData,
      }),
    }),

    // ANNOUNCEMENTS API
    getAnnouncementsByClass: builder.query<APIResponse<any[]>, number>({
      query: (classId) => `/announcements/class/${classId}`,
      providesTags: (_result, _error, arg) => [{ type: "Announcements", id: arg }],
    }),
    createAnnouncement: builder.mutation<APIResponse<AnnouncementResponse>, AnnouncementRequest>({
      query: (body) => ({
        url: `/announcements`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Announcements", id: arg.classId }],
    }),
    deleteAnnouncement: builder.mutation<APIResponse<string>, { id: number; classId: number }>({
      query: ({ id }) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Announcements", id: arg.classId }],
    }),

    // Clubs API
    getClubs: builder.query<APIResponse<ClubResponse[]>, void>({
      query: () => `/v1/clubs`,
      providesTags: ["Clubs"],
    }),
    createClub: builder.mutation<APIResponse<ClubResponse>, any>({
      query: (body) => ({
        url: `/v1/clubs`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Clubs"],
    }),
    updateClub: builder.mutation<APIResponse<ClubResponse>, { id: number, data: any }>({
      query: ({ id, data }) => ({
        url: `/v1/clubs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Clubs"],
    }),
    deleteClub: builder.mutation<APIResponse<string>, number>({
      query: (id) => ({
        url: `/v1/clubs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clubs"],
    }),
    getClubMembers: builder.query<APIResponse<ClubMemberResponse[]>, number>({
      query: (clubId) => `/v1/clubs/${clubId}/members`,
      providesTags: ["ClubMembers"],
    }),
    approveClubMember: builder.mutation<APIResponse<string>, number>({
      query: (memberId) => ({
        url: `/v1/clubs/members/${memberId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["ClubMembers", "Clubs"],
    }),
    rejectClubMember: builder.mutation<APIResponse<string>, number>({
      query: (memberId) => ({
        url: `/v1/clubs/members/${memberId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["ClubMembers", "Clubs"],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetSemestersQuery,
  useGetSubjectsQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetSchedulesByClassQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useImportTimetableMutation,
  useGetAssignmentsByClassQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetStudentGradesByClassAndSubjectQuery,
  useInputGradeMutation,
  useImportGradesExcelMutation,
  useGetTeachersQuery,
  useGetStudentsByClassQuery,
  useCreateStudentMutation,
  useAssignStudentToClassMutation,
  useGetAllLeavesQuery,
  useReviewLeaveMutation,
  useGetAllInvoicesQuery,
  useGenerateInvoicesMutation,
  useGetAllEventsQuery,
  useGetEventCategoriesQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUploadFileMutation,
  useGetAnnouncementsByClassQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  
  // Clubs
  useGetClubsQuery,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useGetClubMembersQuery,
  useApproveClubMemberMutation,
  useRejectClubMemberMutation,
} = academicApi;
