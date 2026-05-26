// All BICIOT modules — Year 1 to Year 3
// Source: DUT Bachelor of ICT in Internet of Things curriculum

export const MODULES = [
  { code: '', name: 'All modules', year: '' },
  // ── Year 1 Semester 1 ──
  { code: 'AADC101', name: 'Analog and Digital Circuits', year: '1' },
  { code: 'ENMA101', name: 'Engineering Mathematics 1A', year: '1' },
  { code: 'ICLK101', name: 'ICT Literacy and Skills', year: '1' },
  { code: 'INPR101', name: 'Introduction to Programming', year: '1' },
  { code: 'ITOS101', name: 'Introduction to Operating Systems', year: '1' },
  { code: 'POCC101', name: 'Principles of Computer Composition', year: '1' },
  // ── Year 1 Semester 2 ──
  { code: 'BAAI102', name: 'Basic Application of AI', year: '1' },
  { code: 'BSFN102', name: 'Business Fundamentals 1', year: '1' },
  { code: 'CSTN101', name: 'Cornerstone 101', year: '1' },
  { code: 'ENMA102', name: 'Engineering Mathematics 1B', year: '1' },
  { code: 'SPAT102', name: 'Sensor Principles and Technology', year: '1' },
  // ── Year 2 Semester 1 ──
  { code: 'BSFN211', name: 'Business Fundamentals 2', year: '2' },
  { code: 'DSST201', name: 'Discrete Structures', year: '2' },
  { code: 'EMCC201', name: 'Embedded Micro-Controller Technology', year: '2' },
  { code: 'ITIT201', name: 'IoT Identification Technology', year: '2' },
  { code: 'PRPD201', name: 'Programming Paradigms', year: '2' },
  // ── Year 2 Semester 2 ──
  { code: 'DTMG202', name: 'Data Management', year: '2' },
  { code: 'IWNT202', name: 'Wireless Networking Technology', year: '2' },
  { code: 'LWLF101', name: 'Law for Life', year: '2' },
  { code: 'MOS202',  name: 'Mobile Operating System Technology', year: '2' },
  { code: 'NBIT202', name: 'Narrow Band IoT', year: '2' },
  { code: 'WBDV202', name: 'Web Development', year: '2' },
  // ── Year 3 Semester 1 ──
  { code: 'BSPE301', name: 'Business Process Engineering', year: '3' },
  { code: 'CLCM301', name: 'Cloud Computing', year: '3' },
  { code: 'ITDA301', name: 'IoT Data Analysis', year: '3' },
  { code: 'ITPI301', name: 'IoT Project Planning and Implementation', year: '3' },
  { code: 'MBDV301', name: 'Mobile Development', year: '3' },
  { code: 'ITRS301', name: 'Research Skills', year: '3' },
  // ── Year 3 Semester 2 ──
  { code: 'ENSP101', name: 'Entrepreneurial Spirit', year: '3' },
  { code: 'IOTP302', name: 'IoT Project', year: '3' },
  { code: 'IOTS302', name: 'IoT Security', year: '3' },
]

// Just the codes for simple selects
export const MODULE_CODES = MODULES.map(m => m.code)

// Grouped by year for the discussions filter
export const MODULES_BY_YEAR = {
  '1': MODULES.filter(m => m.year === '1'),
  '2': MODULES.filter(m => m.year === '2'),
  '3': MODULES.filter(m => m.year === '3'),
}
