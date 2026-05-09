import axios from 'axios';
import React from "react"
import {Link} from 'react-router-dom';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, TextField, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const card: React.CSSProperties = {
    padding: "10px",
    margin: "20px",
}


const Users = () => {

    const [users, setUsers] = React.useState <Array<User>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const [dialogUser, setDialogUser] = React.useState<User>({ username: "", user_id: -1 })

    const handleDeleteDialogOpen = (user: User) => {
        setDialogUser(user)
        setOpenDeleteDialog(true);
    };

    const handleDeleteDialogClose = () => {
        setDialogUser({ username: "", user_id: -1 })
        setOpenDeleteDialog(false);
    };

    interface HeadCell {
        id: string;
        label: string;
        numeric: boolean;
    }
    const headCells: readonly HeadCell[] = [
        { id: 'ID', label: 'id', numeric: true },
        { id: 'username', label: 'Username', numeric: false },
        { id: 'link', label: 'Link', numeric: false },
        { id: 'actions', label: 'Actions', numeric: false }
    ];

    const [addUserUsername, setAddUserUsername] = React.useState("")

    const addUser = () => {
        if (addUserUsername === "") {
            return
        }
        axios.post('http://localhost:3000/api/users', { "username": addUserUsername })
            .then(() => {
                getUsers()
                setAddUserUsername("")
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }


    React.useEffect(() => {
        getUsers()
    }, [])

    const getUsers = () => {
        axios.get('http://localhost:3000/api/users')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUsers(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const list_of_users = () => {
        return users.map((item: User) =>
            <tr key={item.user_id}>
                <th scope="row">{item.user_id}</th>
                <td>{item.username}</td>
                <td><Link to={"/users/" + item.user_id}>Go to
                    user</Link></td>
                <td>
                    <Button variant="outlined" endIcon={<DeleteIcon />} onClick={() => { handleDeleteDialogOpen(item)
                    }}>
                        Delete
                    </Button>
                    <button type="button">Edit</button>
                </td>
            </tr>
        )
    }

    const deleteUser = () => {
        axios.delete('http://localhost:3000/api/users/' + dialogUser.user_id)
            .then(() => {
                setUsers(users.filter(u => u.user_id !== dialogUser.user_id))
                handleDeleteDialogClose()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const user_rows = () => {
        return users.map((row: User) =>
            <TableRow hover
                      tabIndex={-1}
                      key={row.user_id}>
                <TableCell>
                    {row.user_id}
                </TableCell>
                <TableCell align="right">{row.username}</TableCell>
                <TableCell align="right"><Link
                    to={"/users/" + row.user_id}>Go to user</Link></TableCell>
                <TableCell align="right">
                    <Button variant="outlined" endIcon={<EditIcon />} onClick={() => { handleEditDialogOpen(row) }}>
                        Edit
                    </Button>
                    <Button variant="outlined" endIcon={<DeleteIcon />} onClick={() => { handleDeleteDialogOpen(row)
                    }}>
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
        )
    }

    const handleEditDialogOpen = (user: User) => {
        // implement later
    };

    if (errorFlag) {
        return (
            <div>
                <h1>Users</h1>
                <div style={{color: "red"}}>
                    {errorMessage}
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <Paper elevation={3} style={card}>
                    <h1>Users</h1>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.numeric ? 'right' :
                                                'left'}
                                            padding={'normal'}>
                                            {headCell.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {user_rows()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                <Paper elevation={3} style={card}>
                    <h1>Add a new user</h1>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <TextField id="outlined-basic" label="Username" variant="outlined" value={addUserUsername}
                                   onChange={(event) => setAddUserUsername(event.target.value)} />
                        <Button variant="outlined" onClick={() => { addUser() }}>
                            Submit
                        </Button>
                    </Stack>
                </Paper>



                <Dialog
                    open={openDeleteDialog}
                    onClose={handleDeleteDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        {"Delete User?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete this user?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                        <Button variant="outlined" color="error" onClick={() => {
                            deleteUser()
                        }} autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        )
    }
}

export default Users;