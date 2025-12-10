import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setProjects,
  setCurrentProject,
  setTemplates,
  addProject,
  updateProject,
  removeProject,
  setLoading,
  setTemplatesLoading,
  setError,
} from '../store/slices/projectSlice';
import { projectService, type CreateProjectData, type Project } from '../services/projectService';

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const { projects, currentProject, templates, loading, templatesLoading, error } = useAppSelector(
    (state) => state.project
  );

  const fetchProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await projectService.getProjects();
      dispatch(setProjects(data));
      
      // Set current project to default or first one
      const defaultProject = data.find((p) => p.isDefault) || data[0] || null;
      dispatch(setCurrentProject(defaultProject));
      
      // Store current project ID in localStorage
      if (defaultProject) {
        localStorage.setItem('currentProjectId', defaultProject.id.toString());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchTemplates = useCallback(async () => {
    try {
      dispatch(setTemplatesLoading(true));
      dispatch(setError(null));
      const data = await projectService.getTemplates();
      dispatch(setTemplates(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setTemplatesLoading(false));
    }
  }, [dispatch]);

  const createProject = useCallback(async (data: CreateProjectData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await projectService.createProject(data);
      dispatch(addProject(response.project));
      dispatch(setCurrentProject(response.project));
      
      // Store current project ID in localStorage
      localStorage.setItem('currentProjectId', response.project.id.toString());
      
      return response.project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const setDefaultProject = useCallback(async (id: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await projectService.setDefaultProject(id);
      
      // Update all projects (unset others, set this one)
      const updatedProjects = projects.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }));
      dispatch(setProjects(updatedProjects));
      
      const updatedProject = updatedProjects.find((p) => p.id === id);
      if (updatedProject) {
        dispatch(setCurrentProject(updatedProject));
        localStorage.setItem('currentProjectId', id.toString());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default project';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, projects]);

  const deleteProject = useCallback(async (id: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await projectService.deleteProject(id);
      dispatch(removeProject(id));
      
      // If deleted project was current, set new current
      if (currentProject?.id === id) {
        const remainingProjects = projects.filter((p) => p.id !== id);
        const newCurrent = remainingProjects.find((p) => p.isDefault) || remainingProjects[0] || null;
        dispatch(setCurrentProject(newCurrent));
        if (newCurrent) {
          localStorage.setItem('currentProjectId', newCurrent.id.toString());
        } else {
          localStorage.removeItem('currentProjectId');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, currentProject, projects]);

  const selectProject = useCallback((project: Project) => {
    dispatch(setCurrentProject(project));
    localStorage.setItem('currentProjectId', project.id.toString());
  }, [dispatch]);

  return {
    projects,
    currentProject,
    templates,
    loading,
    templatesLoading,
    error,
    fetchProjects,
    fetchTemplates,
    createProject,
    setDefaultProject,
    deleteProject,
    selectProject,
  };
};
