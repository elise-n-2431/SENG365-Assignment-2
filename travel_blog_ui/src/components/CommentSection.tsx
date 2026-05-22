import React from 'react';
import axios from 'axios';
import CommentCard from './CommentCard';
import { Button, TextField } from '@mui/material';
import CommentIcon from "@mui/icons-material/Comment";
import GroupIcon from '@mui/icons-material/Group';
import {ConfirmDialog} from "./PopUp.tsx";
import {useNavigate} from "react-router-dom";
import useAuthStore from "../store/authStore.ts";

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
    const navigate = useNavigate();
    const loggedInUserIdRaw = useAuthStore(state => state.userId);
    const token = useAuthStore(state => state.token);


    const [comments, setComments] = React.useState<Comment[]>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);

    const [newComment, setNewComment] = React.useState('');
    const [replyText, setReplyText] = React.useState('');
    const [replyingTo, setReplyingTo] = React.useState<number | null>(null); // commentId being replied to

    const loggedInUserId = Number(loggedInUserIdRaw);
    const isLoggedIn = !!loggedInUserIdRaw && !isNaN(loggedInUserId);

    const isBlogCreator = loggedInUserId === Number(userId);
    const [uniqueCommenters, setUniqueCommenters] = React.useState(0);
    const [signInOpen, setSignInOpen] = React.useState(false);


    const fetchComments = () => {
        axios.get(`${API_BASE}/blogs/${blogId}/comments`)
            .then((res) => {
                setComments(res.data);
                const uniqueIds = new Set(res.data.map((c: Comment) => c.commenterId));
                setUniqueCommenters(uniqueIds.size);
            })
            .catch(() => setErrorFlag(true));
    };

    React.useEffect(() => {
        fetchComments();
    }, [blogId]);


    const handlePostComment = () => {
        if (!isLoggedIn) { setSignInOpen(true); return; }
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
        if (!isLoggedIn) { setSignInOpen(true); return; }
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

            <ConfirmDialog
                open={signInOpen}
                title="Sign In"
                message="User sign in is required to perform this task"
                confirmLabel="Sign In"
                onConfirm={() => { navigate(`/login`); setSignInOpen(false); }}
                onCancel={() => setSignInOpen(false)}
            />


            <div className="comment-stats">
                <GroupIcon fontSize="small" color="action" />
                <p>{uniqueCommenters} contributor{uniqueCommenters !== 1 ? 's' : ''}</p>
                <CommentIcon fontSize="small" color="action" />
                <p>{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
            </div>
            {!isBlogCreator ? (
                <div className="comment-input">
                    <TextField fullWidth multiline rows={2} size="small" placeholder="Leave a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <Button variant="contained" size="small" onClick={handlePostComment}>Post Comment</Button>
                </div>
            ) : (
                <p className="comment-notice">You cannot comment on your own blog.</p>
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
                        {!isBlogCreator && (
                            <div className="comment-reply-input">
                                {!isReplying ? (
                                    <Button className="reply_button" size="small" onClick={() => {
                                        if (!isLoggedIn) { setSignInOpen(true); return; }
                                        setReplyingTo(parent.commentId);
                                        setReplyText('');
                                    }}>
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