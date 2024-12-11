import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h1>About Us</h1>
      <div className="about-us-content">
        <img
          src="https://fleetcouriers.com/wp-content/uploads/2020/09/AdobeStock_218614680-scaled.jpeg"
          alt="Company placeholder"
          className="about-us-image"
        />
        <p>
          We are a global logistics company dedicated to providing exceptional service to our
          customers. Our mission is to deliver your shipments on time and with care. We offer a
          wide range of services to meet your shipping needs, including express shipping, air
          freight, and ocean freight.
        </p>
      </div>
      <p>
        Our team of experts is here to help you with all your logistics needs. Whether you are
        shipping a small package or a large container, we have the expertise to get your shipment
        to its destination safely and on time.
      </p>
      <div className="about-us-content">
        <img
          src="https://content.jdmagicbox.com/comp/indore/j9/0731px731.x731.130709173449.y6j9/catalogue/shanu-courier-services-sneh-nagar-indore-domestic-courier-services-49lpujjf1t-250.jpg"
          alt="Team placeholder"
          className="about-us-image"
        />
        <p>
          At Shanu Services, we are committed to providing the best possible service to our
          customers. We are always looking for ways to improve and enhance our services to better
          meet your needs. Contact us today to learn more about how we can help you with your
          shipping needs.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
