import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { Footer, Header } from './components/ui';
import Home from './pages/Home';
import { Contact, CourseList, Folder, Labs, NotFound, SearchPage, Section, SubjectPage, Tools, Viewer } from './pages/Pages';
import { PrepCoding, PrepCodingProblem, PrepCompanies, PrepInterviewCompany, PrepInterviews, PrepInterviewSubject, PrepCompany, PrepGroup, PrepHub, PrepMock, PrepTopic } from './pages/Prep';

// The admin page is loaded only when /admin is opened, so visitors never download it.
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Header />
      <main id="main" key={pathname} className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/papers" element={<Section section="papers" />} />
          <Route path="/papers/:course" element={<CourseList section="papers" />} />
          <Route path="/papers/:course/:subject" element={<SubjectPage section="papers" />} />
          <Route path="/notes" element={<Section section="notes" />} />
          <Route path="/notes/:course/:subject" element={<SubjectPage section="notes" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notes/:course" element={<CourseList section="notes" />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/placements" element={<PrepHub />} />
          <Route path="/placements/companies" element={<PrepCompanies />} />
          <Route path="/placements/companies/:id" element={<PrepCompany />} />
          <Route path="/placements/mock/:id" element={<PrepMock />} />
          <Route path="/placements/coding" element={<PrepCoding />} />
          <Route path="/placements/interviews" element={<PrepInterviews />} />
          <Route path="/placements/interviews/:company" element={<PrepInterviewCompany />} />
          <Route path="/placements/interview-questions/:subject" element={<PrepInterviewSubject />} />
          <Route path="/placements/coding/:id" element={<PrepCodingProblem />} />
          <Route path="/placements/:group" element={<PrepGroup />} />
          <Route path="/placements/:group/:topic" element={<PrepTopic />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
          <Route path="/view/:id" element={<Viewer />} />
          <Route path="/folder/:id" element={<Folder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {pathname.startsWith('/view/') ? null : <Footer />}
    </>
  );
}
