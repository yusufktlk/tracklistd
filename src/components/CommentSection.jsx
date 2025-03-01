import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addComment, useComments, deleteComment } from '../hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { FaTrash, FaUser } from 'react-icons/fa';
import Modal from './Modal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

export default function CommentSection({ albumId }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const { currentUser } = useAuth();
  const { data: comments = [], isLoading, error } = useComments(albumId);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function fetchUserProfiles() {
      const profiles = {};
      for (const comment of comments) {
        if (!userProfiles[comment.userId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', comment.userId));
            if (userDoc.exists()) {
              profiles[comment.userId] = userDoc.data();
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      }
      setUserProfiles(prev => ({ ...prev, ...profiles }));
    }

    fetchUserProfiles();
  }, [comments]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!comment.trim() || isSubmitting || !currentUser) return;

    setIsSubmitting(true);
    try {
      const newComment = await addComment(albumId, {
        text: comment.trim(),
        userId: currentUser.uid,
        userEmail: currentUser.email || 'Anonim Kullanıcı'
      });

      setComment('');
      queryClient.setQueryData(['comments', albumId], (old = []) => [newComment, ...old]);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [comment, isSubmitting, currentUser, albumId, queryClient]);

  const handleDeleteClick = useCallback((comment) => {
    setDeleteModalData(comment);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModalData) return;

    try {
      await deleteComment(deleteModalData.id);
      queryClient.setQueryData(['comments', albumId], (old = []) => 
        old.filter(comment => comment.id !== deleteModalData.id)
      );
      setDeleteModalData(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.message);
    }
  }, [deleteModalData, albumId, queryClient]);

  const formatCommentDate = useCallback((date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: tr 
      });
    } catch (error) {
      return 'az önce';
    }
  }, []);

  if (error) {
    console.error('Comments error:', error);
    return <div className="text-red-500">Yorumlar yüklenirken bir hata oluştu</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white mb-6">Yorumlar</h2>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
            rows="3"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
          </button>
        </form>
      ) : (
        <div className="mb-8 text-gray-400">
          Yorum yapmak için <a href="/login" className="text-purple-500 hover:text-purple-400">giriş yapın</a>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400">Yorumlar yükleniyor...</div>
      ) : (
        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <Link 
                    to={`/profile/${comment.userId}`}
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <Avatar
                      src={userProfiles[comment.userId]?.avatar}
                      alt={userProfiles[comment.userId]?.nickname}
                      size="default"
                    />
                  </Link>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        to={`/profile/${comment.userId}`}
                        className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                      >
                        {userProfiles[comment.userId]?.nickname || comment.userEmail}
                      </Link>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                        {currentUser && currentUser.uid === comment.userId && (
                          <button
                            onClick={() => handleDeleteClick(comment)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                            title="Yorumu sil"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">Henüz yorum yapılmamış</div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!deleteModalData}
        onClose={() => setDeleteModalData(null)}
        onConfirm={handleDeleteConfirm}
        title="Yorumu Sil"
        message="Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </div>
  );
} 