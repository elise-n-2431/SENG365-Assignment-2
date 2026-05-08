import {RequestHandler} from "express";
import Logger from "../../config/logger";
import * as schemas from '../resources/schemas.json';
import {AuthenticatedIdRequestHandler, IdRequestHandler} from "../types/expressTypes";
import {validate} from "../services/validator";
import {
    addBlogToPersistence, deleteBlogFromPersistence, getAllBlogCommentsFromPersistence,
    getAllBlogsFromPersistence,
    getAllCategories,
    getAllCities, getAllOtherUserSeries,
    getBlogFromPersistence, getUserSeries, updateBlogInPersistence
} from "../models/blog.model";
import * as User from '../models/user.model';

export const getAllBlogs: AuthenticatedIdRequestHandler<BlogReturn, void, BlogQuery> = async (req, res) => {
    try {
        const validation = await validate(schemas.blog_search, req.query);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`
            res.status(400).send();
            return;
        }

        let q = '';
        if (req.query.hasOwnProperty("q")) {
            q = req.query.q;
        }

        let numReactions: number = 0;
        if (req.query.hasOwnProperty("numReactions")) {
            numReactions = parseInt(req.query.numReactions, 10);
        }

        let creatorId: number = -1;
        if (req.query.hasOwnProperty("creatorId"))
            creatorId = parseInt(req.query.creatorId, 10);

        let startIndex: number = -1;
        if (req.query.hasOwnProperty("startIndex"))
            startIndex = parseInt(req.query.startIndex, 10);

        let count: number = -1;
        if (req.query.hasOwnProperty("count"))
            count = parseInt(req.query.count, 10);

        let categoryIds: number[] = [];
        if (req.query.hasOwnProperty("categoryIds")) {
            if (!Array.isArray(req.query.categoryIds))
                categoryIds = [parseInt(req.query.categoryIds, 10)];
            else
                categoryIds = (req.query.categoryIds).map((x: string) => parseInt(x, 10));
        }
        const categories: Category[] = await getAllCategories();
        if (!categoryIds.every(c => categories.map(x => x.categoryId).includes(c))) {
            res.statusMessage = `Bad Request: No category with id`;
            res.status(400).send();
            return;
        }

        let cityIds: number[] = [];
        if (req.query.hasOwnProperty("cityIds")) {
            if (!Array.isArray(req.query.cityIds))
                cityIds = [parseInt(req.query.cityIds, 10)];
            else
                cityIds = (req.query.cityIds).map((x: string) => parseInt(x, 10));
        }
        const cities: City[] = await getAllCities();
        if (!cityIds.every(c => cities.map(x => x.cityId).includes(c))) {
            res.statusMessage = `Bad Request: No city with id`;
            res.status(400).send();
            return;
        }

        let interactedUserId: number = -1;
        if (req.query.hasOwnProperty("interactedByMe") && req.query.interactedByMe === 'true') {
            if (res.locals.authId !== undefined) {
                if (res.locals.authId === -2) {
                    res.statusMessage = `Invalid authorization token`
                    res.status(401).send();
                    return;
                }
                if (res.locals.authId === -1) {
                    // test suite will allow either 400 or 403
                    res.statusMessage = `Must supply X-Authorization header when passing 'interactedByMe' query parameter`;
                    res.status(400).send();
                    return;
                }
                interactedUserId = res.locals.authId;
            }

        }

        let sortBy = 'CREATED_DESC';
        if (req.query.hasOwnProperty("sortBy")) {
            sortBy = req.query.sortBy;
        }

        const blogResponse: BlogReturn = await getAllBlogsFromPersistence({q, startIndex, count, creatorId, categoryIds, cityIds, interactedUserId, sortBy, numReactions});
        res.status(200).send(blogResponse);
        return;
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const getBlog: IdRequestHandler<BlogFull> = async (req, res) => {
    try {
        const blogId: number = parseInt(req.params.id);
        if (isNaN(blogId)) {
            res.statusMessage = "blogId must be an integer";
            res.status(400).send();
            return;
        }
        const blog: BlogFull = await getBlogFromPersistence(blogId);
        if (blog !== undefined && blog !== null) {
            res.status(200).send(blog);
            return;
        } else {
            res.status(404).send();
            return;
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const addBlog: AuthenticatedIdRequestHandler = async (req, res) => {
    try {
        const validation = await validate(schemas.blog_post, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        const d: Date = new Date();
        const creationDate: string = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`

        const cities: City[] = await getAllCities();
        if (!cities.find(c => c.cityId === req.body.cityId)) {
            res.statusMessage = "No city with id";
            res.status(400).send();
            return;
        }

        const categories: Category[] = await getAllCategories();
        for (const cId of req.body.categoryIds) {
            if (!categories.find(c => c.categoryId === cId)) {
                res.statusMessage = "No category with id";
                res.status(400).send();
                return;
            }
        }

        const series: string[] = await getAllOtherUserSeries(res.locals.authId);
        let seriesToAdd: string | null = null
        if (req.body.series !== undefined && req.body.series !== null) {
            if(series.map(s => s.toLowerCase()).includes(req.body.series.toLowerCase())) {
                res.statusMessage = "Series name already taken";
                res.status(403).send();
                return;
            }
            seriesToAdd = req.body.series;
        }

        const insertedBlogId = await addBlogToPersistence({creatorId: res.locals.authId, title: req.body.title, description: req.body.description, creationDate: creationDate, cityId: req.body.cityId, series: seriesToAdd, categoryIds: req.body.categoryIds});
        if (insertedBlogId !== -1) {
            res.status(201).send({"blogId": insertedBlogId});
            return;
        } else {
            res.statusMessage = "Failed to insert blog";
            res.status(500).send();
            return;
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const updateBlog: AuthenticatedIdRequestHandler = async (req, res) => {
    try {
        const validation = await validate(schemas.blog_patch, req.body);
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
        if (blog.creatorId !== res.locals.authId) {
            res.statusMessage = "Cannot edit a blog created by another user";
            res.status(403).send();
            return;
        }

        let title: string = blog.title;
        if (req.body.hasOwnProperty("title")) {
            title = req.body.title;
        }
        let description: string = blog.description;
        if (req.body.hasOwnProperty("description")) {
            description = req.body.description;
        }

        let cityId: number = blog.cityId;
        if (req.body.hasOwnProperty("cityId")) {
            const cities: City[] = await getAllCities();
            if (!cities.find(c => c.cityId === req.body.cityId)) {
                res.statusMessage = "No city with id";
                res.status(400).send();
                return;
            }
            cityId = req.body.cityId;
        }

        let categoryIds: number[] = blog.categoryIds;
        if (req.body.hasOwnProperty("categoryIds")) {
            const categories: Category[] = await getAllCategories();
            for (const cId of req.body.categoryIds) {
                if (!categories.find(c => c.categoryId === cId)) {
                    res.statusMessage = "No category with id";
                    res.status(400).send();
                    return;
                }
            }
            categoryIds = req.body.categoryIds;
        }

        let series: string | null = blog.series
        if (req.body.hasOwnProperty("series")) {
            if (series !== null) {
                res.statusMessage = "Cannot change series once set";
                res.status(403).send();
                return;
            }
            const otherSeries: string[] = await getAllOtherUserSeries(res.locals.authId);
            if (req.body.series !== undefined && req.body.series !== null) {
                if(otherSeries.map(s => s.toLowerCase()).includes(req.body.series.toLowerCase())) {
                    res.statusMessage = "Series name already taken";
                    res.status(403).send();
                    return;
                }
            }
            series = req.body.series;
        }

        const updatedSuccessfully: boolean = await updateBlogInPersistence({blogId, title, description, cityId, categoryIds, series});
        if (updatedSuccessfully) {
            res.status(200).send();
            return
        } else {
            res.statusMessage = "Failed to update blog";
            res.status(500).send();
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const deleteBlog: AuthenticatedIdRequestHandler = async (req, res) => {
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
        if (blog.creatorId !== res.locals.authId) {
            res.statusMessage = "Cannot delete a blog created by another user";
            res.status(403).send();
            return;
        }

        const comments: BlogComment[] = await getAllBlogCommentsFromPersistence(blogId);
        if (comments.length > 0) {
            res.statusMessage = 'Cannot delete a blog that has comments posted';
            res.status(403).send()
        }

        const isDeleted: boolean = await deleteBlogFromPersistence(blogId);
        if (isDeleted) {
            res.status(200).send();
            return;
        } else {
            // failed to delete?
            res.status(500).send();
            return;
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const getCategories: RequestHandler<void, Category[]> = async(req, res): Promise<void> => {
    try {
        const categories: Category[] = await getAllCategories();
        res.status(200).send(categories)
        return;
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const getCities: RequestHandler<void, City[]> = async(req, res): Promise<void> => {
    try {
        const cities: City[] = await getAllCities();
        res.status(200).send(cities);
        return;
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const getSeries: IdRequestHandler<string[]> = async (req, res): Promise<void> => {
    try {
        const userId: number = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            res.statusMessage = "userId must be an integer";
            res.status(400).send();
            return;
        }

        const user: user = await User.findUserById(userId);
        if (user === null || user === undefined) {
            res.status(404).send();
            return;
        }

        const userSeries: string[] = await getUserSeries(userId);
        res.status(200).send(userSeries);
        return
    } catch (error) {
        Logger.error(error);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}
