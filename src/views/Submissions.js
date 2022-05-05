import React, { useEffect, useState } from "react";
import firebase from './Firebase';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';
import { Link } from 'react-router-dom';
import './Submissions.css';

const propTypes = {
  ...SectionProps.types
}

const defaultProps = {
  ...SectionProps.defaults
}

const styles = {
  list: {
    paddingLeft:'25%'
  }
}

const Submissions = (
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
      <h1> SHAREITZA! </h1>
      <h4>Choose a section for Submission</h4>
            <div className="innerClasses">
              <p class="text-color-secondary"> We are not accepting any Engineering Notes right now. We already have a huge list of them available for everyone.<br/>No Engineering notes will be considered.</p>
              <ol style={styles.list}>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Pharmacy Notes Submission", dbName: "pharmacy_notes"}}}>
                <li>Pharmacy Notes</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "B.B.A Notes Submission", dbName: "bba_notes"}}}>
                <li>B.B.A Notes</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Law Notes Submission", dbName: "law_notes"}}}>
                <li>Law Notes</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Other Stream Notes Submission", dbName: "other_notes"}}}>
                <li>Other Stream Notes (B.Sc,B.Com,etc...)</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Previous Engineering Question Papers Submission", dbName: "engineering_qp"}}}>
                <li>Previous Engineering Question Papers (2019-current)</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionClosed"
                  }}>
                <li>Previous Pharmacy Question Papers (2019-current)</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Previous B.B.A Question Papers Submission", dbName: "bba_qp"}}}>
                <li>Previous B.B.A Question Papers (2019-current)</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Previous Law Question Papers Submission", dbName: "law_qp"}}}>
                <li>Previous Law Question Papers (2019-current)</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Previous Other Stream Question Papers Submission", dbName: "other_qp"}}}>
                <li>Previous Other Stream Question Papers (2019-current) (B.Sc,B.Com,etc...)</li>
                </Link>

                <Link to={{
                    pathname: "/SubmissionProcess",
                    state: { title: "Lab Manuals Submission", dbName: "lab_manuals"}}}>
                <li>Lab Manuals Submission (any)</li>
                </Link>

              </ol>
          </div>
      </section>
  );
}

Submissions.propTypes = propTypes;
Submissions.defaultProps = defaultProps;

export default Submissions;
