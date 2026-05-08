import {getPool} from "../../config/db";
import {QueryResult, ResultSetHeader, RowDataPacket} from "mysql2";
import {camelizeKeys} from 'humps';

const register = async(u:userRegister): Promise<number> => {
    const query = "INSERT INTO user (first_name, last_name, email, password) VALUES (?)"
    const [result] = await getPool().query<ResultSetHeader>(query,[[u.firstName, u.lastName, u.email, u.password]]);
    return result.insertId;
}

const findUserByEmail = async(email: string): Promise<user> => {
    const query = 'SELECT * FROM `user` WHERE `email` = ?';
    const [rows] = await getPool().query<RowDataPacket[]>(query, [email]);
    return rows.length === 0 ? null : camelizeKeys(rows[0]) as unknown as user;
}

const findUserByToken = async(token: string): Promise<user> => {
    const query = 'SELECT * FROM `user` WHERE `auth_token` = ?';
    const [rows] = await getPool().query<RowDataPacket[]>(query, [token]);
    return rows.length === 0 ? null : camelizeKeys(rows[0]) as unknown as user;
}

const findUserById = async(id: number): Promise<user> => {
    const query = 'SELECT * FROM `user` WHERE `id` = ?';
    const [rows] = await getPool().query<RowDataPacket[]>(query, [id]);
    return rows.length === 0 ? null : camelizeKeys(rows[0]) as unknown as user;
}

const login = async(id: number, token: string): Promise<number> => {
    const query = "UPDATE user SET auth_token = ? WHERE id = ?"
    const [result] = await getPool().query<ResultSetHeader>(query,[token, id]);
    return result.affectedRows;
}

const logout = async (id: number): Promise<number> => {
    const query = "UPDATE user SET auth_token = ? WHERE id = ?"
    const [result] = await getPool().query<ResultSetHeader>(query,[null, id]);
    return result.affectedRows;
}

const view = async (id: number): Promise<userReturnWithEmail> => {
    const query = "SELECT `first_name`, `last_name`, `email` FROM `user` WHERE `id` = ?"
    const [rows] = await getPool().query<RowDataPacket[]>(query,[id]);
    return rows.length === 0 ? null : camelizeKeys(rows[0]) as unknown as userReturnWithEmail
}

const update = async (u: user): Promise<number> => {
    const query = "UPDATE user SET first_name = ?, last_name = ?, email =?, password=? WHERE id = ?"
    const [result] = await getPool().query<ResultSetHeader>(query,[u.firstName, u.lastName, u.email, u.password, u.id]);
    return result.affectedRows
}

const getImageFilename = async (id:number): Promise<string> => {
    const query = 'SELECT `image_filename` FROM `user` WHERE id = ?'
    const [rows] = await getPool().query<RowDataPacket[]>(query, [id])
    return rows.length === 0 ? null: rows[0].image_filename;
}

const setImageFileName = async (id: number, filename: string): Promise<void> => {
    const query = `UPDATE \`user\` SET image_filename = ? WHERE id = ?`;
    const result = await getPool().query(query, [filename, id]);
}

const removeImageFilename = async (id: number): Promise<void> => {
    const query = `UPDATE \`user\` SET image_filename = NULL WHERE id = ?`;
    const result = await getPool().query(query, [id]);
}


export {register, findUserByEmail, findUserByToken, findUserById, login, logout, view, update, getImageFilename, setImageFileName, removeImageFilename}
