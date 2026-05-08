import Logger from "../../config/logger";
import {AuthenticatedIdRequestHandler, IdRequestHandler} from "../types/expressTypes";
import {
    getAllBlogCommentsFromPersistence,
    getAllReactionsFromPersistence,
    getBlogFromPersistence,
    addBlogCommentToPersistence, getCommentByIdAndBlogId, addBlogReactionToPersistence,
    deleteBlogReactionFromPersistence
} from "../models/blog.model";
import {validate} from "../services/validator";
import * as schemas from "../resources/schemas.json";


export const getAllBlogReactions: IdRequestHandler = async (req, res) => {
    try {
        const blogId: number = parseInt(req.params.id, 10);
        if (isNaN(blogId)) {
            res.statusMessage = "blogId must be an integer";
            res.status(400).send();
            return;
        }
        const blog: BlogFull = await getBlogFromPersistence(blogId);
        if (blog === null || blog === undefined) {
            res.status(404).send();
            return;
        }
        const reactions: BlogReaction[] = await getAllReactionsFromPersistence(blogId);
        res.status(200).send(reactions);
        return;
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const reactToBlog: AuthenticatedIdRequestHandler = async (req, res) => {
    try {
        const validation = await validate(schemas.blog_react, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }

        const blogId: number = parseInt(req.params.id, 10);
        if (isNaN(blogId)) {
            res.statusMessage = "blogId must be an integer";
            res.status(400).send();
            return;
        }
        const blog: BlogFull = await getBlogFromPersistence(blogId);
        if (blog === null || blog === undefined) {
            res.status(404).send();
            return;
        }

        if (blog.creatorId === res.locals.authId) {
            res.statusMessage = "Cannot react to your own blog";
            res.status(403).send();
            return;
        }

        const result = await addBlogReactionToPersistence({blogId, userId: res.locals.authId, reaction: req.body.reaction,})
        if (result) {
            res.status(200).send();
            return;
        } else {
            res.statusMessage = "Failed to add reaction";
            res.status(500).send();
            return;
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const deleteReactionFromBlog: AuthenticatedIdRequestHandler = async (req, res) => {
    try {
        const blogId: number = parseInt(req.params.id, 10);
        if (isNaN(blogId)) {
            res.statusMessage = "blogId must be an integer";
            res.status(400).send();
            return;
        }
        const blog: BlogFull = await getBlogFromPersistence(blogId);
        if (blog === null || blog === undefined) {
            res.status(404).send();
            return;
        }

        const result = await deleteBlogReactionFromPersistence({blogId, userId: res.locals.authId})
        if (result) {
            res.status(200).send();
            return;
        } else {
            res.statusMessage = "Can not delete a reaction that does not exist";
            res.status(403).send();
            return;
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const getAllBlogComments: IdRequestHandler = async (req, res) => {
    try {
        const blogId: number = parseInt(req.params.id, 10);
        if (isNaN(blogId)) {
            res.statusMessage = "blogId must be an integer";
            res.status(400).send();
            return;
        }
        const blog: BlogFull = await getBlogFromPersistence(blogId);
        if (blog === null || blog === undefined) {
            res.status(404).send();
            return;
        }
        const comments: BlogComment[] = await getAllBlogCommentsFromPersistence(blogId);
        res.status(200).send(comments);
        return;
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const addCommentToBlog: AuthenticatedIdRequestHandler = async (req, res) => {
    try {
        const validation = await validate(schemas.blog_comment_post, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }

        const blogId: number = parseInt(req.params.id, 10);
        if (isNaN(blogId)) {
            res.statusMessage = "blogId must be an integer";
            res.status(400).send();
            return;
        }
        const blog: BlogFull = await getBlogFromPersistence(blogId);
        if (blog === null || blog === undefined) {
            res.status(404).send();
            return;
        }

        let parentId: number | null = null;
        if (req.body.hasOwnProperty("parentId") && req.body.parentId !== null) {
            const parentCommentId: number = parseInt(req.body.parentId, 10);
            const parentComment: BlogComment = await getCommentByIdAndBlogId(parentCommentId, blogId);
            if (parentComment) {
                if (parentComment.parentId !== null) {
                    res.statusMessage = "Parent comment already has a parent";
                    res.status(403).send(); // or 400>
                    return;
                }
                parentId = parentCommentId;
            } else {
                res.statusMessage = "Parent comment does not exist";
                res.status(404).send(); // or 403?
                return;
            }
        }

        const commentAdded = await addBlogCommentToPersistence({blogId, commenterId: res.locals.authId, comment: req.body.comment, parentId})
        if (commentAdded) {
            res.status(201).send();
            return;
        } else {
            res.statusMessage = "Failed to add comment";
            res.status(500).send();
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}
