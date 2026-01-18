import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [focused, setFocused] = useState(null);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(formData.username, formData.password);
        if (success) {
            navigate('/dashboard');
        } else {
            alert('Login Failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* Animated Background Elements */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="login-card">
                <div className="login-card-inner">
                    <div className="login-header">
                        <div className="logo-circle">
                            <span>CIMS</span>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Enter your credentials to continue</p>
                    </div>

                    <form onSubmit={onSubmit}>
                        <div className={`form-group input-group ${focused === 'user' ? 'focused' : ''}`}>
                            <label>Username</label>
                            <div className="input-with-icon">
                                <i className="icon-user">👤</i>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={onChange}
                                    onFocus={() => setFocused('user')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="admin"
                                    required
                                />
                            </div>
                        </div>

                        <div className={`form-group input-group ${focused === 'pass' ? 'focused' : ''}`}>
                            <label>Password</label>
                            <div className="input-with-icon">
                                <i className="icon-lock">🔒</i>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={onChange}
                                    onFocus={() => setFocused('pass')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? (
                                <span className="btn-login-content">
                                    <span className="spinner"></span>
                                    Authenticating...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="forgot-password">
                        <a href="#">Forgot your password?</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;