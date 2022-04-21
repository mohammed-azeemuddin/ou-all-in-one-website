import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

const FooterNav = ({
  className,
  ...props
}) => {

  const classes = classNames(
    'footer-nav',
    className
  );

  return (
    <nav
      {...props}
      className={classes}
    >
      <ul className="list-reset">
        <li>
          <Link to="/Privacy Policy">Privacy Policy</Link>
        </li>
        <li>
          <Link to="/ContactUs">ContactUs</Link>
        </li>
      </ul>
    </nav>
  );
}

export default FooterNav;
