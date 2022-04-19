import React from 'react';
import classNames from 'classnames';
import { SectionTilesProps } from '../utils/SectionProps';
import Image from '../components/elements/Image';
import '../components/sections/ModifiedStyles.css';
import SectionHeader from '../components/sections/partials/SectionHeader';
import { Link } from 'react-router-dom';

const styles = {
  myborder:{
    border: '2px solid white',
    borderRadius:'25px',
    margin:'20px',
    padding: '44px'
  },
  icon: {
    padding: '10px'
  }
}

const propTypes = {
  ...SectionTilesProps.types
}

const defaultProps = {
  ...SectionTilesProps.defaults
}
const Notes = ({
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
            <Link to={{
                  pathname: "/DisplayPage",
                  state: { title: "Engineering Notes", dbName: "engineering_notes"}
              }}>
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style={styles.icon}
                      src={require("./../myImages/engineer_icon.png")}
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Engineering
                    </h4>
                  <p className="m-0 text-sm">
                    Engineering Notes
                  </p>
                </div>
              </div>
              </Link>
            </div>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom">
            <Link to={{
                  pathname: "/DisplayPage",
                  state: { title: "Pharmacy Notes", dbName: "pharmacy_notes"}
              }}>
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style={styles.icon}
                      src={require("./../myImages/pharmacy_icon.png")}
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Pharmacy
                    </h4>
                  <p className="m-0 text-sm">
                    Pharmacy Notes
                  </p>
                </div>
              </div>
              </Link>
            </div>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom" data-reveal-delay="400">
            <Link to={{
                  pathname: "/DisplayPage",
                  state: { title: "BBA Notes", dbName: "bba_notes"}
              }}>
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style={styles.icon}
                      src={require("./../myImages/bba_icon.png")}
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    BBA
                    </h4>
                  <p className="m-0 text-sm">
                    BBA Notes
                  </p>
                </div>
              </div>
              </Link>
            </div>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom">
            <Link to={{
                  pathname: "/DisplayPage",
                  state: { title: "Law Notes", dbName: "law_notes"}
              }}>
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style={styles.icon}
                      src={require("./../myImages/law_icon.png")}
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Law
                    </h4>
                  <p className="m-0 text-sm">
                    Law Notes
                  </p>
                </div>
              </div>
              </Link>
            </div>

            <div style={styles.myborder} className="tiles-item reveal-from-bottom">
            <Link to={{
                  pathname: "/DisplayPage",
                  state: { title: "Other Courses Notes", dbName: "other_notes"}
              }}>
              <div className="tiles-item-inner">
                <div className="features-tiles-item-header">
                  <div className="features-tiles-item-image mb-16">
                    <Image
                      style={styles.icon}
                      src={require("./../myImages/other_icon.png")}
                      width={64}
                      height={64} />
                  </div>
                </div>
                <div className="features-tiles-item-content">
                  <h4 className="mt-0 mb-8">
                    Other Courses
                    </h4>
                  <p className="m-0 text-sm">
                    Notes for other courses
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

Notes.propTypes = propTypes;
Notes.defaultProps = defaultProps;

export default Notes;
