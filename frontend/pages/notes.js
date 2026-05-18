import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../components/Layout';
import styles from '../styles/Notes.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function NotesContent() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState({ show: false, noteId: null });
  const [shareEmail, setShareEmail] = useState('');
  const [viewOnce, setViewOnce] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedViewOnceNotes, setViewedViewOnceNotes] = useState(new Set());
  const [showViewOnceModal, setShowViewOnceModal] = useState({ show: false, note: null });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/notes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError('Unable to load notes');
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = async (query) => {
    if (!query.trim()) {
      fetchNotes();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/notes/search/${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError('Unable to search notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  useEffect(() => {
    if (router.query.modal === 'create') {
      setShowCreateModal(true);
    }
  }, [router.query]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create note');

      setNotes((prev) => [data, ...prev]);
      setTitle('');
      setContent('');
      setShowCreateModal(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Create failed');
    }
  };

  const startEditNote = (note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEditNote = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notes/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });
      const updated = await res.json();
      setNotes((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setEditingId(null);
    } catch (err) {
      setError('Unable to update note');
    }
  };

  const deleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      setError('Unable to delete note');
    }
  };

  const shareNote = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notes/${showShareModal.noteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ share_with_email: shareEmail, viewOnce }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to share note');
        return;
      }

      setNotes((prev) => prev.map((item) => (item._id === showShareModal.noteId ? data : item)));
      setShowShareModal({ show: false, noteId: null });
      setShareEmail('');
      setViewOnce(false);
    } catch (err) {
      setError('Unable to share note');
    }
  };

  // Check if current user owns the note
  const isNoteOwner = (note) => {
    return note.userId === user?._id;
  };

  // Check if note is shared as view-once with current user
  const isViewOnceNote = (note) => {
    return note.sharedWithViewOnce && note.sharedWithViewOnce.some(
      v => v.userId === user?._id
    );
  };

  // Check if view-once note has been viewed
  const isViewOnceViewed = (note) => {
    return note.sharedWithViewOnce && note.sharedWithViewOnce.some(
      v => v.userId === user?._id && v.viewed
    );
  };

  // Open a view-once note
  const openViewOnceNote = async (noteId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notes/${noteId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Show the note in a modal
        setShowViewOnceModal({ show: true, note: data });
        // Update the note in state to reflect viewing
        setNotes((prev) => prev.map((item) => (item._id === noteId ? data : item)));
        setViewedViewOnceNotes((prev) => new Set([...prev, noteId]));
      }
    } catch (err) {
      setError('Unable to open note');
    }
  };

  // Close view-once modal and remove the note from list
  const closeViewOnceModal = () => {
    const noteId = showViewOnceModal.note?._id;
    setShowViewOnceModal({ show: false, note: null });
    if (noteId) {
      // Remove the note from the list after viewing
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    }
  };

  return (
    <Layout>
      <div className={styles.notesContainer}>
        <div className={styles.header}>
          <h1>All Notes</h1>
          <p className={styles.subtitle}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchNotes(e.target.value);
            }}
            className={styles.searchInput}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>No notes yet</h3>
            <p>Create your first note to get started</p>
            <button
              className={styles.emptyButton}
              onClick={() => setShowCreateModal(true)}
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {notes.map((note) => (
              <div key={note._id} className={styles.noteCard}>
                {editingId === note._id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={styles.editTitle}
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.editContent}
                    />
                    <div className={styles.editActions}>
                      <button
                        className={styles.saveBtn}
                        onClick={saveEditNote}
                      >
                        Save
                      </button>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isViewOnceNote(note) && !isViewOnceViewed(note) && !viewedViewOnceNotes.has(note._id) ? (
                  <div className={styles.viewOncePrompt}>
                    <div className={styles.viewOnceLock}>🔒</div>
                    <h3>View Once Note</h3>
                    <p>This note can only be viewed once</p>
                    <button
                      className={styles.viewOnceBtn}
                      onClick={() => openViewOnceNote(note._id)}
                    >
                      View Note
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.noteHeader}>
                      <h3>{note.title}</h3>
                      <small>{new Date(note.created_at).toLocaleDateString()}</small>
                    </div>
                    <p className={styles.noteContent}>{note.content}</p>
                    <div className={styles.noteFooter}>
                      {!isNoteOwner(note) && !isViewOnceNote(note) && (
                        <span className={styles.sharedBadge}>
                          📤 Shared with you
                        </span>
                      )}
                      {isViewOnceNote(note) && isViewOnceViewed(note) && (
                        <span className={styles.viewOnceBadge}>
                          🔒 View Once (Viewed)
                        </span>
                      )}
                      {note.sharedWith && note.sharedWith.length > 0 && isNoteOwner(note) && (
                        <span className={styles.sharedBadge}>
                          Shared with {note.sharedWith.length}
                        </span>
                      )}
                    </div>
                    <div className={styles.noteActions}>
                      {isNoteOwner(note) && (
                        <>
                          <button
                            className={styles.editBtn}
                            onClick={() => startEditNote(note)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.shareBtn}
                            onClick={() => setShowShareModal({ show: true, noteId: note._id })}
                          >
                            Share
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => deleteNote(note._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Note</h2>
            <form onSubmit={handleCreateNote}>
              <input
                type="text"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={styles.input}
              />
              <textarea
                placeholder="Note content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.textarea}
              />
              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitBtn}>
                  Create Note
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShareModal.show && (
        <div className={styles.modal} onClick={() => setShowShareModal({ show: false, noteId: null })}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Share Note</h2>
            <input
              type="email"
              placeholder="Enter email to share with"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className={styles.input}
            />
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="viewOnceCheckbox"
                checked={viewOnce}
                onChange={(e) => setViewOnce(e.target.checked)}
              />
              <label htmlFor="viewOnceCheckbox">
                🔒 View Once (recipient can only view this note once)
              </label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.submitBtn} onClick={shareNote}>
                Share
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowShareModal({ show: false, noteId: null });
                  setViewOnce(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewOnceModal.show && showViewOnceModal.note && (
        <div className={styles.modal} onClick={closeViewOnceModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.viewOnceModalHeader}>
              <h2>{showViewOnceModal.note.title}</h2>
              <button className={styles.closeBtn} onClick={closeViewOnceModal}>✕</button>
            </div>
            <div className={styles.viewOnceModalBody}>
              <p className={styles.viewOnceWarning}>
                🔒 This is a view-once note. It will be removed after you close this window.
              </p>
              <div className={styles.noteContentDisplay}>
                {showViewOnceModal.note.content}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.submitBtn} onClick={closeViewOnceModal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default function Notes() {
  return (
    <ProtectedRoute>
      <NotesContent />
    </ProtectedRoute>
  );
}
