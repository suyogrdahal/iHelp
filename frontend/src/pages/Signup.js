import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import '../styles/LandingPage.css';

const Signup = () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, []);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        program_level: '',
        program: '',
        address: '',
        phone_number: '',
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone_number') {
            // Remove non-digits
            const digits = value.replace(/\D/g, '');

            // Format as (XXX) XXX-XXXX
            let formatted = digits;
            if (digits.length > 3 && digits.length <= 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            } else if (digits.length > 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
            }

            setFormData({ ...formData, [name]: formatted });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!formData.email.endsWith('@mail.gvsu.edu')) {
            setMessage('Email must be a GVSU student email (@mail.gvsu.edu)');
            return;
        }

        const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;
        if (!phonePattern.test(formData.phone_number)) {
            setMessage('Phone number must be in the format (XXX) XXX-XXXX');
            return;
        }

        try {
            const res = await fetch(API_BASE_URL+'/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Signup failed');
            };

            setMessage('Signup successful! You can now log in. Check your email for verification.');
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                program_level: '',
                program: '',
                address: '',
                phone_number: '',
            });
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    return (
        <div className="landing-container">
            <Navbar loggedIn={false} />
            <div className="content">
                <h2 className="headline">Sign Up</h2>
                <form className="login-form" onSubmit={handleSignup}>
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
                    <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
                    <select
                        name="program_level"
                        value={formData.program_level}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Program Level</option>
                        <option value="undergrad">Undergraduate</option>
                        <option value="grad">Graduate</option>
                    </select>
                    <input name="program" placeholder="Program" value={formData.program} onChange={handleChange} required />
                    <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                    <input
                        name="phone_number"
                        placeholder="Phone Number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        style={{
                            border: /^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone_number) || formData.phone_number === ''
                                ? '1px solid #ccc'
                                : '1px solid red'
                        }}
                        title="Format: (123) 456-7890"
                    />

                    <button type="submit" className="navbar-button big">Sign Up</button>
                </form>
                {message && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
            </div>
        </div>
    );
};

export default Signup;
