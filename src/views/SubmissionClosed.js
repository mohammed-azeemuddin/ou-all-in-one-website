import React, { useEffect, useState } from "react";
import firebase from './Firebase';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';
import { Link , useLocation } from 'react-router-dom';

const propTypes = {
  ...SectionProps.types
}

const defaultProps = {
  ...SectionProps.defaults
}

const styles = {
  table:{
    width: '75%',
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px groove white',
    marginTop: '20px'
  },
  th:{
    textAlign:'center'
  }
}

const SubmissionClosed = (
  className,
  topOuterDivider,
  bottomOuterDivider,
  topDivider,
  bottomDivider,
  hasBgColor,
  invertColor,
  ...props
) => {



  const outerClasses = classNames(
      'hero section center-content',
      topOuterDivider && 'has-top-divider',
      bottomOuterDivider && 'has-bottom-divider',
      hasBgColor && 'has-bg-color',
      invertColor && 'invert-color',
      className
    );


  return (
    <section
      {...props}
      className={outerClasses}>
            <div className="innerClasses">
                    The resources for this section have already been gathered, hence this section is now closed.
            </div>
      </section>
  );
}

SubmissionClosed.propTypes = propTypes;
SubmissionClosed.defaultProps = defaultProps;

export default SubmissionClosed;
