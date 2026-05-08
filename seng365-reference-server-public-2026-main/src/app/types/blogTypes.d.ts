type Blog = {
    blogId: number;
    title: string;
    cityId: number;
    categoryIds: number[];
    numReactions: number;
    creatorId: number;
    creationDate: string;
    creatorFirstName: string;
    creatorLastName: string;
    series: string | null;
}

type BlogFull = Blog & {
    description: string;
    numberOfUniqueCommenters: number;
}

type BlogQuery = {
    q: string;
    startIndex: string;
    count: string;
    cityIds: string | string[];
    categoryIds: string | string[];
    creatorId: string;
    sortBy: string;
    interactedByMe: string;
    numReactions: string;
}

type BlogReturn = {
    count: number;
    blogs: Blog[];
}

type Category = {
    categoryId: number;
    name: string;
}

type City = {
    cityId: number;
    name: string;
}

type BlogComment = {
    commentId: number;
    comment: string;
    commenterId: number;
    commenterFirstName: string;
    commenterLastName: string;
    timestamp: string;
    parentId: number;
}

type BlogReaction = {
    userId: number,
    reaction: string
}
