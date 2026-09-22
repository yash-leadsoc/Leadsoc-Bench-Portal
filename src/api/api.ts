import { http } from './client'
type M = Record<string, any>
const list = (d: any): M[] => (Array.isArray(d) ? d : (d?.rows ?? [])) as M[]

export const api = {
  // auth
  login: (email: string, password: string) => http.post('/auth/login', { email, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.post('/auth/change-password', { currentPassword, newPassword }),
  myProfile: () => http.get('/me/profile'),
  updateProfile: (b: M) => http.put('/me/profile', b),
  setAvailability: (slots: any[]) => http.put('/me/availability', { slots }),
  bootstrap: () => http.get('/bootstrap'),
  // registration / admin
  businessUnits: () => http.get('/admin/business-units').then(list),
  createBu: (b: M) => http.post('/admin/business-units', b),
  toggleBu: (code: string) => http.post(`/admin/business-units/${code}/active`),
  createTa: (b: M) => http.post('/ta', b),
  users: () => http.get('/users').then(list),
  toggleUser: (id: string) => http.post(`/users/${id}/active`),
  roles: () => http.get('/admin/roles').then(list),
  integrations: () => http.get('/admin/integrations').then(list),
  toggleIntegration: (id: string) => http.post(`/admin/integrations/${id}/toggle`),
  readinessWeights: () => http.get('/admin/readiness-weights'),
  setReadinessWeights: (skills: number, training: number, assessment: number) =>
    http.put('/admin/readiness-weights', null, { skills, training, assessment }),
  audit: () => http.get('/admin/audit').then(list),
  // employees
  employees: () => http.get('/employees').then(list),
  addEmployee: (b: M) => http.post('/employees', b),
  editEmployee: (id: string, b: M) => http.put(`/employees/${id}`, b),
  setStatus: (id: string, status: string) => http.post(`/employees/${id}/status`, { status }),
  benchReadiness: () => http.get('/bench/readiness').then(list),
  calendar: () => http.get('/calendar/availability'),
  employee360: (id: string) => http.get(`/reports/employee/${id}`),
  // dashboard
  dashboardKpis: () => http.get('/dashboard/kpis'),
  // materials
  materials: () => http.get('/materials').then(list),
  addMaterial: (b: M) => http.post('/materials', b),
  editMaterial: (id: string, b: M) => http.put(`/materials/${id}`, b),
  deleteMaterial: (id: string) => http.del(`/materials/${id}`),
  // plans
  plans: () => http.get('/plans').then(list),
  createPlan: (b: M) => http.post('/plans', b),
  editPlan: (id: string, b: M) => http.put(`/plans/${id}`, b),
  deletePlan: (id: string) => http.del(`/plans/${id}`),
  assignPlan: (id: string, employeeId: string) => http.post(`/plans/${id}/assign`, null, { employeeId }),
  planAssignments: (id: string) => http.get(`/plans/${id}/assignments`),
  myTrainingPlans: () => http.get('/training/plans/mine'),
  completeModule: (b: M) => http.post('/training/module/complete', b),

  myTrainingPlan: (id: string) => http.get(`/training/plans/mine/${id}`),
  addTrainingNote: (id: string, b: M) => http.post(`/training/plans/${id}/notes`, b),
  deleteTrainingNote: (id: string) => http.del(`/training/notes/${id}`),
  // progress
  employeeProgress: (id: string) => http.get(`/training/progress/${id}`),
  progressLogs: (id: string) => http.get(`/training/progress/${id}/logs`).then(list),
  myTraining: () => http.get('/training/mine'),
  myLogs: () => http.get('/training/mine/logs').then(list),
  logProgress: (b: M) => http.post('/training/progress/log', b),
  // assessments
  assessments: () => http.get('/assessments').then(list),
  assessment: (id: string) => http.get(`/assessments/${id}`),
  createAssessment: (b: M) => http.post('/assessments', b),
  editAssessment: (id: string, b: M) => http.put(`/assessments/${id}`, b),
  deleteAssessment: (id: string) => http.del(`/assessments/${id}`),
  assignAssessment: (id: string, employeeIds: string[], dueDate?: string) =>
    http.post(`/assessments/${id}/assign`, { employeeIds, dueDate }),
  assessmentAssignments: (id: string) => http.get(`/assessments/${id}/assignments`).then(list),
  assessmentResults: (id: string) => http.get(`/assessments/${id}/results`).then(list),
  myAssignments: () => http.get('/assignments/mine').then(list),
  submit: (id: string, b: M) => http.post(`/assignments/${id}/submit`, b),
  assignmentResult: (id: string) => http.get(`/assignments/${id}/result`),
  // prep
  banks: () => http.get('/prep/banks').then(list),
  createBank: (b: M) => http.post('/prep/banks', b),
  deleteBank: (id: string) => http.del(`/prep/banks/${id}`),
  prepMaterials: () => http.get('/prep/materials').then(list),
  addPrepMaterial: (b: M) => http.post('/prep/materials', b),
  deletePrepMaterial: (id: string) => http.del(`/prep/materials/${id}`),
  // interviews
  panels: () => http.get('/panels').then(list),
  createPanel: (b: M) => http.post('/panels', b),
  deletePanel: (id: string) => http.del(`/panels/${id}`),
  assignPanel: (id: string, employeeId: string) => http.post(`/panels/${id}/assign`, null, { employeeId }),
  mocks: () => http.get('/mocks').then(list),
  createMock: (b: M) => http.post('/mocks', b),
  mockScorecard: (id: string, b: M) => http.post(`/mocks/${id}/scorecard`, b),
  requirements: () => http.get('/interviews/requirements').then(list),
  interviews: () => http.get('/interviews/schedule').then(list),
  scheduleInterview: (b: M) => http.post('/interviews/schedule', b),
  myInterviews: () => http.get('/interviews/mine').then(list),
  // people
  trainers: () => http.get('/people/trainers').then(list),
  addTrainer: (b: M) => http.post('/people/trainers', b),
  deleteTrainer: (id: string) => http.del(`/people/trainers/${id}`),
  assignTrainer: (id: string, employeeId: string) => http.post(`/people/trainers/${id}/assign`, null, { employeeId }),
  skills: () => http.get('/people/skills').then(list),
  addSkill: (b: M) => http.post('/people/skills', b),
  deleteSkill: (id: string) => http.del(`/people/skills/${id}`),
  // reports + insights
  overview: () => http.get('/reports/overview'),
  benchReport: () => http.get('/reports/bench'),
  assessmentReport: () => http.get('/reports/assessments'),
  trainerReport: () => http.get('/reports/trainers'),
  interviewReport: () => http.get('/reports/interviews'),
  insightEmployee: (id: string) => http.get(`/insights/employee/${id}`),
  insightMe: () => http.get('/insights/me'),
  trainingReport: () => http.get('/reports/training'),
  assignments: () => http.get('/assignments'),
  // notifications
  notifications: () => http.get('/notifications'),
  markRead: (id: string) => http.post(`/notifications/${id}/read`),
  markAllRead: () => http.post('/notifications/read-all'),
  // library
  libDocs: () => http.get('/library/docs').then(list),
  libPending: () => http.get('/library/pending').then(list),
  addLibDoc: (b: M) => http.post('/library/docs', b),
  approveLibDoc: (id: string) => http.post(`/library/docs/${id}/approve`),
  deleteLibDoc: (id: string) => http.del(`/library/docs/${id}`),
  libDomains: () => http.get('/library/domains'),
  libQuiz: (domain: string) => http.get(`/library/quiz/${domain}`),
  setLibQuiz: (b: M) => http.post('/library/quiz', b),
  submitLibQuiz: (b: M) => http.post('/library/quiz/submit', b),
  libDomainProgress: (domain: string) => http.get(`/library/progress/${domain}`),
  // csv exports
  exportCsvUrl: (name: string) => `/export/${name}.csv`,

  createCto: (b: M) => http.post('/admin/cto', b),
  resetUserPassword: (uid: string, b: M) => http.post(`/users/${uid}/reset-password`, b),
  results: () => http.get('/results'),
}
