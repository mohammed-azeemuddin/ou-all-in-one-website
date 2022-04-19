import React from 'react';
import classNames from 'classnames';
import { SectionTilesProps } from '../../utils/SectionProps';
import SectionHeader from './partials/SectionHeader';
import Image from '../elements/Image';
import './ModifiedStyles.css';
import { Link } from 'react-router-dom';

const styles = {
  myborder:{
    border: '2px solid white',
    borderRadius:'25px',
    margin:'20px',
    padding: '44px'
  },
  icon : {
    padding: '10px'
  }
}

const propTypes = {
  ...SectionTilesProps.types
}

const defaultProps = {
  ...SectionTilesProps.defaults
}
const FeaturesTiles = ({
  className,
  topOuterDivider,
  bottomOuterDivider,
  topDivider,
  bottomDivider,
  hasBgColor,
  invertColor,
  pushLeft,
  ...props
}) => {

  const outerClasses = classNames(
    'features-tiles section',
    topOuterDivider && 'has-top-divider',
    bottomOuterDivider && 'has-bottom-divider',
    hasBgColor && 'has-bg-color',
    invertColor && 'invert-color',
    className
  );

  const innerClasses = classNames(
    'features-tiles-inner section-inner pt-0',
    topDivider && 'has-top-divider',
    bottomDivider && 'has-bottom-divider'
  );

  const tilesClasses = classNames(
    'tiles-wrap center-content',
    pushLeft && 'push-left'
  );

  const sectionHeader = {
    title: 'All your resources at one place',
  };


  return (
    <section
      {...props}
      className={outerClasses}
    >
      <div className="container">
        <div className={innerClasses}>
          <SectionHeader data={sectionHeader} className="center-content" />
          <div className={tilesClasses}>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom">
              <Link to="/QuestionPapers">
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style = {styles.icon}
                      src={require('./../../myImages/engineer_icon.png')}
                      alt="Features tile icon 01"
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Previous Question Papers
                    </h4>
                  <p className="m-0 text-sm">
                    Previous year Question papers from various branches.
                  </p>
                </div>
              </div>
              </Link>
            </div>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom">
            <Link to={{
                  pathname: "/Notes",
                  state: { title: "New title here", dbName: "engineering_notes"}
              }}>
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style = {styles.icon}
                      src={require('./../../myImages/notes_icon.png')}
                      alt="Features tile icon 01"
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Notes
                    </h4>
                  <p className="m-0 text-sm">
                    All the required notes for students to help in preparation.
                  </p>
                </div>
              </div>
              </Link>
            </div>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom" data-reveal-delay="400">
            <Link to="/Labs">
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style = {styles.icon}
                      src={require('./../../myImages/lab_icon.png')}
                      alt="Features tile icon 01"
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Labs
                    </h4>
                  <p className="m-0 text-sm">
                    Lab manuals for students and VIVA questions and answers.
                  </p>
                </div>
              </div>
              </Link>
            </div>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom">
            <Link to="/Placements">
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style = {styles.icon}
                      src={require('./../../myImages/job_icon.png')}
                      alt="Features tile icon 01"
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Placements
                    </h4>
                  <p className="m-0 text-sm">
                    Upcoming placement opportunities and material that will help students in their placements.
                  </p>
                </div>
              </div>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

FeaturesTiles.propTypes = propTypes;
FeaturesTiles.defaultProps = defaultProps;

export default FeaturesTiles;
