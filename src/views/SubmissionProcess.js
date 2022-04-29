import React, { useEffect, useState } from "react";
import firebase from './Firebase';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';
import { Link , useLocation} from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore";
import isURL from 'validator/lib/isURL';
import Checkbox from '../components/elements/Checkbox';
import { useHistory } from "react-router-dom";


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
  },
  table:{
    width: '75%',
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px groove white',
    marginTop: '20px'
  },
  th:{
    textAlign:'center'
  },
  fi: {
    width:'70%'
  },
  myborder:{
    border: '1px solid white',
  },
  submit : {
    borderRadius: '10px 10px 10px 10px',
    width: '20%'
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

    const [searchName,setSearchName] = useState("");
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [notes, setNotes] = useState([]);

    const [html, setHtml] = useState(null);
    const [err, setErr] = useState('');

    let history = useHistory();

   // const validate = (e) => {
   //    if (!isURL(resourceUrl)) {
   //       setErr('Invalid URL, please check again!');
   //    } else {
   //      setErr('Valid URL');
   //    }
   // };

    useEffect(() => {
      const fetchData = async () => {
        const data =
         await db.collection(dbName)
                 .orderBy("name")
                 .get();
        setNotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      };
      fetchData();
    }, []);


    const handleSubmit = (e) => {
      e.preventDefault();
      db.collection(dbName).add({
        name: resourceName,
        url: resourceUrl,
      });
      setResourceName("");
      setResourceUrl("");

      history.push("/SubmissionDone")
    };

    const renderHtml = (e) => {
      e.preventDefault();
      return(
        <div>
        { Object.keys(filteredNotes).length === 0 ? (
            <h6><i> Yay! No similar submissions found. Go ahead </i></h6>
        ) : (
            <ul style={styles.ul}>
              <li class="para-small text-color-secondary">There are some similar resources that have already been submitted!</li>
                  {filteredNotes.map(function(note) {
                   return (
                        <li>{note.name}</li>
                   );
                  })}
              <li class="para-small text-color-secondary"> If your believe your submission is different from all of these, please ignore this message and continue.</li>
            </ul>
        )}
        </div>
      );
    }

    useEffect(() => {
      setFilteredNotes(
        notes.filter(
          (note) =>
            note.name.toLowerCase().includes(searchName.toLowerCase()))
      );
      console.log(filteredNotes);
    }, [searchName, notes]);

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
                  <li style={styles.para} class="para-small ta-l text-color-secondary"><a href="https://www.youtube.com/watch?v=7Gwf4vD6yog"><u>How to make google drive links shareable with everyone (Watch)</u></a></li>
                  </ul>
                  <br/>

                  <div style={styles.myborder}>

                      <h6>Please enter the full name of the subject/resource down below.</h6>
                      <h6><i>This is to check if there are any previous similar submissions and avoid duplicacy.</i></h6>

                      <form onSubmit={(e) => setHtml(renderHtml(e))}>
                          <input
                            style={styles.fi}
                            required
                            type="text"
                            placeholder="Full Name of the resource (Notes/Papers/Manuals)"
                            value={resourceName}
                            onChange={function(e){setResourceName(e.target.value); setSearchName(e.target.value) }}
                            />
                            <button type="submit">Check</button>
                          </form>
                      {html}

                      <div className="App__form">
                        <form onSubmit={handleSubmit}>
                            <input
                              style={styles.fi}
                              required
                              type="text"
                              placeholder="Full Name of the resource (Notes/Papers/Manuals)"
                              value={resourceName}
                              onChange={function(e) {setResourceName(e.target.value); setSearchName(e.target.value) }}
                            />
                            <br/>
                            <input
                              style={styles.fi}
                              required
                              type="text"
                              placeholder="Enter URL of the resource"
                              value={resourceUrl}
                              onChange={function(e) { setResourceUrl(e.target.value); }}
                            />
                            <br/>
                            <Checkbox required/>I have made the Google Drive Link setting as "Anyone with the link can view"
                            <br/><br/>
                            <button style={styles.submit} type="submit">Submit</button>
                          <br/>
                        </form>
                      </div>

                  </div>
          </div>
      </section>
  );
}

SubmissionProcess.propTypes = propTypes;
SubmissionProcess.defaultProps = defaultProps;

export default SubmissionProcess;
