const PATIENT_STATE = {
  CALLING: { label: "接诊中", class: "status-calling", state: 0 },
  PRIORITY: { label: "优先", class: "status-priority", state: 1 },
  WAITING: { label: "候诊中", class: "status-waiting", state: 2 },
  REVISIT: { label: "复诊", class: "status-revisit", state: 3 },
  PASSED: { label: "过号", class: "status-passed", state: 4 },
  CALLED: { label: "结诊", class: "status-called", state: 99 },
};

export default {
  PATIENT_STATE: { ...PATIENT_STATE },
};
