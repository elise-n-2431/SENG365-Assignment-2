import React from 'react';
import axios from 'axios';
import CommentCard from './CommentCard';
import { Button, TextField } from '@mui/material';

interface Comment {
    commentId: number;
    commenterId: number;
    comment: string;
    commenterFirstName: string;
    commenterLastName: string;
    timestamp: string;
    parentId: number | null;
}

const API_BASE = 'http://localhost:4941/api/v1';

const CommentSection = ({ blogId, userId }: { blogId: number, userId: number | null }) => {
    const [comments, setComments] = React.useState<Comment[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);

    const [newComment, setNewComment] = React.useState('');
    const [replyText, setReplyText] = React.useState('');
    const [replyingTo, setReplyingTo] = React.useState<number | null>(null); // commentId being replied to

    const loggedInUserId = Number(localStorage.getItem("userId"));
    const isLoggedIn = loggedInUserId !== null && !isNaN(loggedInUserId);
    const isBlogCreator = loggedInUserId === Number(userId);
    const canComment = isLoggedIn && !isBlogCreator;


    const token = localStorage.getItem('token');

    const fetchComments = () => {
        axios.get(`${API_BASE}/blogs/${blogId}/comments`)
            .then((res) => setComments(res.data))
            .catch(() => setErrorFlag(true));
    };

    React.useEffect(() => {
        fetchComments();
    }, [blogId]);

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        axios.post(`${API_BASE}/blogs/${blogId}/comments`,
            { comment: newComment },
            { headers: { 'X-Authorization': token } }
        ).then(() => {
            setNewComment('');
            fetchComments();
        });
    };

    const handlePostReply = (parentId: number) => {
        if (!replyText.trim()) return;
        axios.post(`${API_BASE}/blogs/${blogId}/comments`,
            { comment: replyText, parentId },
            { headers: { 'X-Authorization': token } }
        ).then(() => {
            setReplyText('');
            setReplyingTo(null);
            fetchComments();
        });
    };

    if (errorFlag) return <div>Failed to load comments.</div>;

    const grouped = new Map<number, Comment[]>();
    const topLevel: Comment[] = [];

    for (const comment of comments) {
        if (comment.parentId === null) {
            topLevel.push(comment);
            if (!grouped.has(comment.commentId)) grouped.set(comment.commentId, []);
        } else {
            if (!grouped.has(comment.parentId)) grouped.set(comment.parentId, []);
            grouped.get(comment.parentId)!.push(comment);
        }
    }

    return (
        <div id="comments">
            {canComment ? (
                <div className="comment-input">
                    <TextField fullWidth multiline rows={2} size="small" placeholder="Leave a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <Button variant="contained" size="small" onClick={handlePostComment}>Post Comment</Button>
                </div>
            ) : isBlogCreator ? (
                <p className="comment-notice">You cannot comment on your own blog.</p>
            ) : (
                <p className="comment-notice">Log in to leave a comment.</p>
            )}

            {!comments.length && <div>No comments yet.</div>}

            {topLevel.map((parent) => {
                const replies = grouped.get(parent.commentId) ?? [];
                const isReplying = replyingTo === parent.commentId;
                return (
                    <div key={parent.commentId} className="comment-thread">
                        <CommentCard comment={parent} replyCount={replies.length} />
                        <div className="comment-replies">
                            {replies.map((reply) => (
                                <CommentCard key={reply.commentId} comment={reply} />
                            ))}
                        </div>
                        {canComment && (
                            <div className="comment-reply-input">
                                {!isReplying ? (
                                    <Button className="reply_button" size="small" onClick={() => { setReplyingTo(parent.commentId); setReplyText(''); }}>
                                        Reply
                                    </Button>
                                ) : (
                                    <>
                                        <TextField fullWidth multiline rows={2} size="small" placeholder={`Replying to ${parent.commenterFirstName}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                                        <div className="comment-reply-actions">
                                            <Button variant="contained" size="small" onClick={() => handlePostReply(parent.commentId)}>Post Reply</Button>
                                            <Button size="small" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CommentSection;