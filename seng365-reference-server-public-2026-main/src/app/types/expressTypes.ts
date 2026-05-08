// tslint:disable-next-line:no-namespace
import {RequestHandler} from "express";

export interface AuthenticatedLocals {
    authId?: number;
}

export type IdParams = { id: string };

export type IdRequestHandler<
    ResBody = any,
    ReqBody = any,
    ReqQuery = any
> = RequestHandler<IdParams, ResBody, ReqBody, ReqQuery>;

export type AuthenticatedIdRequestHandler<
    ResBody = any,
    ReqBody = any,
    ReqQuery = any
> = RequestHandler<IdParams, ResBody, ReqBody, ReqQuery, AuthenticatedLocals>;
