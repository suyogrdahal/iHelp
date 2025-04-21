import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/LandingPage.css';  

const ViewHelp = () => {
    const [helpPosts, setHelpPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const limit = 6; // posts per page
    const userEmail = localStorage.getItem('user_email');
    const [showModal, setShowModal] = useState(false);
    const [selectedHelpId, setSelectedHelpId] = useState(null);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const isLoggedIn = !!localStorage.getItem('token');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const getAPI = isLoggedIn ? "/help/getwithauth" : "/help/get";
    const [showHelpStatus, setShowHelpStatus] = useState(false);
    const [offerStatus, setOfferStatus] = useState([]);
    const [showHelpStatusLoading, setShowHelpStatusLoading] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editHeading, setEditHeading] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editingFlag, setEditingFlag] = useState(false);
    const [showOffersModal, setShowOffersModal] = useState(false);
    const [offerList, setOfferList] = useState([]);
    const [helperInfo, setHelperInfo] = useState(null);
    const [showHelperModal, setShowHelperModal] = useState(false);

    const fetchHelpPosts = async () => {
        setLoading(true);
        setError('');
        try {
            const skip = (currentPage - 1) * limit;
            const res = await fetch(`${API_BASE_URL}${getAPI}?skip=${skip}&limit=${limit + 1}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: isLoggedIn ? `Bearer ${localStorage.getItem('token')}` : undefined
                    }
                }
            );

            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user_email'); // Remove the email from local storage
                window.location.href = '/login'; // Redirect to login page
            }
            if (!res.ok) throw new Error('Failed to fetch help posts');
            const data = await res.json();

            setHasMore(data.length > limit);
            setHelpPosts(data.slice(0, limit));
        } catch (err) {
            setError(err.message);
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    const handleViewHelper = async (helpId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/help/helper-info/${helpId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch helper info');

            const data = await res.json();
            setHelperInfo(data);
            setShowHelperModal(true);
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };


    const handleAcceptOffer = async (offerId) => {
        const confirm = window.confirm(
            "Are you sure you want to accept this help offer?\n\n" +
            "Once accepted, all other help offers for this post will be rejected."
        );

        if (!confirm) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/help/offer/accept/${offerId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to accept help offer');

            setMessage('Help offer accepted successfully!');
            setShowOffersModal(false);
            fetchHelpPosts(); 
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    const handleSeeOffer = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/help/offers/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch help offers');

            const data = await res.json();
            setOfferList(data);
            setShowOffersModal(true);
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    const checkStatus = async (help_id) => {
        setShowHelpStatus(true);
        setShowHelpStatusLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/help/offer/status/${help_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user_email'); // Remove the email from local storage
                window.location.href = '/login'; // Redirect to login page
            }
            if (!res.ok) throw new Error('Failed to fetch status');
            const data = await res.json();
            setOfferStatus(data);
            setShowHelpStatusLoading(false);

        } catch (err) {
            setError(err.message);
        } finally {
            setShowHelpStatusLoading(false);
        }
    };

    const handleEditClick = (post) => {
        setEditingPost(post);
        setEditHeading(post.heading);
        setEditContent(post.content);
    };

    const submitEdit = async () => {
        setEditingFlag(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/help/edit/${editingPost._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ heading: editHeading, content: editContent })
            });

            if (!res.ok) throw new Error('Failed to edit help post');

            setMessage('Help post updated successfully!');
            setEditingPost(null);
            // Refresh list
            setHelpPosts(prev =>
                prev.map(p => p._id === editingPost._id ? { ...p, heading: editHeading, content: editContent } : p)
            );
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
        finally {
            setEditingFlag(false);
        }
    };

    useEffect(() => {
        fetchHelpPosts();
    }, [currentPage]);

    const handleNextPage = () => setCurrentPage((prev) => prev + 1);
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));


    const handleOfferClick = (helpId) => {
        setSelectedHelpId(helpId);
        setShowModal(true);
    };

    const handleLogin = () => {
        window.location.href = '/login';
    };

    const handleDeletePost = async (helpId) => {
        if (!window.confirm("Are you sure you want to delete this help post?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/help/delete/${helpId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete help post');

            setHelpPosts(prev => prev.filter(post => post._id !== helpId));
            setMessage('Help post deleted successfully.');
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };


    const submitHelpOffer = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/help/offer/${selectedHelpId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ comment })
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user_email'); 
                window.location.href = '/login';
                // Redirect to login page
            }
            if (!res.ok) throw new Error('Failed to send help offer');
            setMessage('Help offer sent successfully!');
            fetchHelpPosts(); 
        } catch (err) {

            setMessage('Failed to send help offer.');
        } finally {
            setShowModal(false);
            setComment('');
        }
    };


    const renderActionButton = (post) => {
        const isAuthor = post.author === userEmail;
        const canAct = post.statuscode === "100" || post.statuscode === "200";
        const showHelperInfo = post.statuscode === "300" && isAuthor;


        if (showHelperInfo) {
            return <button className="button button-help" onClick={() => handleViewHelper(post._id)}>Show Helper Info</button>
        }
        if (!canAct) return null;

        if (isAuthor) {
            return (
                <div className="help-actions">
                    <button className="button button-yellow" onClick={() => handleEditClick(post)}>Edit</button>
                    <button className="button button-red" onClick={() => handleDeletePost(post._id)}>Delete</button>
                    <button className="button button-help" onClick={() => handleSeeOffer(post._id)}>See Help Offers</button>
                </div>
            );
        } else if (isLoggedIn) {
            if (post.help_offered_by_me) {
                return <button className="button button-help" onClick={() => checkStatus(post._id)}>Check Help Status</button>;
            }
            return <button className="button button-help" onClick={() => handleOfferClick(post._id)}>Offer Help</button>;
        }
        else {
            return <button className="button button-help" onClick={() => handleLogin()}>Log In To Offer Help</button>
        }
    };

    return (
        <div className="landing-container">
            <Navbar loggedIn={!!localStorage.getItem('token')} />

            <div className="content">
                <h2 className="headline">Available Help Requests</h2>
                {loading ? (
                    <p>Loading help requests...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : helpPosts.length === 0 ? (
                    <p>No help requests found.</p>
                ) : (
                    <>
                        <div className="card-grid">
                            {helpPosts.map((post) => (
                                <div key={post._id} className="help-card row-layout">
                                    <div className="help-main">
                                        <h3 className="help-title">{post.heading}</h3>
                                        <p className="help-content">{post.content}</p>
                                        {renderActionButton(post)}
                                    </div>
                                    <div className="help-side">
                                        <p><strong>Status:</strong> {post.status}</p>
                                        <p><strong>Helped:</strong> {post.helped ? '✅ Yes' : '❌ No'}</p>
                                        <p className="post-meta">Posted by {post.author_name}<br />{new Date(post.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pagination-controls">
                            <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-button">Previous</button>
                            <span className='page-number'>Page {currentPage}</span>
                            <button onClick={handleNextPage} disabled={!hasMore} className="pagination-button">Next</button>
                        </div>
                    </>
                )}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Send Help Request</h3>
                            <p>Send a help request? Your information: Email and Phone, will be shared with the requester if they accept your help offer.
                                This is so they can contact you directly.
                            </p>
                            <textarea
                                rows="4"
                                placeholder="Add a short message (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{ width: '100%', marginTop: '1rem' }}
                            ></textarea>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button className="navbar-button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="navbar-button" onClick={submitHelpOffer}>Send</button>
                            </div>
                        </div>
                    </div>
                )}
                {showHelpStatus && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Your Help Status</h3>
                            {showHelpStatusLoading ? (
                                <p>Loading status...</p>
                            ) : error ? (
                                <p className="error-message">{error}</p>
                            ) :
                                (
                                    <>
                                        Status: {offerStatus.status}<br />
                                        Help Offered Time: {new Date(offerStatus.timestamp).toLocaleString()}<br />
                                        {offerStatus.comment ? "Comment: " + offerStatus.comment : ""}<br />
                                    </>
                                )
                            }
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button className="navbar-button" onClick={() => setShowHelpStatus(false)}>Cancel</button>

                            </div>
                        </div>
                    </div>
                )}
                {editingPost && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Edit Help Post</h3>
                            <input
                                type="text"
                                value={editHeading}
                                onChange={(e) => setEditHeading(e.target.value)}
                                placeholder="Heading"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                disabled={editingFlag}
                            />
                            <textarea
                                rows="4"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Content"
                                style={{ width: '100%' }}
                                disabled={editingFlag}
                            ></textarea>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button className="navbar-button" onClick={() => setEditingPost(null)}>Cancel</button>
                                <button className="navbar-button" onClick={submitEdit}>{!editingFlag ? "Save Changes" : "Saving Changes"} </button>
                            </div>
                        </div>
                    </div>
                )}
                {showOffersModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Help Offers</h3>
                            {offerList.length === 0 ? (
                                <p>No help offers yet.</p>
                            ) : (
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '0.5rem', listStyleType: 'none' }}>
                                    {offerList.map((offer) => (
                                        <li key={offer._id} style={{ marginBottom: '0.75rem' }}>
                                            <strong>{offer.full_name}</strong> — <em>{offer.status}</em>
                                            {offer.status === 'pending' && (
                                                <button
                                                    className="button button-green"
                                                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}
                                                    onClick={() => handleAcceptOffer(offer._id)}
                                                >
                                                    Accept Offer
                                                </button>
                                            )} <br></br>
                                            <small>{new Date(offer.timestamp).toLocaleString()}</small><br />
                                            {offer.comment && <p>{offer.comment}</p>}

                                            <hr></hr>
                                        </li>

                                    ))}
                                </ul>
                            )}
                            <div style={{ marginTop: '1rem', textAlign: 'right' }}>

                                <button className="navbar-button" onClick={() => setShowOffersModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {showHelperModal && helperInfo && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Helper Information</h3>
                            <p><strong>Full Name:</strong> {helperInfo.first_name} {helperInfo.last_name}</p>
                            <p><strong>Email:</strong> {helperInfo.email}</p>
                            <p><strong>Phone:</strong> {helperInfo.phone_number}</p>
                            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                <button className="navbar-button" onClick={() => setShowHelperModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ViewHelp;
