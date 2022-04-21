import React, { useState } from 'react';
import classNames from 'classnames';
import { SectionProps } from '../../utils/SectionProps';
import ButtonGroup from '../elements/ButtonGroup';
import Button from '../elements/Button';
import Image from '../elements/Image';
import Modal from '../elements/Modal';
import './ModifiedStyles.css';
import { Carousel } from 'react-carousel-minimal';

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
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/1200px-GoldenGateBridge-001.jpg",
      caption: "San Francisco"
    },
    {
      image: "https://cdn.britannica.com/s:800x450,c:crop/35/204435-138-2F2B745A/Time-lapse-hyper-lapse-Isle-Skye-Scotland.jpg",
      caption: "Scotland"
    },
    {
      image: "https://static2.tripoto.com/media/filter/tst/img/735873/TripDocument/1537686560_1537686557954.jpg",
      caption: "Darjeeling"
    },
    {
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Palace_of_Fine_Arts_%2816794p%29.jpg/1200px-Palace_of_Fine_Arts_%2816794p%29.jpg",
      caption: "San Francisco"
    },
    {
      image: "https://i.natgeofe.com/n/f7732389-a045-402c-bf39-cb4eda39e786/scotland_travel_4x3.jpg",
      caption: "Scotland"
    },
    {
      image: "https://www.tusktravel.com/blog/wp-content/uploads/2020/07/Best-Time-to-Visit-Darjeeling-for-Honeymoon.jpg",
      caption: "Darjeeling"
    },
    {
      image: "https://www.omm.com/~/media/images/site/locations/san_francisco_780x520px.ashx",
      caption: "San Francisco"
    },
    {
      image: "https://images.ctfassets.net/bth3mlrehms2/6Ypj2Qd3m3jQk6ygmpsNAM/61d2f8cb9f939beed918971b9bc59bcd/Scotland.jpg?w=750&h=422&fl=progressive&q=50&fm=jpg",
      caption: "Scotland"
    },
    {
      image: "https://www.oyorooms.com/travel-guide/wp-content/uploads/2019/02/summer-7.jpg",
      caption: "Darjeeling"
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
                  An all in one website for OU Students that consists of Previous Question Papers, Notes, Lab manuals and Placements.
              </p>
              <div className="reveal-from-bottom" data-reveal-delay="600">
                <ButtonGroup>
                  <Button tag="a" color="primary" wideMobile href="https://play.google.com/store/apps/details?id=com.azeem.ou_app2&hl=en_US&gl=US">
                    <i class="fab fa-google-play" style={styles.playstoreIcon}></i>&nbsp;&nbsp;Download App
                    </Button>

                    <Button tag="a" color="primary" wideMobile href="htts://t.me/ouallinone">
                      <i class="fab fa-telegram" aria-hidden="true" style={styles.playstoreIcon}></i>&nbsp;&nbsp; Join TG channel (for job updates)
                    </Button>

                </ButtonGroup>
              </div>
            </div>
          </div>
        </div>

        <div>
            <div style={{ textAlign: "center" }}>
           <h2>React Carousel Minimal</h2>
           <p>Easy to use, responsive and customizable carousel component for React Projects.</p>
           <div style={{
             padding: "0 20px"
           }}>
             <Carousel
               data={data}
               time={2000}
               width="850px"
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
               slideBackgroundColor="darkgrey"
               slideImageFit="cover"
               thumbnails={false}
               thumbnailWidth="100px"
               style={{
                 textAlign: "center",
                 maxWidth: "850px",
                 maxHeight: "500px",
                 margin: "40px auto",
               }}
             />
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
