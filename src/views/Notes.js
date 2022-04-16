import React, {useState} from 'react';
import firebase from './Firebase';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';

const propTypes = {
  ...SectionProps.types
}

const defaultProps = {
  ...SectionProps.defaults
}

const Notes = (
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

  const innerClasses = classNames(
    'section center-content',
    topDivider && 'has-top-divider',
    bottomDivider && 'has-bottom-divider'
  );

  const [allDocs,setAllDocs] = useState([]);
  const db = firebase.firestore();

  function fetchAll(e){
    e.preventDefault();
    db.collection("Contacts")
    .get()
    .then((snapshot)=>{
      if(snapshot.docs.length>0){
        snapshot.docs.forEach((doc)=>{
          setAllDocs((prev)=>{
            return[...prev,doc.data()];
          });
        });
      }
    });

    console.log(allDocs);

  }

  return (
    <>

    <section
      {...props}
      className={outerClasses}
    >

      <h1>Notes Page</h1>
      <button onClick={fetchAll}></button>

      <div className={innerClasses}>
      <table text-align="center">
      <tr>
        <th>Name</th>
        <th>Download</th>
      </tr>
      {allDocs.map(function(a) {
       return (
          <tr>
            <td>{a.name}</td>
            <td>{a.phone}</td>
          </tr>
       );
      })}
      </table>
      </div>
      </section>
    </>
  );
}

Notes.propTypes = propTypes;
Notes.defaultProps = defaultProps;

export default Notes;
