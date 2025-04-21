import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/LandingPage.css';

const VerifyAccount = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Verifying your account...');
    const [status, setStatus] = useState('loading');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

    useEffect(() => {
        const email = searchParams.get('email');
        const token = searchParams.get('verification_token');

        if (!email || !token) {
            setStatus('error');
            setMessage('❌ Invalid or missing verification link.');
            return;
        }

        let didRun = false;


        const verify = async () => {
            if (didRun) return;
            didRun = true;
            try {
                const res = await fetch(`${API_BASE_URL}/user/verify?email=${email}&verification_token=${token}`);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Verification failed');
                }
                setStatus('success');
                setMessage('✅ Your account has been verified! You can now log in.');
            } catch (err) {
                setStatus('error');
                setMessage(`❌ ${err.message}`);
            }
        };

        if (email && token) {
            verify();
        } else {
            setStatus('error');
            setMessage('❌ Invalid or missing verification link.');
        }
    }, [searchParams]);

    return (
        <div className="landing-container">
            <div className="content">
                <h2 className="headline">Account Verification</h2>
                <p style={{ fontSize: '1.1rem', color: status === 'success' ? 'green' : 'red', marginTop: '1rem' }}>
                    {message}
                </p>
            </div>
        </div>
    );
};

export default VerifyAccount;
