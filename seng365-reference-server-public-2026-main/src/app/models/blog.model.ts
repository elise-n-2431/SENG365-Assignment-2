import {getPool} from "../../config/db";
import {ResultSetHeader, RowDataPacket} from "mysql2";

export const getAllBlogsFromPersistence = async (search: {q: string, startIndex: number, count: number, creatorId: number, categoryIds: number[], cityIds: number[], interactedUserId: number, sortBy: string, numReactions: number}): Promise<BlogReturn> => {
    let query: string = `SELECT DISTINCT
    B.id as blogId,
    B.title as title,
    B.city_id as cityId,
    B.creation_date as creationDate,
    B.creator_id as creatorId,
    B.series as series,
    U.first_name as creatorFirstName,
    U.last_name as creatorLastName,
    (SELECT COUNT(reaction) FROM blog_reactions WHERE blog_id = B.id) as numReactions,
    (SELECT GROUP_CONCAT(C.id) FROM blog_categories BC JOIN category C ON BC.category_id = C.id WHERE BC.blog_id = B.id) as categoryIds
    FROM blog B JOIN user U on B.creator_id = U.id `
    let countQuery: string = `SELECT COUNT(DISTINCT B.id) as count from blog B JOIN user U on B.creator_id = U.id `

    if (search.interactedUserId && search.interactedUserId !== -1) {
        query += `INNER JOIN (SELECT blog_id from blog_reactions BR WHERE BR.user_id = ${search.interactedUserId} UNION SELECT blog_id from blog_comments BC WHERE BC.user_id = ${search.interactedUserId}) I on I.blog_id = B.id `
        countQuery += `INNER JOIN (SELECT blog_id from blog_reactions BR WHERE BR.user_id = ${search.interactedUserId} UNION SELECT blog_id from blog_comments BC WHERE BC.user_id = ${search.interactedUserId}) I on I.blog_id = B.id `
    }

    const whereConditions: string[] = []
    const values: any[] = []
    if (search.q && search.q !== "") {
        whereConditions.push('(title LIKE ? OR description LIKE ?)');
        values.push(`%${search.q}%`);
        values.push(`%${search.q}%`);
    }

    if (search.numReactions !== null && search.numReactions !== -1) {
        whereConditions.push('(SELECT COUNT(reaction) FROM blog_reactions WHERE blog_id = B.id) >= ?');
        values.push(search.numReactions);
    }

    if (search.creatorId && search.creatorId !== -1) {
        whereConditions.push('creator_id = ?');
        values.push(search.creatorId);
    }

    if (search.cityIds && search.cityIds.length) {
        whereConditions.push('city_id in (?)');
        values.push(search.cityIds);
    }

    if (search.categoryIds && search.categoryIds.length) {
        query += `JOIN blog_categories BC ON B.id = BC.blog_id `;
        countQuery += `JOIN blog_categories BC ON B.id = BC.blog_id `;
        whereConditions.push('BC.category_id IN (?)');
        values.push(search.categoryIds);
    }

    if (whereConditions.length) {
        query += `\nWHERE ${(whereConditions ? whereConditions.join(' AND ') : 1)}\n`
        countQuery += `\nWHERE ${(whereConditions ? whereConditions.join(' AND ') : 1)}\n`
    }
    const countValues = [...values];

    const searchSwitch = (sort: string) => ({
        'ALPHABETICAL_ASC': `ORDER BY title ASC`,
        'ALPHABETICAL_DESC': `ORDER BY title DESC`,
        'REACTIONS_ASC': `ORDER BY numReactions ASC`,
        'REACTIONS_DESC': `ORDER BY numReactions DESC`,
        'CREATED_ASC': `ORDER BY creationDate ASC`,
        'CREATED_DESC': `ORDER BY creationDate DESC`
    })[sort];
    query += searchSwitch(search.sortBy) + ', blogId\n';

    if (search.count !== undefined && search.count !== -1) {
        query += 'LIMIT ?\n';
        values.push(search.count);
    }

    if (search.startIndex !== undefined && search.startIndex !== -1) {
        if (search.count === undefined || search.count === -1) {
            query += 'LIMIT ?\n';
            values.push(10000000);
        }
        query += 'OFFSET ?\n';
        values.push(search.startIndex);
    }


    const [rows] = await getPool().query<RowDataPacket[]>(query, values);
    const blogs: Blog[] = rows.map((row) => ({
        blogId: row.blogId,
        title: row.title,
        cityId: row.cityId,
        creationDate: row.creationDate,
        creatorId: row.creatorId,
        creatorFirstName: row.creatorFirstName,
        creatorLastName: row.creatorLastName,
        series: row.series,
        numReactions: row.numReactions,
        categoryIds: row.categoryIds.split(",").map(Number) ?? [],
    }));
    const [countRows] = await getPool().query<RowDataPacket[]>(countQuery, countValues);
    const count: number = Number(countRows[0].count);
    return {blogs, count};
}

export const getBlogFromPersistence = async (blogId: number): Promise<BlogFull> => {
    const query: string = `SELECT
    B.id as blogId,
    B.title as title,
    B.description as description,
    B.city_id as cityId,
    B.creator_id as creatorId,
    B.series as series,
    B.creation_date as creationDate,
    U.first_name as creatorFirstName,
    U.last_name as creatorLastName,
    (SELECT COUNT(reaction) FROM blog_reactions WHERE blog_id = B.id) as numReactions,
    (SELECT GROUP_CONCAT(C.id) FROM blog_categories BC JOIN category C ON BC.category_id = C.id WHERE BC.blog_id = B.id) as categoryIds,
    (SELECT COUNT(DISTINCT C.user_id) FROM blog_comments C WHERE C.blog_id = B.id) AS numberOfUniqueCommenters
    FROM blog B JOIN user U ON B.creator_id = U.id
    WHERE B.id = ?`;
    const [rows] = await getPool().query<RowDataPacket[]>(query, blogId);
    return rows.map(row => ({
        blogId: row.blogId,
        title: row.title,
        cityId: row.cityId,
        creationDate: row.creationDate,
        creatorId: row.creatorId,
        creatorFirstName: row.creatorFirstName,
        creatorLastName: row.creatorLastName,
        series: row.series,
        numReactions: row.numReactions,
        categoryIds: row.categoryIds.split(",").map(Number) ?? [],
        description: row.description,
        numberOfUniqueCommenters: row.numberOfUniqueCommenters
    }))[0];
}


export const addBlogToPersistence = async (blog: {creatorId: number, title: string, description: string, creationDate: string, cityId: number, series: string | null, categoryIds: number[]}): Promise<number> => {
    const query: string = `INSERT INTO blog (creator_id, title, description, creation_date, city_id, series) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await getPool().query<ResultSetHeader>(query, [blog.creatorId, blog.title, blog.description, blog.creationDate, blog.cityId, blog.series])
    if (result.insertId > 0) {
        const categories = blog.categoryIds.map(c => [result.insertId, c]);
        const query2: string = `INSERT INTO blog_categories (blog_id, category_id) VALUES ?`;
        const [result2] = await getPool().query(query2, [categories]);
        return result.insertId;
    } else {
        return -1
    }
}

export const updateBlogInPersistence = async (blog: {blogId: number, title: string, description: string, cityId: number, categoryIds: number[], series: string | null}): Promise<boolean> => {
    const query: string = `UPDATE blog SET title = ?, description = ?, city_id = ?, series = ? WHERE id = ?`;
    const [result] = await getPool().query<ResultSetHeader>(query, [blog.title, blog.description, blog.cityId, blog.series, blog.blogId]);
    if (result.affectedRows > 0) {
        const categories = blog.categoryIds.map(c => [blog.blogId, c]);
        const query2: string = `DELETE FROM blog_categories WHERE blog_id = ?`;
        const [result2] = await getPool().query(query2, [blog.blogId]);
        const query3: string = `INSERT INTO blog_categories (blog_id, category_id) VALUES ?`;
        const [result3] = await getPool().query(query3, [categories]);
        return true;
    }
}

export const deleteBlogFromPersistence = async (blogId: number): Promise<boolean> => {
    const query: string = `DELETE FROM blog WHERE id = ?`;
    const [result] = await getPool().query<ResultSetHeader>(query, [blogId]);
    return result.affectedRows > 0;
}


export const getAllCategories = async (): Promise<Category[]> => {
    const query: string = `SELECT id, name from category`;
    const [rows] = await getPool().query<RowDataPacket[]>(query);
    return rows.map(row => ({
        categoryId: row.id,
        name: row.name,
    }));
}


export const getAllCities = async (): Promise<City[]> => {
    const query: string = `SELECT id, name from city`;
    const [rows] = await getPool().query<RowDataPacket[]>(query);
    return rows.map(row => ({
        cityId: row.id,
        name: row.name,
    }));
}

export const getAllBlogCommentsFromPersistence = async (blogId: number): Promise<BlogComment[]> => {
    const query: string = `SELECT
    C.id as commentId,
    C.user_id as commenterId,
    U.first_name as commenterFirstName,
    U.last_name as commenterLastName,
    C.comment as comment,
    C.timestamp as timestamp,
    C.parent_id as parentId
    from blog_comments C LEFT JOIN user U ON C.user_id = U.id
    WHERE blog_id = ?
    ORDER BY timestamp DESC`;
    const [rows] = await getPool().query<RowDataPacket[]>(query, [blogId]);
    return rows.map(row => ({
        commentId: row.commentId,
        commenterId: row.commenterId,
        commenterFirstName: row.commenterFirstName,
        commenterLastName: row.commenterLastName,
        comment: row.comment,
        timestamp: row.timestamp,
        parentId: row.parentId
    }));
}

export const getAllReactionsFromPersistence = async (blogId: number): Promise<BlogReaction[]> => {
    const query: string = `SELECT
    R.user_id as userId,
    R.reaction as reaction
    from blog_reactions R
    WHERE blog_id = ?
    ORDER BY R.user_id DESC`;
    const [rows] = await getPool().query<RowDataPacket[]>(query, [blogId]);
    return rows.map(row => ({
        userId: row.userId,
        reaction: row.reaction
    }));
}

export const getUserSeries = async (userId: number): Promise<string[]> => {
    const query: string = `SELECT DISTINCT series FROM blog where creator_id = ? AND series IS NOT NULL`;
    const [rows] = await getPool().query<RowDataPacket[]>(query, userId);
    return rows.map(row => (row.series));
}

export const getAllOtherUserSeries = async (userId: number): Promise<string[]> => {
    const query: string = `SELECT DISTINCT series FROM blog where creator_id != ?  AND series IS NOT NULL`;
    const [rows] = await getPool().query<RowDataPacket[]>(query, userId);
    return rows.map(row => (row.series));
}

export const getBlogImageFilename = async (blogId: number): Promise<string> => {
    const query: string = 'SELECT `image_filename` FROM `blog` WHERE id = ?';
    const [rows] = await getPool().query<RowDataPacket[]>(query, [blogId]);
    return rows.length === 0 ? null : rows[0].image_filename;
}

export const setBlogImageFilename = async (blogId: number, filename: string): Promise<void> => {
    const query: string = "UPDATE `blog` SET `image_filename`=? WHERE `id`=?";
    const result = await getPool().query(query, [filename, blogId]);
}

export const getCommentByIdAndBlogId = async (commentId: number, blogId: number): Promise<BlogComment> => {
    const query: string = `SELECT
    C.id as commentId,
    C.user_id as commenterId,
    U.first_name as commenterFirstName,
    U.last_name as commenterLastName,
    C.comment as comment,
    C.timestamp as timestamp,
    C.parent_id as parentId
    from blog_comments C LEFT JOIN user U ON C.user_id = U.id
    WHERE C.id = ? AND C.blog_id = ?`;
    const [rows] = await getPool().query<RowDataPacket[]>(query, [commentId, blogId]);
    return rows.map(row => ({
        commentId: row.commentId,
        commenterId: row.commenterId,
        commenterFirstName: row.commenterFirstName,
        commenterLastName: row.commenterLastName,
        comment: row.comment,
        timestamp: row.timestamp,
        parentId: row.parentId
    }))[0];
}

export const addBlogCommentToPersistence = async (comment: {blogId: number, commenterId: number, comment: string, parentId: number|null}): Promise<number> => {
    const query: string = `INSERT INTO blog_comments (blog_id, user_id, comment, parent_id) VALUES (?, ?, ?, ?)`;
    const [result] = await getPool().query<ResultSetHeader>(query, [comment.blogId, comment.commenterId, comment.comment, comment.parentId]);
    return result.insertId;
}

export const addBlogReactionToPersistence = async (reaction: {blogId: number, userId: number, reaction: string}): Promise<boolean> => {
    const deleteExistingQuery: string = `DELETE FROM blog_reactions WHERE blog_id = ? AND user_id = ?`;
    const [deleteResult] = await getPool().query<ResultSetHeader>(deleteExistingQuery, [reaction.blogId, reaction.userId]);

    const query: string = `INSERT INTO blog_reactions (blog_id, user_id, reaction) VALUES (?, ?, ?)`;
    const [result] = await getPool().query<ResultSetHeader>(query, [reaction.blogId, reaction.userId, reaction.reaction]);
    return result.affectedRows > 0;
}

export const deleteBlogReactionFromPersistence = async (reaction: {blogId: number, userId: number}): Promise<boolean> => {
    const query: string = `DELETE FROM blog_reactions WHERE blog_id = ? AND user_id = ?`;
    const [result] = await getPool().query<ResultSetHeader>(query, [reaction.blogId, reaction.userId]);
    return result.affectedRows > 0;
}
