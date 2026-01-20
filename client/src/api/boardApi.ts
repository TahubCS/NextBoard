import axios from "axios";
import type { Column, Task } from "../types";

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL that includes /api
const api = axios.create({
    baseURL: `${API_URL}/api`
});

// Setup Interceptor to automatically add the Token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ===== BOARD ENDPOINTS =====

export const fetchBoard = async (boardId?: string): Promise<any> => {
    const url = boardId ? `/boards/${boardId}` : `/boards`;
    const response = await api.get(url);
    return response.data;
};

export const updateBoardTitle = async (boardId: string, title: string): Promise<any> => {
    const response = await api.put(`/boards/${boardId}`, { title });
    return response.data;
};

export const deleteBoard = async (boardId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}`);
};

// ===== COLUMN ENDPOINTS =====

export const createColumn = async (title: string, boardId: string): Promise<Column> => {
    const response = await api.post(`/boards/${boardId}/columns`, { title });
    return response.data;
};

export const deleteColumn = async (columnId: string): Promise<void> => {
    await api.delete(`/columns/${columnId}`);
};

export const updateColumnTitle = async (columnId: string, title: string): Promise<Column> => {
    const response = await api.put(`/columns/${columnId}`, { title });
    return response.data;
};

export const moveColumn = async (boardId: string, newColumnOrder: string[]): Promise<void> => {
    await api.put(`/boards/${boardId}/reorder`, { newColumnOrder });
};

// ===== TASK ENDPOINTS =====

export const addTask = async (columnId: string, content: string): Promise<Task> => {
    const response = await api.post(`/columns/${columnId}/tasks`, { content });
    return response.data;
};

export const updateTaskContent = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
};

export const moveTask = async (taskId: string, targetColumnId: string, newIndex: number): Promise<void> => {
    await api.put(`/tasks/move`, { taskId, targetColumnId, newIndex });
};

export const updateBoardBackground = async (boardId: string, background: string): Promise<any> => {
    const response = await api.put(`/boards/${boardId}`, { background });
    return response.data;
};

// Export the api instance in case you need it elsewhere
export default api;