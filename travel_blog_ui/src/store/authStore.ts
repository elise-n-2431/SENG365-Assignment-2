import { create } from 'zustand';

interface AuthState {
    token: string | null;
    userId: number | null;
    firstName: string | null;
    lastName: string | null;

    login: (token: string, userId: number, firstName: string, lastName: string) => void;
    logout: () => void;
    update: (firstName: string, lastName: string) => void;

    isLoggedIn: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
    token:     localStorage.getItem('token'),
    userId:    Number(localStorage.getItem('userId')) || null,
    firstName: localStorage.getItem('firstName'),
    lastName:  localStorage.getItem('lastName'),

    login: (token, userId, firstName, lastName) => {
        localStorage.setItem('token',     token);
        localStorage.setItem('userId',    String(userId));
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('lastName',  lastName);
        set({ token, userId, firstName, lastName });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        set({ token: null, userId: null, firstName: null, lastName: null });
    },

    update: (firstName: string, lastName: string) => {
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('lastName', lastName);
        set({ firstName, lastName });
    },

    isLoggedIn: () => get().token !== null,

}));

export default useAuthStore;