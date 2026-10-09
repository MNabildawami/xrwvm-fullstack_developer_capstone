
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Dealers.css';
import '../assets/style.css';

import positive_icon from '../assets/positive.png';
import neutral_icon from '../assets/neutral.png';
import negative_icon from '../assets/negative.png';
import review_icon from '../assets/reviewbutton.png';

import Header from '../Header/Header';

const Dealer = () => {
  const { id } = useParams();

  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreviewed, setUnreviewed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const getDealerData = async () => {
      try {
        setLoading(true);
        setError('');

        const [dealerResponse, reviewsResponse] = await Promise.all([
          fetch(`/djangoapp/dealer/${id}`, {
            signal: controller.signal,
          }),
          fetch(`/djangoapp/reviews/dealer/${id}`, {
            signal: controller.signal,
          }),
        ]);

        if (!dealerResponse.ok || !reviewsResponse.ok) {
          throw new Error('Gagal mengambil data dealer atau review.');
        }

        const dealerData = await dealerResponse.json();
        const reviewsData = await reviewsResponse.json();

        if (dealerData.status !== 200 || !dealerData.dealer?.length) {
          throw new Error('Data dealer tidak ditemukan.');
        }

        setDealer(dealerData.dealer[0]);

        const dealerReviews = Array.isArray(reviewsData.reviews)
          ? reviewsData.reviews
          : [];

        setReviews(dealerReviews);
        setUnreviewed(dealerReviews.length === 0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Dealer page error:', err);
          setError(err.message || 'Terjadi kesalahan.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    getDealerData();

    return () => controller.abort();
  }, [id]);

  const senti_icon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return positive_icon;
      case 'negative':
        return negative_icon;
      default:
        return neutral_icon;
    }
  };

  const isLoggedIn = Boolean(sessionStorage.getItem('username'));

  return (
    <div style={{ margin: '20px' }}>
      <Header />

      <div style={{ marginTop: '10px' }}>
        <h1 style={{ color: 'grey' }}>
          {dealer.full_name || 'Dealer Details'}

          {isLoggedIn && (
            <Link to={`/postreview/${id}`} aria-label="Post a review">
              <img
                src={review_icon}
                style={{
                  width: '10%',
                  marginLeft: '10px',
                  marginTop: '10px',
                }}
                alt="Post Review"
              />
            </Link>
          )}
        </h1>

        {dealer.full_name && (
          <h4 style={{ color: 'grey' }}>
            {dealer.city}, {dealer.address}, Zip - {dealer.zip},{' '}
            {dealer.state}
          </h4>
        )}
      </div>

      <div className="reviews_panel">
        {loading ? (
          <p>Loading reviews...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : unreviewed ? (
          <p>No reviews yet!</p>
        ) : (
          reviews.map((review) => (
            <div
              className="review_panel"
              key={review._id || review.id}
            >
              <img
                src={senti_icon(review.sentiment)}
                className="emotion_icon"
                alt={`${review.sentiment || 'neutral'} sentiment`}
              />

              <div className="review">{review.review}</div>

              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model}{' '}
                {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
