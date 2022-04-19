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
const Labs = ({
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
                  state: { title: "Lab Manuals", dbName: "lab_manuals"}
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
                    Lab Manuals
                    </h4>
                  <p className="m-0 text-sm">
                    All lab manuals and materials from different branches.
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

Labs.propTypes = propTypes;
Labs.defaultProps = defaultProps;

export default Labs;
