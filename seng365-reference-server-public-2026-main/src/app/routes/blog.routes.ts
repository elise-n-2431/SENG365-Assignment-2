import {Express} from "express";
import {rootUrl} from "./base.routes";
import {authenticate, relaxedAuthenticate} from "../middleware/auth.middleware";
import {
    addBlog,
    deleteBlog,
    getAllBlogs,
    getBlog,
    getCategories,
    getCities,
    updateBlog
} from "../controllers/blog.controller";
import {
    addCommentToBlog,
    deleteReactionFromBlog,
    getAllBlogComments,
    getAllBlogReactions,
    reactToBlog
} from "../controllers/blog.interaction.controller";
import {getBlogImage, setBlogImage} from "../controllers/blog.image.controller";


module.exports = (app: Express) => {
    app.route(rootUrl + '/blogs')
        .get(relaxedAuthenticate, getAllBlogs)
        .post(authenticate, addBlog);

    app.route(rootUrl + '/blogs/categories')
        .get(getCategories);

    app.route(rootUrl + '/blogs/cities')
        .get(getCities);

    app.route(rootUrl+'/blogs/:id')
        .get(getBlog)
        .patch(authenticate, updateBlog)
        .delete(authenticate, deleteBlog);

    app.route(rootUrl + '/blogs/:id/react')
        .get(getAllBlogReactions)
        .post(authenticate, reactToBlog)
        .delete(authenticate, deleteReactionFromBlog);

    app.route(rootUrl + '/blogs/:id/comments')
        .get(getAllBlogComments)
        .post(authenticate, addCommentToBlog);

    app.route(rootUrl + '/blogs/:id/image')
        .get(getBlogImage)
        .put(authenticate, setBlogImage);

}
