import { api } from "./api";

// for getting all problems
export const get_all_problems = async () => {
  return await api.get("/question/all");
};

// for getting a single problem by id
export const get_problem_by_id = async (problemId) => {
  return await api.get(`/question/id/${problemId}`);
};

// for creating a new problem
export const create_problem = async (problemData) => {
  return await api.post("/question/create", problemData);
};

// for updating an existing problem
export const update_problem = async (problemId, problemData) => {
  return await api.put(`/question/update/${problemId}`, problemData);
};

// for creating draft problem
export const create_draft_problem = async () => {
  return await api.post("/question/draft/create");
};

// get all published problems
export const get_published_problems = async () => {
  return await api.get("/question/all-published");
};

// get all problems created by the logged in user
export const get_user_authored_problems = async () => {
  return await api.get(`/question/all-authored`);
};