import React, { useEffect, useState } from "react";
import firebase from './Firebase';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';
import { Link , useLocation} from 'react-router-dom';

const propTypes = {
  ...SectionProps.types
}

const defaultProps = {
  ...SectionProps.defaults
}

const styles = {
  para: {
    textAlign:'left',
    paddingLeft:'25%',
  },
  ul:{
    listStyleType: 'none'
  },
  input: {
    width: '75%'
  }
}

const SubmissionProcess = (
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

    const db = firebase.firestore();
    const location = useLocation();
    const title = location.state.title;
    const dbName = location.state.dbName;

    const [resourceName, setResourceName] = useState("");
    const [resourceUrl, setResourceUrl] = useState("");

    const handleSubmit = (e) => {

      e.preventDefault();
      db.collection(dbName).add({
        name: resourceName,
        url: resourceUrl,
      });

      setResourceName("");
      setResourceUrl("");

    };

  return (
    <section
      {...props}
      className={outerClasses}>

      <h3>Instructions for {title}</h3>
            <div className="innerClasses">
                <ul style={styles.ul}>
                  <li style={styles.para} class="para-small ta-l text-color-secondary"><u>Please read all the instructions carefully.</u></li>

                  <li style={styles.para} class="para-small ta-l"><u>1. For Notes:</u></li>
                  <li style={styles.para} class="para-small ta-l">&nbsp;&nbsp;&nbsp; Use the full name of the subject while filling the form with short-form of the subject in brackets if necessary.</li>
                  <li style={styles.para} class="para-small ta-l">&nbsp;&nbsp;&nbsp;Eg: Compiler Construction (CC)</li>
                  <li style={styles.para} class="para-small ta-l"><u>2. For Previous Question Papers:</u></li>
                  <li style={styles.para} class="para-small ta-l">&nbsp;&nbsp;&nbsp; Use the full name of the question paper while filling the form with the month and year.</li>
                  <li style={styles.para} class="para-small ta-l">&nbsp;&nbsp;&nbsp;Eg: Data Analysis And Algorithms May 2019</li>
                  <li style={styles.para} class="para-small ta-l"><b>&nbsp;&nbsp;&nbsp;&nbsp;Please note that the question papers before the year of 2019 will not be considered.</b></li>
                  <li style={styles.para} class="para-small ta-l"><b>&nbsp;&nbsp;&nbsp;&nbsp;All papers should be between the years 2019-Current.</b></li>
                  <li style={styles.para} class="para-small ta-l"><u>3. For Lab Manuals:</u></li>
                  <li style={styles.para} class="para-small ta-l">&nbsp;&nbsp;&nbsp; Use the full name of the Lab Manual/Material while filling the form.</li>


                  <li style={styles.para} class="para-small ta-l text-color-secondary"><u>How to submit?</u></li>
                  <li style={styles.para} class="para-small ta-l"><b>You are supposed to put all your file/files in a Google Drive Folder and paste it's link in the "Enter URL" input box in the form.</b></li>
                  <li style={styles.para} class="para-small ta-l"><b>Please make sure the link you are pasting is shareable with everyone and you have turned Link sharing on</b></li>
                  <li style={styles.para} class="para-small ta-l text-color-secondary"><a href="https://www.youtube.com/watch?v=7Gwf4vD6yog"><u>How to make google drive links shareable with everyone</u></a></li>

                  <br/><br/>
                  <div className="App__form">
                      <input
                        type="text"
                        placeholder="Full Name of the resource (Notes/Papers/Manuals)"
                        value={resourceName}
                        onChange={(e) => setResourceName(e.target.value)}
                      />
                      <br/><br/>
                      <input
                        type="text"
                        placeholder="Enter URL of the resource"
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                      />
                      <button onClick={handleSubmit}>Submit</button>
                </div>



                </ul>
          </div>
      </section>
  );
}

SubmissionProcess.propTypes = propTypes;
SubmissionProcess.defaultProps = defaultProps;

export default SubmissionProcess;
