export interface Task {
    _id: string;
    content: string;
    description?: string; // <--- Add
    priority: "Low" | "Medium" | "High"; // <--- Add
    dueDate?: string; // <--- Add (Dates come as strings from JSON)
}

export interface Column {
    _id: string;
    title: string;
    taskIds: Task[]; // In the frontend, we will map this to the actual Task objects
}

export interface Board { // If you don't have this interface, create it
    _id: string;
    title: string;
    background: string; // <--- Add this
    columnOrder: Column[];
}