import React, { useEffect, useState } from "react";
import firebase from './Firebase';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
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
    //console.log(allDocs);
  }

  function download(url){
    const storage = getStorage();
    getDownloadURL(ref(storage, 'images/stars.jpg'))
      .then((url) => {
        // `url` is the download URL for 'images/stars.jpg'

        // This can be downloaded directly:
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          const blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();

        // Or inserted into an <img> element
        const img = document.getElementById('myimg');
        img.setAttribute('src', url);
      })
      .catch((error) => {
        // Handle any errors
      });
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
                    <Link to={a.url}>
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
