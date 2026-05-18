import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../styles/Layout.module.css';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateNote = () => {
    router.push('/notes?modal=create');
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>📝 Notes</h2>
        </div>

        <nav className={styles.nav}>
          <button
            className={styles.createBtn}
            onClick={handleCreateNote}
          >
            + Create Note
          </button>

          <div className={styles.navSection}>
            <h3>Menu</h3>
            <a
              className={router.pathname === '/notes' ? styles.active : ''}
              onClick={() => router.push('/notes')}
              style={{ cursor: 'pointer' }}
            >
              All Notes
            </a>
          </div>
        </nav>

        <div className={styles.userSection}>
          <div 
            className={styles.userInfo}
            onClick={() => setShowProfileModal(true)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>

      {showProfileModal && (
        <div className={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.profileHeader}>
              <h2>User Details</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowProfileModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.profileContent}>
              <div className={styles.profileAvatar}>
                {user?.name?.[0]?.toUpperCase()}
              </div>

              <div className={styles.profileInfo}>
                <div className={styles.profileItem}>
                  <label>Name:</label>
                  <p>{user?.name}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>Email:</label>
                  <p>{user?.email}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>User ID:</label>
                  <p className={styles.userId}>{user?._id}</p>
                </div>

                <div className={styles.profileItem}>
                  <label>Member Since:</label>
                  <p>
                    {user?.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
