import React, { useState } from 'react';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';
import '../components/sections/ModifiedStyles.css';
import Image from '../components/elements/Image';

const propTypes = {
  ...SectionProps.types
}

const defaultProps = {
  ...SectionProps.defaults
}

const SubmissionDone = ({
  className,
  topOuterDivider,
  bottomOuterDivider,
  topDivider,
  bottomDivider,
  hasBgColor,
  invertColor,
  ...props
}) => {

  const [videoModalActive, setVideomodalactive] = useState(false);

  const openModal = (e) => {
    e.preventDefault();
    setVideomodalactive(true);
  }

  const closeModal = (e) => {
    e.preventDefault();
    setVideomodalactive(false);
  }

  const outerClasses = classNames(
    'hero section center-content',
    topOuterDivider && 'has-top-divider',
    bottomOuterDivider && 'has-bottom-divider',
    hasBgColor && 'has-bg-color',
    invertColor && 'invert-color',
    className
  );

  const innerClasses = classNames(
    'hero-inner section-inner',
    topDivider && 'has-top-divider',
    bottomDivider && 'has-bottom-divider'
  );

  return (
    <section
      {...props}
      className={outerClasses}
    >
      <div className="container-sm">
        <div className={innerClasses}>
          <div className="hero-content">
          <h1>Thankyou for participating!</h1>
          <h4>Your submission is done!</h4>
          <h4>You can now go to <a href="https://www.instagram.com/p/CdLwFjyPObc/+"><u class="text-color-secondary">this</u></a> post and comment for getting a chance to be a winner!</h4>
          <Image
              src={require('../assets/images/applause.png')}
              alt="Open"
              width={400}
              height={400}
          />
      </div>
        </div>
      </div>
    </section>
  );
}

SubmissionDone.propTypes = propTypes;
SubmissionDone.defaultProps = defaultProps;

export default SubmissionDone;
