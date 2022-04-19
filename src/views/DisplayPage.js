import React, { useEffect, useState } from "react";
import firebase from './Firebase';
import classNames from 'classnames';
import { SectionProps } from '../utils/SectionProps';
import { Link , useLocation } from 'react-router-dom';
import "./DisplayPage.css";

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

const DisplayPage = (
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
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  const location = useLocation();
  const title = location.state.title;
  const dbName = location.state.dbName;


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

  useEffect(() => {
    setFilteredNotes(
      notes.filter(
        (note) =>
          note.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, notes]);


  return (
    <section
      {...props}
      className={outerClasses}>

      <h1>{title}</h1>
            <div className="innerClasses">

              <input type="text" name="search" placeholder="What are you looking for?"
                onChange={(e) => setSearch(e.target.value)}/>
              <button><i class="fa fa-search"></i></button>

              <div className="table-wrapper">
              <table style={styles.table} class="fl-table">
                  <thead>
                    <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Download&nbsp;&nbsp;&nbsp;</th>
                    </tr>
                  </thead>
              {filteredNotes.map(function(note) {
               return (
                 <tbody>
                  <tr>
                    <td>{note.name}</td>
                    <Link to= {{ pathname: note.url }} target="_blank">

                      <i class="fa fa-arrow-down popout"  aria-hidden="true"></i>

                    </Link>
                  </tr>
                  </tbody>
               );
              })}
              </table>
              </div>
          </div>

      </section>
  );
}

DisplayPage.propTypes = propTypes;
DisplayPage.defaultProps = defaultProps;

export default DisplayPage;
