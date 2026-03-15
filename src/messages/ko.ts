export const messages = {
  common: {
    authRequired: "인증이 필요합니다",
    saveFailed: "저장 중 오류가 발생했습니다",
    changeReasonMin: "변경 사유는 5자 이상 입력해야 합니다",
  },
  auth: {
    nameRequired: "이름은 필수입니다",
    emailInvalid: "올바른 이메일 형식이 아닙니다",
    passwordMin: "비밀번호는 8자 이상이어야 합니다",
    passwordConfirmRequired: "비밀번호 확인을 입력하세요",
    passwordMismatch: "비밀번호가 일치하지 않습니다",
    emailDuplicate: "이미 사용 중인 이메일입니다",
    signUpFailed: "회원가입 중 오류가 발생했습니다",
  },
  customer: {
    nameRequired: "고객사명은 필수입니다",
    notFound: "수정하려는 고객사를 찾을 수 없습니다",
    duplicateName: "이미 등록된 고객사명입니다",
  },
  history: {
    titleRequired: "제목은 필수입니다",
    contentRequired: "내용은 필수입니다",
    customerNotFound: "존재하지 않는 고객사입니다",
  },
  systemInfo: {
    idRequired: "시스템 정보 ID가 필요합니다",
    nameRequired: "시스템명은 필수입니다",
    accessReasonMin: "조회 사유는 5자 이상 입력해야 합니다",
    notFound: "수정하려는 시스템 정보를 찾을 수 없습니다",
    deleteNotFound: "삭제하려는 시스템 정보를 찾을 수 없습니다",
    systemNotFound: "시스템 정보를 찾을 수 없습니다",
    passwordNotFound: "저장된 비밀번호가 없습니다",
    fetchFailed: "조회 중 오류가 발생했습니다",
    deleteFailed: "삭제 중 오류가 발생했습니다",
  },
  stakeholder: {
    nameRequired: "담당자명은 필수입니다",
    emailInvalid: "올바른 이메일 형식이 아닙니다",
    notFound: "수정하려는 담당자를 찾을 수 없습니다",
    deleteNotFound: "삭제하려는 담당자를 찾을 수 없습니다",
    deleteFailed: "삭제 중 오류가 발생했습니다",
  },
} as const;
