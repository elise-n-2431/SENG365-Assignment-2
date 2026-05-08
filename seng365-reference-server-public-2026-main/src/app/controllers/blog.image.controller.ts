import Logger from "../../config/logger";
import {AuthenticatedIdRequestHandler, IdRequestHandler} from "../types/expressTypes";
import {addImage, readImage, removeImage} from "../models/images.model";
import {getBlogFromPersistence, getBlogImageFilename, setBlogImageFilename} from "../models/blog.model";
import {getImageExtension} from "../models/imageTools";

export const getBlogImage: IdRequestHandler = async (req, res): Promise<void> => {
    try {
        const blogId: number = parseInt(req.params.id, 10);
        if (isNaN(blogId)) {
            res.statusMessage = "Game id must be an integer"
            res.status(400).send();
            return;
        }
        const filename: string = await getBlogImageFilename(blogId)
        if(filename == null) {
            res.status(404).send();
            return;
        }
        const [image, mimetype]  = await readImage(filename)
        res.status(200).contentType(mimetype).send(image)
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

export const setBlogImage: AuthenticatedIdRequestHandler = async (req, res): Promise<void> => {
    try {
        let isNew:boolean = true;
        const blogId: number = parseInt(req.params.id, 10);
        if (isNaN(blogId)) {
            res.statusMessage = "Id must be an integer"
            res.status(400).send();
            return;
        }
        const image = req.body;
        const blog: BlogFull = await getBlogFromPersistence(blogId);
        if (blog == null){
            res.statusMessage = "No such blog"
            res.status(404).send();
            return;
        }
        if(res.locals.authId !== blog.creatorId) {
            res.statusMessage = "Cannot modify another user's blog";
            res.status(403).send();
            return;
        }
        const mimeType: string = req.header('Content-Type');
        const fileExt: string = getImageExtension(mimeType);
        if (fileExt == null) {
            res.statusMessage = 'Bad Request: photo must be image/jpeg, image/png, image/gif type, but it was: ' + mimeType;
            res.status(400).send();
            return;
        }

        if (image.length === undefined) {
            res.statusMessage = 'Bad request: empty image';
            res.status(400).send();
            return;
        }

        const filename: string = await getBlogImageFilename(blogId);
        if(filename != null && filename !== "") {
            await removeImage(filename);
            isNew = false;
        }
        const newFilename: string = await addImage(image, fileExt);
        await setBlogImageFilename(blogId, newFilename);
        if(isNew) {
            res.status(201).send()
            return;
        } else {
            res.status(200).send()
            return;
        }
    } catch (error) {
        Logger.error(error);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}
