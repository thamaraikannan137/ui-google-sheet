import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Project, Template } from '../../services/projectService';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  templates: Template[];
  loading: boolean;
  templatesLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  templates: [],
  loading: false,
  templatesLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      // If it's the first project or default, set as current
      if (state.projects.length === 1 || action.payload.isDefault) {
        state.currentProject = action.payload;
      }
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
        if (action.payload.isDefault) {
          state.currentProject = action.payload;
        }
      }
    },
    removeProject: (state, action: PayloadAction<number>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = state.projects.find((p) => p.isDefault) || state.projects[0] || null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTemplatesLoading: (state, action: PayloadAction<boolean>) => {
      state.templatesLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProjects: (state) => {
      state.projects = [];
      state.currentProject = null;
      state.templates = [];
      state.loading = false;
      state.templatesLoading = false;
      state.error = null;
    },
  },
});

export const {
  setProjects,
  setCurrentProject,
  setTemplates,
  addProject,
  updateProject,
  removeProject,
  setLoading,
  setTemplatesLoading,
  setError,
  clearError,
  clearProjects,
} = projectSlice.actions;

export default projectSlice.reducer;
