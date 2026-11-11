export const COURSES = [
  { id: 'engineering', title: 'Engineering', sub: 'B.E. all branches', img: '/img/prev_papers.jpg', icon: '⚙️' },
  { id: 'pharmacy', title: 'Pharmacy', sub: 'B.Pharm · Pharm.D', icon: '🧪' },
  { id: 'bba', title: 'BBA', sub: 'Business Administration', icon: '💼' },
  { id: 'law', title: 'Law', sub: 'LL.B · BA LLB', icon: '⚖️' },
  { id: 'other', title: 'Other streams', sub: 'Everything else', icon: '📚' },
];
export const SECTIONS = {
  papers: { title: 'Previous Question Papers', noun: 'papers', suffix: 'qp', blurb: 'Pick your course to browse papers by subject and year.', gif: '/img/guy_with_papers.gif' },
  notes: { title: 'Notes and References', noun: 'notes', suffix: 'notes', blurb: 'Printed and handwritten notes, by course.', gif: '/img/guy_with_book.gif' },
};
export const collectionFor = (section, course) => `${course}_${SECTIONS[section].suffix}`;
export const courseById = (id) => COURSES.find((c) => c.id === id);
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.azeem.ou_app2';
export const TELEGRAM_URL = 'https://t.me/ouallinone';
/** Fill in once the iPhone app is live on the App Store; until then the button says "coming soon". */
export const APP_STORE_URL = '';
export const CONTACT_EMAIL = 'ouallinone@gmail.com';
