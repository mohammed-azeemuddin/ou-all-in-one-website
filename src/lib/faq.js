/**
 * Questions students type into Google, answered in plain words. Shown on the page (the <Faq>
 * component) and written into the pre-rendered HTML with FAQ structured data (scripts/prerender.mjs),
 * so both always say the same thing. No imports here: the build script loads this file directly.
 */
export const FAQ = {
  papers: [
    ['Where can I download OU previous question papers?', 'Right here. Pick your course, open a subject, and every Osmania University previous year question paper for it opens as a PDF that you can read online or download. It is free and needs no sign-up.'],
    ['Which courses have previous question papers?', 'B.E. (Engineering, all branches), B.Pharmacy, BBA and Law (LL.B / BA LLB), with other streams added as papers come in.'],
    ['How do I find a paper by subject name or subject code?', 'Use the search box on the home page and type the subject name or the paper code. Each subject page lists its papers from the newest exam to the oldest.'],
    ['Are these the official Osmania University papers?', 'They are scans of the question papers given in OU exams, collected and shared by students. OU All In One is an independent student project and is not affiliated with Osmania University.'],
  ],
  notes: [
    ['Where can I get OU notes as PDF?', 'Pick your course, open a subject, and read or download its notes as PDF files. Everything is free and needs no sign-up.'],
    ['Which courses have notes?', 'Mostly B.E. (Engineering) subjects, plus Pharmacy, BBA and Law where students have shared them. More are added regularly.'],
    ['Can I share my own notes?', 'Yes. Email them to ouallinone@gmail.com and they will be added for everyone.'],
  ],
  placements: [
    ['Is this placement preparation course free?', 'Yes. Every practice question, explanation and mock test is free, and you do not need to sign up. Your progress is saved in your browser.'],
    ['What does the placement preparation cover?', 'Quantitative aptitude, logical reasoning, verbal ability, technical MCQs (C, C++, Java, Python, DBMS, OS, AI and Gen AI), coding questions, interview questions with answers, and timed mock tests built on each company’s reported test pattern.'],
    ['Which companies can I prepare for?', 'TCS NQT, Infosys, Wipro, Accenture, Cognizant, Capgemini, HCLTech, Deloitte, Tech Mahindra and LTIMindtree. Each has its test pattern, tips, free mock tests and the questions candidates reported from earlier drives.'],
    ['Are the previous year company questions real?', 'Companies do not publish their question papers. The previous year questions here are memory-based: candidates reported them after their tests, and they are written up with our own answers and step-by-step solutions.'],
    ['Can students from other colleges use it?', 'Yes. The placement section is for final-year students and freshers from any college or university, not only Osmania University.'],
    ['How do I get job and internship updates?', 'Join the Telegram channel t.me/ouallinone. New job and internship openings for freshers are posted there.'],
  ],
  interviews: [
    ['What is an interview experience?', 'A summary of what candidates reported after their interviews: the rounds, the technical and HR questions they were asked, and what helped them get selected.'],
    ['Which companies have interview experiences here?', 'TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini and other companies that hire freshers in large numbers. Each page links the public write-ups it was summarised from.'],
    ['Do the interview questions have answers?', 'Yes. The subject pages (HR, OOP, C, C++, Java, Python, DSA, DBMS, SQL, OS, networks and Gen AI) give a short, clear answer to every question, and show which companies asked it.'],
  ],
};
