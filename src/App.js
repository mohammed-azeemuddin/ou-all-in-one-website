import React, { useRef, useEffect } from 'react';
import { useLocation, Switch } from 'react-router-dom';
import AppRoute from './utils/AppRoute';
import ScrollReveal from './utils/ScrollReveal';
import ReactGA from 'react-ga';

// Layouts
import LayoutDefault from './layouts/LayoutDefault';

// Views
import Home from './views/Home';
import QuestionPapers from './views/QuestionPapers';
import Notes from './views/Notes';
import Labs from './views/Labs';
import Placements from './views/Placements';

// Initialize Google Analytics
ReactGA.initialize(process.env.REACT_APP_GA_CODE);

const trackPage = page => {
  ReactGA.set({ page });
  ReactGA.pageview(page);
};

const App = () => {

  const childRef = useRef();
  let location = useLocation();

  useEffect(() => {
    const page = location.pathname;
    document.body.classList.add('is-loaded')
    childRef.current.init();
    trackPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <ScrollReveal
      ref={childRef}
      children={() => (
        <Switch>
          <AppRoute exact path="/" component={Home} layout={LayoutDefault} />
          <AppRoute exact path="/QuestionPapers" component={QuestionPapers} layout={LayoutDefault} />
          <AppRoute exact path="/Notes" component={Notes} layout={LayoutDefault} />
          <AppRoute exact path="/Labs" component={Labs} layout={LayoutDefault} />
          <AppRoute exact path="/Placements" component={Placements} layout={LayoutDefault} />
        </Switch>
      )} />
  );
}

export default App;
