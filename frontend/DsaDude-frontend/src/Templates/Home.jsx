
const Home = () => {
    return (
        <div className="page-inner animate-fadeInUp">
            <div className="card hover-lift" style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '2rem',
                padding: '3rem',
                background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
                border: '1px solid var(--border-primary)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, var(--text-accent) 0%, transparent 70%)',
                    opacity: 0.1,
                    borderRadius: '50%',
                    zIndex: 0
                }} />
                
                <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                    <h1 style={{
                        fontSize: '3rem',
                        margin: 0,
                        background: 'linear-gradient(135deg, var(--text-primary), var(--text-accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1.2
                    }}>
                        Welcome to DSADude
                    </h1>
                    <p className="text-secondary" style={{
                        marginTop: '1rem',
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        maxWidth: '500px'
                    }}>
                        Master data structures & algorithms with curated problems, 
                        instant feedback, and a LeetCode-inspired experience.
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="/problems" className="btn-primary" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none'
                        }}>
                            <span>Browse Problems</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                        <button className="btn-secondary" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>Learn More</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <path d="M12 17h.01"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div style={{
                    minWidth: '200px',
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        background: 'linear-gradient(135deg, var(--text-accent), #ff8c00)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-lg)',
                        animation: 'pulse 3s infinite'
                    }}>
                        💻
                    </div>
                </div>
            </div>
            
            {/* Feature cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginTop: '3rem'
            }}>
                {[
                    {
                        title: 'Curated Problems',
                        description: 'Hand-picked problems from easy to hard difficulty levels',
                        icon: '🎯'
                    },
                    {
                        title: 'Instant Feedback',
                        description: 'Get immediate results and detailed explanations',
                        icon: '⚡'
                    },
                    {
                        title: 'Multiple Languages',
                        description: 'Support for C++, Java, Python, and JavaScript',
                        icon: '🔧'
                    }
                ].map((feature, index) => (
                    <div key={index} className={`card hover-lift animate-fadeInUp stagger-${index + 1}`} style={{
                        padding: '2rem',
                        textAlign: 'center',
                        transition: 'all var(--transition-normal)',
                        cursor: 'pointer'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '1rem'
                        }}>
                            {feature.icon}
                        </div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)'
                        }}>
                            {feature.title}
                        </h3>
                        <p className="text-secondary" style={{
                            lineHeight: 1.6
                        }}>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home