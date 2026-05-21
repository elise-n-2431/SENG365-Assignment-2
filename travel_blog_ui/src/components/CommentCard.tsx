import React from 'react';
import { Card, CardContent, Typography, Avatar } from '@mui/material';

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

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-NZ', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Pacific/Auckland',
    });

interface CommentCardProps {
    comment: Comment;
    replyCount?: number;

}

const CommentCard = ({ comment, replyCount }: CommentCardProps) => {
    const [avatarError, setAvatarError] = React.useState(false);
    const commenterImageUrl = `${API_BASE}/users/${comment.commenterId}/image`;
    const commenterName = `${comment.commenterFirstName} ${comment.commenterLastName}`;

    return (
        <Card className="comment-card" variant="outlined">
            <CardContent>
                <div className="comment-card-header">
                    <Avatar
                        src={avatarError ? undefined : commenterImageUrl}
                        alt={commenterName}
                        style={{ width: 32, height: 32, fontSize: 14 }}
                        onError={() => setAvatarError(true)}
                    >
                        {commenterName[0]}
                    </Avatar>
                    <div className="comment-card-meta">
                        <Typography variant="body2" color="text.secondary" className="comment-card-name">
                            {commenterName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="comment-card-date">
                            {formatDate(comment.timestamp)}
                        </Typography>
                    </div>
                </div>
                <Typography variant="body2" className="comment-card-body">{comment.comment}</Typography>
                {comment.parentId === null && replyCount !== undefined && replyCount > 0 && (
                    <Typography variant="caption" className="comment-card-reply-count">
                        {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default CommentCard;