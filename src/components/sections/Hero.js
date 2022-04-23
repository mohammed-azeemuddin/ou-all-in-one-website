import React, { useState } from 'react';
import classNames from 'classnames';
import { SectionProps } from '../../utils/SectionProps';
import ButtonGroup from '../elements/ButtonGroup';
import Button from '../elements/Button';
import Image from '../elements/Image';
import Modal from '../elements/Modal';
import './ModifiedStyles.css';
import { Carousel } from 'react-carousel-minimal';
import { Link } from 'react-router-dom';

const styles = {
  playstoreIcon:{
    fontSize: '24px',
  }
}

const propTypes = {
  ...SectionProps.types
}

const defaultProps = {
  ...SectionProps.defaults
}

const Hero = ({
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

  const data = [
    {
      image: require("./../../assets/images/1.png"),
      caption: ""
    },
    {
      image: require("./../../assets/images/2.png"),
      caption: ""
    },
    {
      image: require("./../../assets/images/3.png"),
      caption: ""
    },
    {
      image: require("./../../assets/images/4.png"),
      caption: ""
    }
  ];

  const captionStyle = {
    fontSize: '2em',
    fontWeight: 'bold',
  }
  const slideNumberStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
  }

  return (
    <section
      {...props}
      className={outerClasses}
    >
      <div className="container-sm">
        <div className={innerClasses}>
          <div className="hero-content">
            <h1 className="mt-0 mb-16 reveal-from-bottom" data-reveal-delay="200">
              OU ALL IN <span className="text-color-primary">ONE</span>
            </h1>
            <div className="container-xs">
              <p className="m-0 mb-32 reveal-from-bottom" data-reveal-delay="400">
                  An all in one website for OU Students that consists of Previous Question Papers, Notes, Lab manuals and Placement updates.
              </p>
              <div className="reveal-from-bottom" data-reveal-delay="600">
                <ButtonGroup>
                  <Button tag="a" color="primary" wideMobile href="https://play.google.com/store/apps/details?id=com.azeem.ou_app2&hl=en_US&gl=US">
                    <i class="fab fa-google-play" style={styles.playstoreIcon}></i>&nbsp;&nbsp;Download App
                    </Button>
                    <Button tag="a" color="primary" wideMobile href="https://t.me/ouallinone">
                      <i class="fab fa-telegram" aria-hidden="true" style={styles.playstoreIcon}></i>&nbsp;&nbsp; TG channel (for job updates)
                    </Button>
                    <Button tag="a" color="primary" wideMobile href="https://instagram.com/ouallinone">
                      <i class="fab fa-instagram" aria-hidden="true" style={styles.playstoreIcon}></i>&nbsp;&nbsp; Follow us on Instagram
                    </Button>
                </ButtonGroup>
              </div>
            </div>

            <div>
                <div style={{ textAlign: "center" }}>
               <h2>Contests</h2>
               <p><b>SHAREITZA</b> is a contest organized by the admin of OU All In One and aims at gathering resources for everyone in a fun way!</p>
               <p class="text-color-secondary"><b> 3 lucky winners will be selected from the comments of <a href="https://www.instagram.com/p/CcsIawbv9xO/?igshid=YmMyMTA2M2Y="><u>this</u></a> Instagram post.</b></p>

               <div style={{
                 padding: "0 20px"
               }}>
                 <Carousel
                   data={data}
                   time={5000}
                   width="100%"
                   height="500px"
                   captionStyle={captionStyle}
                   radius="10px"
                   slideNumber={true}
                   slideNumberStyle={slideNumberStyle}
                   captionPosition="bottom"
                   automatic={true}
                   dots={true}
                   pauseIconColor="white"
                   pauseIconSize="40px"
                   slideBackgroundColor="#"
                   slideImageFit="contain"
                   thumbnails={false}
                   thumbnailWidth="100px"
                   style={{
                     textAlign: "center",
                     maxWidth: "1000px",
                     maxHeight: "500px",
                     margin: "20px auto",
                   }}
                 />
               </div>
               <ButtonGroup>
                  <Link to="/Submissions">
                      <Button tag="a" color="primary"ideMobile>
                          Participate in SHAREITZA!
                      </Button>
                  </Link>
               </ButtonGroup>
            </div>


          </div>
        </div>


        </div>
      </div>
    </section>
  );
}

Hero.propTypes = propTypes;
Hero.defaultProps = defaultProps;

export default Hero;
