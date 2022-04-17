import React, { useEffect, useState } from "react";
import firebase from './Firebase';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';
import Image from '../components/elements/Image';
import { Link } from 'react-router-dom';

// <td onClick={download(a.url)}>


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
    borderRight: '1px groove white',
    marginTop: '20px',
  },
  th:{
    textAlign:'center'
  }
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
    'features-tiles-inner section-inner pt-0',
    topDivider && 'has-top-divider',
    bottomDivider && 'has-bottom-divider'
  );

  const [allDocs,setAllDocs] = useState([]);
  const db = firebase.firestore();

  function fetchAll(){
      //e.preventDefault();
      db.collection("engineering_notes")
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
      //console.log(allDocs);
    }

  return (

    useEffect(() => {
      let ignore = false;
      if (!ignore)  fetchAll()
      return () => { ignore = true; }
    },[]),

    <section
      {...props}
      className={outerClasses}>

      <h1>Notes Page</h1>

          <div className="innerClasses">
              <table style={styles.table}>
                  <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Download</th>
                  </tr>

              {allDocs.map(function(a) {
               return (
                  <tr>
                    <td>{a.name}</td>
                    <Link to= {{ pathname: a.url }} target="_blank">
                      <Image
                        src={require('../assets/images/download-icon.png')}
                        alt="icon1"
                        width={35}
                        height={35}/>
                      </Link>
                  </tr>
               );
              })}
              </table>
          </div>

      </section>

  );
}

Notes.propTypes = propTypes;
Notes.defaultProps = defaultProps;

export default Notes;
