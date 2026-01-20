import axios from "axios";
import type { Column, Task } from "../types";

export const API_URL = "http://localhost:5000/api";

// Setup Interceptor to automatically add the Token to every request
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ===== BOARD ENDPOINTS =====

export const fetchBoard = async (boardId?: string): Promise<any> => {
    const url = boardId ? `${API_URL}/boards/${boardId}` : `${API_URL}/board`;
    const response = await axios.get(url);
    return response.data;
};

export const updateBoardTitle = async (boardId: string, title: string): Promise<any> => {
    const response = await axios.put(`${API_URL}/boards/${boardId}`, { title });
    return response.data;
};

export const deleteBoard = async (boardId: string): Promise<void> => {
    await axios.delete(`${API_URL}/boards/${boardId}`);
};

// ===== COLUMN ENDPOINTS =====

export const createColumn = async (title: string, boardId: string): Promise<Column> => {
    const response = await axios.post(`${API_URL}/boards/${boardId}/columns`, { title });
    return response.data;
};

export const deleteColumn = async (columnId: string): Promise<void> => {
    await axios.delete(`${API_URL}/columns/${columnId}`);
};

export const updateColumnTitle = async (columnId: string, title: string): Promise<Column> => {
    const response = await axios.put(`${API_URL}/columns/${columnId}`, { title });
    return response.data;
};

// FIXED: Now requires boardId parameter
export const moveColumn = async (boardId: string, newColumnOrder: string[]): Promise<void> => {
    await axios.put(`${API_URL}/boards/${boardId}/reorder`, { newColumnOrder });
};

// ===== TASK ENDPOINTS =====

export const addTask = async (columnId: string, content: string): Promise<Task> => {
    const response = await axios.post(`${API_URL}/columns/${columnId}/tasks`, { content });
    return response.data;
};

export const updateTaskContent = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, updates);
    return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
    await axios.delete(`${API_URL}/tasks/${taskId}`);
};

export const moveTask = async (taskId: string, targetColumnId: string, newIndex: number): Promise<void> => {
    await axios.put(`${API_URL}/tasks/move`, { taskId, targetColumnId, newIndex });
};

export const updateBoardBackground = async (boardId: string, background: string): Promise<any> => {
    const response = await axios.put(`${API_URL}/boards/${boardId}`, { background });
    return response.data;
};